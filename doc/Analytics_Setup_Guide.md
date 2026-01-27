# Umami Analytics 配置指南

本文档提供 Umami 数据分析的快速配置和使用指南。

---

## 1. 快速开始

### 1.1 环境配置已完成 ✅

项目已配置好开发环境的 Umami 追踪:

- **开发环境 Website ID**: `8133b90d-9f06-4b08-a1ef-9f522a35490d`
- **配置文件**: `.env.development`
- **脚本加载**: `index.html` (自动根据环境加载)

### 1.2 本地开发测试

启动开发服务器后,所有埋点事件会在浏览器控制台输出:

```bash
npm run dev
```

打开浏览器控制台,你会看到类似输出:

```
[Analytics] ls_page_ready { tool: 'LogoSilhouette', tool_version: 'v1', ... }
[Analytics] ls_hero_view { tool: 'LogoSilhouette', tool_version: 'v1', ... }
[Analytics] ls_image_uploaded { file_type: 'image/png', file_size_kb: 245, ... }
```

这说明埋点系统工作正常!

---

## 2. 生产环境配置

### 2.1 创建生产 Website

1. 登录 Umami Cloud: https://umami-rose-delta.vercel.app
2. 点击 **"Settings"** → **"Websites"** → **"Add website"**
3. 填写网站信息:
   - **Name**: LogoSilhouette Production
   - **Domain**: logosilhouette.com
   - **Enable share URL**: 可选
4. 创建成功后,复制新的 **Website ID**

### 2.2 更新生产配置

编辑 `.env.production` 文件:

```bash
# Production Environment
VITE_UMAMI_WEBSITE_ID=<粘贴你的生产 Website ID>
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js
```

### 2.3 构建和部署

```bash
# 构建生产版本 (会自动使用 .env.production 配置)
npm run build

# 部署 dist/ 目录到你的服务器
```

### 2.4 验证生产环境

部署后访问生产网站,在 Umami Dashboard 中查看 **Real-time** 面板:
- 应该能看到实时访问量
- 点击几个按钮,在 **Events** 中应该能看到 `ls_*` 开头的自定义事件

---

## 3. 埋点集成指南

### 3.1 架构概览

```
src/analytics/
├── tracker.ts    # 追踪器基础类 (已完成)
├── events.ts     # 事件定义 (已完成)
└── index.ts      # 统一导出 (已完成)
```

### 3.2 在组件中使用

**导入**:
```typescript
import { events } from '@/analytics'
```

**调用示例**:

```typescript
// 1. 图片上传成功
const handleImageUpload = (file: File, img: HTMLImageElement) => {
  events.imageUploaded({
    fileType: file.type,
    fileSizeKb: Math.round(file.size / 1024),
    imgW: img.width,
    imgH: img.height,
  })
}

// 2. 预设切换
const handlePresetChange = (preset: string) => {
  events.presetSelected(preset, preset === 'clean')
}

// 3. 导出成功
const handleExportComplete = (format: string, resolution: number) => {
  const endTime = Date.now()
  events.exportCompleted({
    format,
    resolution,
    durationMs: endTime - startTime,
    fileSizeKb: Math.round(blob.size / 1024),
  })
}
```

### 3.3 待集成组件清单

详见 [LogoSilhouette_数据埋点方案.md - 6.2 待实施](./LogoSilhouette_数据埋点方案.md#62-待实施-) 章节。

**优先级高**:
1. ✅ `ImageUploader.tsx` - 上传事件
2. ✅ `ExportPanel.tsx` - 导出事件
3. ✅ `useProcessor.ts` - 处理事件

**优先级中**:
4. `PresetSelector.tsx` - 预设切换
5. `AdvancedSettings.tsx` - 参数调整
6. `Hero.tsx` - Hero 区交互

**优先级低**:
7. `App.tsx` - 页面级事件 (scroll, section view)
8. `Header.tsx` - 导航点击
9. `FAQ.tsx` - FAQ 交互

---

## 4. Umami Dashboard 使用

### 4.1 查看实时数据

1. 登录 Umami: https://umami-rose-delta.vercel.app
2. 选择 **Website**: LogoSilhouette Development (或 Production)
3. 点击 **Real-time** 标签查看实时访问

### 4.2 查看自定义事件

1. 点击左侧 **Events** 菜单
2. 你会看到所有 `ls_*` 开头的自定义事件
3. 点击某个事件名查看详细数据:
   - 触发次数
   - 唯一用户数
   - 事件参数分布

### 4.3 创建转化漏斗

1. 点击 **Funnels** → **Create funnel**
2. 添加步骤 (按顺序):
   ```
   页面访问 (Page view)
     ↓
   ls_hero_view
     ↓
   ls_image_uploaded
     ↓
   ls_process_completed
     ↓
   ls_export_download
   ```
3. 保存后可查看各步骤转化率

### 4.4 按参数过滤

在事件详情页,可以按参数筛选:
- 按 `format` 查看各导出格式占比
- 按 `utm_source` 查看各流量来源效果
- 按 `preset` 查看各预设使用情况

---

## 5. 常见问题

### Q1: 开发环境看不到控制台日志?

**检查**:
- 确认 `.env.development` 文件存在
- 确认浏览器控制台没有过滤 `[Analytics]`
- 确认 `import.meta.env.DEV` 为 `true`

### Q2: 生产环境数据没有上报?

**检查**:
1. 打开浏览器开发者工具 → Network 标签
2. 过滤请求包含 `umami`
3. 应该能看到 POST 请求到 `https://umami-rose-delta.vercel.app/api/send`
4. 检查请求 payload 是否包含正确的 `website` ID

**可能原因**:
- `.env.production` 中的 `VITE_UMAMI_WEBSITE_ID` 未正确配置
- 浏览器广告拦截插件屏蔽了 Umami 脚本
- 用户网络无法访问 Umami Cloud

### Q3: 如何测试特定事件?

在浏览器控制台手动调用:

```javascript
// 1. 检查 window.umami 是否存在
window.umami

// 2. 手动触发事件
window.umami.track('ls_test_event', {
  tool: 'LogoSilhouette',
  test_param: 'test_value'
})

// 3. 到 Umami Dashboard → Real-time 查看是否收到
```

### Q4: 如何区分不同部署环境?

如果有多个部署环境 (dev / staging / prod),建议:

1. 在 Umami 中创建 3 个独立的 Website
2. 创建对应的环境变量文件:
   ```
   .env.development       # 本地开发
   .env.staging          # 预发布环境
   .env.production       # 生产环境
   ```
3. 部署时使用对应的环境变量:
   ```bash
   # Staging
   npm run build -- --mode staging

   # Production
   npm run build -- --mode production
   ```

### Q5: 如何导出数据?

Umami Cloud 免费版支持数据导出:

1. 在 Dashboard 中选择时间范围
2. 点击右上角 **Export** 按钮
3. 选择 CSV 或 JSON 格式下载

---

## 6. 最佳实践

### 6.1 事件命名

- 使用 `ls_` 前缀区分项目
- 使用 `_` 分隔单词 (不用驼峰)
- 格式: `ls_<模块>_<动作>`
- 示例: `ls_export_completed`, `ls_hero_view`

### 6.2 参数命名

- 使用 snake_case (不用 camelCase)
- 保持简洁有意义
- 示例: `file_size_kb`, `duration_ms`, `img_w`

### 6.3 性能考虑

- 使用 `defer` 加载 Umami 脚本 (已配置)
- 避免在紧密循环中调用 `events.*`
- 批量操作只在开始/结束时埋点

### 6.4 隐私保护

- 不上报用户个人信息 (邮箱、姓名、IP)
- 不上报文件名称和内容
- 只上报统计分析所需的聚合数据

---

## 7. 资源链接

- **完整埋点方案**: [LogoSilhouette_数据埋点方案.md](./LogoSilhouette_数据埋点方案.md)
- **Umami 官方文档**: https://umami.is/docs
- **Umami Cloud Dashboard**: https://umami-rose-delta.vercel.app
- **Umami API 文档**: https://umami.is/docs/api

---

**最后更新**: 2026-01-27
