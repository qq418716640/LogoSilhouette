# LogoSilhouette 技术实现方案

> 基于需求文档的技术评估与实现指南
> 版本：v1
> 日期：2025-01-19

---

## 一、项目概述

LogoSilhouette 是一个**纯前端**的 Logo 剪影生成工具，核心特点：

- 单页应用（Landing Page + 嵌入式工具）
- 所有图像处理在浏览器端完成
- 不涉及后端服务

---

## 二、技术栈选型

| 层面 | 推荐方案 | 理由 |
|-----|---------|------|
| 构建工具 | **Vite** | 文档已指定，快速启动 |
| 语言 | **TypeScript** | 文档已指定，类型安全 |
| UI 框架 | **React** 或 **Vue 3** | 看团队熟悉度 |
| 状态管理 | **Zustand**（React）/ **Pinia**（Vue） | 轻量级，足够应对 |
| 样式方案 | **Tailwind CSS** | 快速开发，SEO 友好 |

### 推荐依赖库

| 功能 | 推荐库 | 版本 | 体积 |
|-----|-------|------|------|
| 位图描摹 | `potrace` | 2.x | ~30KB |
| Worker 通信 | `comlink` | 4.x | ~5KB |
| 状态管理 | `zustand` | 4.x | ~3KB |
| 样式 | `tailwindcss` | 3.x | 按需 |

---

## 三、图像处理管线技术方案

这是项目的核心难点，需要在浏览器中实现完整的图像处理流程。

### 3.1 Pipeline 各步骤技术选型

| 步骤 | 技术方案 | 说明 |
|-----|---------|------|
| **resize512** | Canvas 2D `drawImage` | 原生 API，性能好 |
| **thresholdBW** | Canvas `getImageData` + 像素遍历 | 灰度公式: `0.299R + 0.587G + 0.114B` |
| **denoiseLite** | 形态学开闭操作（自实现） | 基于连通域面积过滤 |
| **detectMainComponent** | Flood-fill / Union-Find | 两者皆可，Union-Find 更适合 Worker |
| **autoCrop** | 遍历找 bounding box | 简单直接 |
| **traceToSvg** | **potrace.js** (推荐) | potrace 质量更好 |
| **cleanSvg** | SVG DOM 解析 + 路径过滤 | 删除白色 `fill="#fff"` 的路径 |

### 3.2 位图描摹（Vectorization）方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|-----|------|------|-------|
| **potrace.js** | 成熟算法、输出质量高、支持简化参数 | 需引入库（~30KB） | ★★★★★ |
| **imagetracer.js** | 纯 JS、体积小 | 输出质量一般 | ★★★ |
| 自研 Marching Squares | 无依赖 | 开发成本高、效果难保证 | ★★ |

**建议**: 使用 `potrace-js` 或其 Emscripten 移植版 `potrace-wasm`，后者性能更好。

### 3.3 Pipeline 伪代码

```typescript
function runPipeline(input: ImageData, params: ProcessParams, startAt: PipelineStep) {
  let work = cache.resized
  let bw = cache.bwImage
  let bw2 = cache.denoised
  let cropped = cache.cropped
  let svg = cache.svgRaw
  let svgClean = cache.svgClean

  if (startAt <= 'resize') {
    work = resize512(input)
  }

  if (startAt <= 'bw') {
    bw = thresholdBW(work, params.threshold, params.invert)
  }

  if (startAt <= 'denoise') {
    bw2 = denoiseLite(bw, params.denoiseLevel, params.removeSpecksMinArea, params.fillHolesMaxArea)
  }

  if (startAt <= 'crop') {
    const bbox = findLargestComponent(bw2, params.minMainComponentAreaPct)
    if (bbox && params.autoCrop) {
      cropped = crop(work, bbox, params.cropPaddingPct)
      bw2 = crop(bw2, bbox, params.cropPaddingPct)
    } else {
      cropped = work
    }
  }

  if (startAt <= 'trace') {
    svg = traceSvg(bw2, params.pathOmit)
  }

  if (startAt <= 'clean') {
    svgClean = cleanSvg(svg)
  }

  return { svgClean, work, bw2, cropped }
}
```

---

## 四、前端架构方案

### 4.1 核心状态结构设计

```typescript
interface AppState {
  // 源图像
  sourceImage: ImageBitmap | null
  sourceInfo: { width: number; height: number; type: string }

  // 当前预设与参数
  activePreset: 'minimal_logo' | 'clean_silhouette' | 'keep_details'
  params: ProcessParams

  // 处理结果（缓存中间产物）
  pipeline: {
    resized: ImageData | null
    bwImage: ImageData | null
    denoised: ImageData | null
    cropped: ImageData | null
    svgRaw: string | null
    svgClean: string | null
  }

  // 导出配置
  exportFormat: 'svg' | 'png' | 'jpg'
  exportResolution: 512 | 1024 | 2048

  // UI 状态
  isProcessing: boolean
  advancedOpen: boolean
}

interface ProcessParams {
  threshold: number          // 黑白阈值
  invert: boolean            // 是否反相
  denoiseLevel: 'off' | 'low' | 'medium' | 'high'
  removeSpecksMinArea: number // 去小黑点
  fillHolesMaxArea: number   // 填洞
  autoCrop: boolean          // 是否裁剪
  cropPaddingPct: number     // 裁剪留边
  minMainComponentAreaPct: number // 主体最小面积
  pathOmit: number           // SVG 简化程度
}
```

### 4.2 增量重算策略

文档明确要求参数变更时**不重跑整个 pipeline**，需要实现依赖追踪：

```typescript
const STEP_DEPENDENCIES: Record<string, PipelineStep> = {
  threshold: 'bw',
  invert: 'bw',
  denoiseLevel: 'denoise',
  removeSpecksMinArea: 'denoise',
  fillHolesMaxArea: 'denoise',
  autoCrop: 'crop',
  cropPaddingPct: 'crop',
  minMainComponentAreaPct: 'crop',
  pathOmit: 'trace'
}

// 参数变更 → 计算最早需要重跑的 step
function getStartStep(changedParam: string): PipelineStep {
  return STEP_DEPENDENCIES[changedParam] || 'resize'
}
```

### 4.3 增量重算规则表

| 变更参数 | 起跑 Step |
|---------|----------|
| threshold / invert | bw |
| denoiseLevel / removeSpecksMinArea / fillHolesMaxArea | denoise |
| autoCrop / cropPaddingPct / minMainComponentAreaPct | crop |
| pathOmit | trace |
| 导出分辨率 | 不重跑 |

---

## 五、Web Worker 实现方案

### 5.1 架构设计

```
主线程                           Worker 线程
   │                                │
   │──── postMessage(runPipeline) ──►│
   │     { imageData, params,        │
   │       startStep }               │
   │                                │ 执行处理...
   │◄─── postMessage(result) ────────│
   │     { svgClean, previews }      │
```

### 5.2 数据传输优化

| 数据类型 | 传输方式 | 说明 |
|---------|---------|------|
| ImageData | **Transferable** | 使用 `postMessage(data, [data.data.buffer])` 零拷贝 |
| SVG 字符串 | 普通传输 | 体积小，无需优化 |
| 配置参数 | 普通传输 | 结构化克隆 |

### 5.3 Worker 通信封装（使用 Comlink）

```typescript
// workers/processor.worker.ts
import * as Comlink from 'comlink'

const api = {
  async runPipeline(
    imageData: ImageData,
    params: ProcessParams,
    startStep: PipelineStep
  ): Promise<PipelineResult> {
    // ... 处理逻辑
    return { svgClean, bwPreview }
  }
}

Comlink.expose(api)

// main thread
import * as Comlink from 'comlink'

const worker = new Worker(
  new URL('./workers/processor.worker.ts', import.meta.url),
  { type: 'module' }
)
const api = Comlink.wrap<typeof import('./workers/processor.worker').api>(worker)

// 调用
const result = await api.runPipeline(imageData, params, 'bw')
```

### 5.4 降级策略

```typescript
const workerSupported = typeof Worker !== 'undefined'

async function process(imageData: ImageData, params: ProcessParams, startStep: PipelineStep) {
  if (workerSupported) {
    return await workerApi.runPipeline(imageData, params, startStep)
  } else {
    // 主线程同步执行（配合 requestIdleCallback 分片）
    return runPipelineSync(imageData, params, startStep)
  }
}
```

---

## 六、导出功能技术方案

### 6.1 三种格式实现

| 格式 | 实现方案 | 关键点 |
|-----|---------|--------|
| **SVG** | 直接输出 `svgClean` 字符串 | 添加 XML 声明、viewBox |
| **PNG** | Canvas `toBlob('image/png')` | 透明背景，正方形居中 |
| **JPG** | Canvas `toBlob('image/jpeg', 0.92)` | 先绘制白色背景 |

### 6.2 分辨率放大策略

由于内部处理尺寸为 512px，导出 1024/2048 需要放大：

**SVG 导出**：直接修改 viewBox，矢量无损

**PNG/JPG 导出**：

```typescript
async function exportRaster(
  svg: string,
  size: 512 | 1024 | 2048,
  format: 'png' | 'jpg'
): Promise<Blob> {
  const canvas = new OffscreenCanvas(size, size)
  const ctx = canvas.getContext('2d')!

  // JPG 需要先铺白底
  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
  }

  // SVG → Image → Canvas
  const img = new Image()
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  img.src = URL.createObjectURL(blob)

  await img.decode()

  // 居中绘制（contain）
  const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)

  URL.revokeObjectURL(img.src)

  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
  return canvas.convertToBlob({ type: mimeType, quality: 0.92 })
}
```

### 6.3 SVG 导出

```typescript
function exportSvg(svgClean: string): Blob {
  const svgWithDeclaration = `<?xml version="1.0" encoding="UTF-8"?>\n${svgClean}`
  return new Blob([svgWithDeclaration], { type: 'image/svg+xml' })
}
```

### 6.4 下载触发

```typescript
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 使用示例
const blob = await exportRaster(svgClean, 1024, 'png')
downloadBlob(blob, 'logo-silhouette-1024.png')
```

---

## 七、数据埋点实现方案

### 7.1 Umami 集成架构

```typescript
// analytics/tracker.ts
interface TrackOptions {
  tool: string
  tool_version: string
  page: string
  locale: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  ab_variant?: string
}

class Tracker {
  private commonData: TrackOptions

  constructor() {
    this.commonData = {
      tool: 'LogoSilhouette',
      tool_version: 'v1',
      page: '/logosilhouette',
      locale: navigator.language,
      ...this.parseUtmParams()
    }
  }

  private parseUtmParams(): Partial<TrackOptions> {
    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined
    }
  }

  track(event: string, data?: Record<string, any>) {
    if (typeof umami !== 'undefined') {
      umami.track(event, { ...this.commonData, ...data })
    }
  }
}

export const tracker = new Tracker()
```

### 7.2 MVP 必埋事件封装

```typescript
// analytics/events.ts
import { tracker } from './tracker'

export const events = {
  // Hero 区
  heroSampleClick: (sampleId: string) =>
    tracker.track('ls_hero_sample_click', { sample_id: sampleId }),

  // 上传
  imageUploaded: (info: { type: string; sizeKb: number; w: number; h: number }) =>
    tracker.track('ls_image_uploaded', {
      file_type: info.type,
      file_size_kb: info.sizeKb,
      img_w: info.w,
      img_h: info.h
    }),

  sampleLoaded: (sampleId: string) =>
    tracker.track('ls_sample_loaded', { sample_id: sampleId }),

  // 预设
  presetSelected: (preset: string, isDefault: boolean) =>
    tracker.track('ls_preset_selected', { preset, is_default: isDefault }),

  // 处理
  processStarted: (trigger: string, startStep: string) =>
    tracker.track('ls_process_started', { trigger, start_step: startStep }),

  processCompleted: (durationMs: number, fallbackNoCrop: boolean) =>
    tracker.track('ls_process_completed', { duration_ms: durationMs, fallback_no_crop: fallbackNoCrop }),

  // 导出配置
  exportFormat: (format: string) =>
    tracker.track('ls_export_format', { format }),

  exportResolution: (resolution: number) =>
    tracker.track('ls_export_resolution', { resolution }),

  // 导出执行
  exportClick: (data: { format: string; resolution: number; preset: string; hasResult: boolean }) =>
    tracker.track('ls_export_click', data),

  exportCompleted: (data: { format: string; resolution: number; durationMs: number; sizeKb: number }) =>
    tracker.track('ls_export_completed', data),

  exportFailed: (data: { format: string; resolution: number; stage: string; errorCode: string }) =>
    tracker.track('ls_export_failed', data),

  // 导航
  navClick: (data: { location: string; linkId: string; to: string }) =>
    tracker.track('ls_nav_click', data),

  outboundMainProduct: (to: string) =>
    tracker.track('ls_outbound_main_product', { to })
}
```

### 7.3 埋点触发位置规划

| 事件 | 触发位置 | 触发时机 |
|-----|---------|---------|
| `ls_hero_sample_click` | Hero 区 Sample 按钮 | 点击即触发 |
| `ls_image_uploaded` | 上传组件 `onFileSelect` | 文件读取成功后 |
| `ls_sample_loaded` | Sample 加载逻辑 | 示例图加载完成 |
| `ls_preset_selected` | 预设切换按钮 `onClick` | 点击即触发 |
| `ls_process_started` | Worker 调度前 | `runPipeline` 调用前 |
| `ls_process_completed` | Worker 返回后 | 收到结果后 |
| `ls_export_format` | 格式选择器 `onChange` | 切换即触发 |
| `ls_export_resolution` | 分辨率选择器 `onChange` | 切换即触发 |
| `ls_export_click` | 下载按钮 `onClick` | 点击即触发 |
| `ls_export_completed` | Blob 生成后 | 下载触发前 |
| `ls_export_failed` | 导出异常 catch | 捕获异常时 |
| `ls_nav_click` | 导航链接 `onClick` | 点击即触发 |
| `ls_outbound_main_product` | 主产品链接 `onClick` | 点击即触发 |

---

## 八、项目目录结构

```
src/
  main.ts                      # 入口
  App.tsx                      # 页面结构

  store/
    index.ts                   # 全局状态（Zustand）
    types.ts                   # 状态类型定义

  presets/
    presets.ts                 # 预设参数表（冻结）
    types.ts                   # 预设类型定义

  core/
    pipeline/
      runPipeline.ts           # 管线调度与依赖判断
      dependencies.ts          # 参数变化 → 起跑 step
      types.ts                 # Pipeline 类型定义
    steps/
      resize512.ts             # 内部尺寸统一
      thresholdBW.ts           # 灰度 + 阈值
      denoiseLite.ts           # 轻量降噪
      cropMain.ts              # 主体裁剪（最大连通域）
      traceSvg.ts              # 位图描摹
      cleanSvg.ts              # 删除白色路径
    utils/
      connectedComponents.ts   # 连通域算法
      geometry.ts              # 几何计算工具

  workers/
    processor.worker.ts        # Worker 入口
    types.ts                   # Worker 通信类型

  export/
    exportSvg.ts               # SVG 导出
    exportPng.ts               # PNG 导出
    exportJpg.ts               # JPG 导出
    download.ts                # 下载触发

  analytics/
    tracker.ts                 # Umami 封装
    events.ts                  # 事件定义

  components/
    Hero/
      Hero.tsx
      UploadButton.tsx
      SampleButton.tsx
    EmbeddedApp/
      EmbeddedApp.tsx
      PresetSelector.tsx
      AdvancedSettings.tsx
      Preview.tsx
      ExportPanel.tsx
    Landing/
      HowItWorks.tsx
      Features.tsx
      UseCases.tsx
      FAQ.tsx
      FinalCTA.tsx

  assets/
    samples/                   # 示例图片

  styles/
    index.css                  # Tailwind 入口
```

---

## 九、技术风险与应对

### 9.1 主要风险点

| 风险 | 严重程度 | 应对方案 |
|-----|---------|---------|
| **potrace 描摹质量不稳定** | 中 | 预设参数需大量测试调优 |
| **连通域算法复杂图像耗时** | 中 | 512px 工作尺寸已限制，实测可接受 |
| **Safari Worker 兼容性** | 低 | 使用 `type: 'module'` 需验证，准备降级方案 |
| **大文件上传内存溢出** | 低 | 前置尺寸限制（如 4096px） |
| **OffscreenCanvas 兼容性** | 低 | 降级到普通 Canvas |

### 9.2 兼容性检查清单

- [ ] Chrome 90+
- [ ] Firefox 90+
- [ ] Safari 15+
- [ ] Edge 90+
- [ ] iOS Safari 15+
- [ ] Android Chrome 90+

---

## 十、开发阶段建议

### 第一阶段：核心 Pipeline

- 实现 `resize512` → `thresholdBW` → `traceSvg` → `cleanSvg`
- 暂时跳过降噪和裁剪
- 验证基本描摹效果

### 第二阶段：完整 Pipeline

- 补全 `denoiseLite` 和 `cropMain`
- 实现连通域算法
- 调试三个预设的参数效果

### 第三阶段：Worker 隔离

- 将 Pipeline 迁移到 Worker
- 实现 Comlink 通信
- 实现增量重算逻辑

### 第四阶段：导出功能

- 实现 SVG / PNG / JPG 三种格式导出
- 实现分辨率选择
- 实现下载触发

### 第五阶段：UI 完善

- 预设切换 UI
- 高级设置面板
- Preview 切换（原图 / 黑白 / SVG）

### 第六阶段：Landing Page

- SEO 内容区域
- FAQ 组件
- Schema 结构化数据

### 第七阶段：埋点集成

- Umami 脚本引入
- MVP 事件埋点
- 数据验证

---

## 十一、验收 Checklist

- [ ] 默认预设（Minimal Logo）可直接生成可用剪影
- [ ] Worker 不阻塞 UI（处理时页面可滚动）
- [ ] SVG 导出后可在 Figma/Illustrator 中编辑
- [ ] PNG 导出透明背景正确
- [ ] JPG 导出白色背景正确
- [ ] 三种分辨率（512/1024/2048）正确
- [ ] 参数变更时增量重算生效
- [ ] Sample Logo 走完整 Pipeline
- [ ] Umami 导出事件正常上报
- [ ] 页面 Lighthouse SEO 评分 > 90

---

## 十二、总结

| 维度 | 评估结论 |
|-----|---------|
| **技术可行性** | 完全可行，无需后端依赖 |
| **核心难点** | 位图描摹质量调优、增量重算逻辑 |
| **预估复杂度** | 中等偏上（主要在图像算法调试） |
| **推荐技术栈** | Vite + TypeScript + React/Vue + Zustand + Tailwind + potrace + Comlink |

---

**文档维护人**：LogoSilhouette 技术团队
**版本**：v1
