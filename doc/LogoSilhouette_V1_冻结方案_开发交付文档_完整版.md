# LogoSilhouette V1 冻结方案 · 开发交付文档（完整版）

> 面向对象：**前端 / 全栈 / 技术负责人**  
> 产品名：**LogoSilhouette**  
> 版本：**V1（冻结 · 实现级）**  
> 产品形态：**单页 Landing Page + Embedded App**  
> 目标：**开发可直接按此实现，不再反复对齐需求**

---

## 0. 文档说明（非常重要）

- 本文档是 **V1 的最终实现依据**
- 已整合以下全部成果：
  - V1 冻结产品方案
  - **A：项目目录结构 + 数据流**
  - **B：预设参数表（精确映射）**
  - **C：核心处理管线（伪代码级）**
- 除非产品负责人明确变更，**实现不得偏离本方案**

---

## 1. 产品核心目标（V1）

- 用户 **3 秒内可开始使用**
- 默认预设直接生成 **可用 Logo 剪影**
- **导出成功** 是唯一核心转化
- SEO Landing Page 即工具本体

---

## 2. 页面与路由结构（冻结）

- 单一路由：`/logosilhouette`
- Landing Page = Tool Page（无 Tool Page 概念）

页面结构顺序（不可调整）：
```
Hero（Upload / Sample）
Embedded App（工具）
---------------------
How it works
Features
Use cases
FAQ
Final CTA
```

---

## 3. 项目目录结构（A · 实现级）

> 技术建议：Vite + TypeScript + Web Worker

```
src/
  main.ts                  # 入口
  app/
    App.tsx                # 页面结构
    state.ts               # 全局状态（image / params / results）
  presets/
    presets.ts             # 预设参数表（冻结）
    types.ts
  core/
    pipeline/
      runPipeline.ts       # 管线调度与依赖判断
      dependencies.ts      # 参数变化 → 起跑 step
    steps/
      resize512.ts         # 内部尺寸统一
      thresholdBW.ts       # 灰度 + 阈值
      denoiseLite.ts       # 轻量降噪
      cropMain.ts          # 主体裁剪（最大连通域）
      traceSvg.ts          # 位图描摹
      cleanSvg.ts          # 删除白色路径
    utils/
      connectedComponents.ts
      geometry.ts
  workers/
    processor.worker.ts    # Worker 入口
    types.ts
  export/
    exportSvg.ts
    exportPng.ts
    exportJpg.ts
```

---

## 4. 数据流与模块职责（A）

**主线程**
- UI 渲染
- 参数变更
- Preview 切换
- 导出触发

**Worker**
- 图像处理
- 连通域分析
- SVG 描摹

数据流：
```
User Action
 → main thread
 → worker.runPipeline(startStep)
 → worker returns outputs
 → main thread updates preview/export
```

---

## 5. 预设参数表（B · 冻结）

### 参数定义

| 参数 | 说明 |
|----|----|
| threshold | 黑白阈值 |
| invert | 是否反相 |
| denoiseLevel | off / low / medium / high |
| removeSpecksMinArea | 去小黑点 |
| fillHolesMaxArea | 填洞 |
| autoCrop | 是否裁剪 |
| cropPaddingPct | 裁剪留边 |
| minMainComponentAreaPct | 主体最小面积 |
| pathOmit | SVG 简化程度 |

---

### 5.1 Minimal Logo（默认）

```
threshold: 175
invert: false
denoiseLevel: high
removeSpecksMinArea: 140
fillHolesMaxArea: 220
autoCrop: true
cropPaddingPct: 8
minMainComponentAreaPct: 1.2
pathOmit: 18
```

适用：Logo / 图标 / 激光切割

---

### 5.2 Clean Silhouette

```
threshold: 160
invert: false
denoiseLevel: medium
removeSpecksMinArea: 80
fillHolesMaxArea: 120
autoCrop: true
cropPaddingPct: 6
minMainComponentAreaPct: 1.0
pathOmit: 10
```

适用：通用剪影

---

### 5.3 Keep Details

```
threshold: 145
invert: false
denoiseLevel: low
removeSpecksMinArea: 40
fillHolesMaxArea: 60
autoCrop: true
cropPaddingPct: 4
minMainComponentAreaPct: 0.8
pathOmit: 4
```

适用：细节轮廓

---

## 6. 图像处理管线（C · 核心）

### 6.1 内部统一规则

- 工作图：**最长边缩放至 512px（等比）**

---

### 6.2 Pipeline 顺序（不可改）

```
decodeImage
 → resize512
 → thresholdBW
 → denoiseLite
 → detectMainComponent
 → autoCrop
 → traceToSvg
 → cleanSvg
```

---

### 6.3 Worker 伪代码（关键）

```ts
function runPipeline(input, params, startAt) {
  if (startAt <= 'resize') work = resize512(input)
  if (startAt <= 'bw') bw = thresholdBW(work, params)
  if (startAt <= 'denoise') bw2 = denoiseLite(bw, params)
  if (startAt <= 'crop') {
    bbox = findLargestComponent(bw2, params.minMainComponentAreaPct)
    cropped = bbox ? crop(work, bbox, params.cropPaddingPct) : work
    bw2 = bbox ? crop(bw2, bbox, params.cropPaddingPct) : bw2
  }
  if (startAt <= 'trace') svg = traceSvg(bw2, params.pathOmit)
  if (startAt <= 'clean') svgClean = cleanSvg(svg)
  return { svgClean, work, bw2 }
}
```

---

## 7. 增量重算规则（性能关键）

| 变更 | 起跑 Step |
|----|----|
| threshold / invert | bw |
| denoiseLevel | denoise |
| crop 参数 | crop |
| pathOmit | trace |
| 导出分辨率 | 不重跑 |

---

## 8. 导出规范（冻结）

- SVG：透明，仅黑色路径
- PNG：透明，512 / 1024 / 2048
- JPG：白底，512 / 1024 / 2048

渲染规则：
- 正方形画布
- 居中 contain
- JPG 先铺白底

---

## 9. Sample Logo 机制（冻结）

- Sample 与真实上传 **走完全同一管线**
- Sample 用于 activation，不是 demo

---

## 10. 不在 V1 范围

- 批量
- 登录
- OpenCV
- 云端存储

---

## 11. 验收 Checklist

- [ ] 默认预设可直接导出
- [ ] Worker 不阻塞 UI
- [ ] SVG 可编辑
- [ ] 导出尺寸准确
- [ ] Umami 导出事件正常

---

**文档状态**：V1 冻结（实现级）  
**维护人**：LogoSilhouette 产品团队
