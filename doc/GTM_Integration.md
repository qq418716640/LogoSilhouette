# Google Tag Manager (GTM) 集成说明

## 概述

LogoSilhouette 项目已集成 Google Tag Manager，**仅在生产环境启用**，开发和预发布环境不会加载 GTM 代码。

## 配置信息

### 生产环境 GTM ID

```
GTM-WMJSMTWF
```

### 环境配置

| 环境 | GTM 状态 | 配置文件 |
|------|---------|----------|
| 开发环境 (Development) | ❌ 不加载 | `.env.development` (无 GTM 配置) |
| 预发布环境 (Staging) | ❌ 不加载 | `.env.staging` (无 GTM 配置) |
| 生产环境 (Production) | ✅ 加载 | `.env.production` |

## 技术实现

### 1. 环境变量配置

在 `.env.production` 中添加：

```bash
VITE_GTM_ID=GTM-WMJSMTWF
```

其他环境（`.env.development` 和 `.env.staging`）不包含此变量。

### 2. Vite 构建配置

在 `vite.config.ts` 中通过 HTML 转换插件动态注入 GTM 代码：

```typescript
{
  name: 'html-transform',
  transformIndexHtml(html) {
    const gtmId = env.VITE_GTM_ID || ''

    // 仅当 VITE_GTM_ID 存在时才生成 GTM 代码
    const gtmHeadScript = gtmId ? `<!-- GTM Head Code -->` : ''
    const gtmBodyNoScript = gtmId ? `<!-- GTM Body Code -->` : ''

    return html
      .replace('<!-- GTM_HEAD_PLACEHOLDER -->', gtmHeadScript)
      .replace('<!-- GTM_BODY_PLACEHOLDER -->', gtmBodyNoScript)
  }
}
```

### 3. HTML 模板占位符

`index.html` 中使用占位符标记 GTM 注入位置：

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- GTM_HEAD_PLACEHOLDER -->
    <meta charset="UTF-8" />
    <!-- ... -->
  </head>
  <body>
    <!-- GTM_BODY_PLACEHOLDER -->
    <div id="root"></div>
    <!-- ... -->
  </body>
</html>
```

### 4. GTM 代码结构

生产环境构建后，HTML 会包含完整的 GTM 代码：

#### Head 部分
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WMJSMTWF');</script>
<!-- End Google Tag Manager -->
```

#### Body 部分 (noscript fallback)
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WMJSMTWF"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

## 构建验证

### 验证生产环境包含 GTM

```bash
npm run build:production
grep "Google Tag Manager" dist/index.html
```

**预期结果**：显示 GTM 代码片段

### 验证 Staging 环境不包含 GTM

```bash
npm run build:staging
grep "Google Tag Manager" dist/index.html
```

**预期结果**：无输出（不包含 GTM）

### 验证开发环境不包含 GTM

```bash
npm run dev
# 访问 http://localhost:5173/
# 打开浏览器控制台查看 Network 面板
```

**预期结果**：无 `googletagmanager.com` 相关请求

## GTM 容器配置建议

### 推荐标签 (Tags)

1. **Google Analytics 4 配置标签**
   - 触发器：All Pages
   - 用途：基础 GA4 数据收集

2. **页面浏览事件**
   - 类型：GA4 Event
   - 事件名称：page_view
   - 触发器：All Pages

3. **自定义事件标签**
   - 监听 Umami 已追踪的事件（参考 `LogoSilhouette_数据埋点方案.md`）
   - 使用 dataLayer 变量传递事件参数

### 触发器 (Triggers)

基于用户行为设置触发器：

- **上传图片**：监听 file input 变化
- **导出操作**：监听下载按钮点击
- **参数调整**：监听滑块/开关变化

### 变量 (Variables)

建议配置的自定义变量：

- **处理模式**：记录用户选择的预设模式
- **导出格式**：SVG / PNG / JPG
- **图片尺寸**：上传图片的尺寸范围

## 数据层 (dataLayer) 集成

如需从应用代码向 GTM 发送自定义事件，可使用：

```typescript
// 示例：追踪导出操作
window.dataLayer = window.dataLayer || []
window.dataLayer.push({
  'event': 'logo_export',
  'export_format': 'svg',
  'export_size': 'original'
})
```

## 与 Umami Analytics 的关系

LogoSilhouette 同时使用：

1. **Umami Analytics**（所有环境）
   - 轻量级、隐私友好
   - 用于基础行为追踪
   - 详见 `LogoSilhouette_数据埋点方案.md`

2. **Google Tag Manager**（仅生产环境）
   - 灵活的标签管理
   - 可集成 GA4、广告平台等
   - 便于营销团队使用

两者互补，不冲突。

## 隐私合规

GTM 遵循以下隐私原则：

- ✅ 仅生产环境启用
- ✅ 所有图片处理在客户端完成
- ✅ 不上传用户文件到服务器
- ✅ 符合 GDPR 和 CCPA 要求
- ⚠️ 建议在网站添加隐私政策说明

## 故障排查

### 问题：GTM 代码未出现在生产构建中

**检查项**：
1. 确认 `.env.production` 包含 `VITE_GTM_ID=GTM-WMJSMTWF`
2. 运行 `npm run build:production`（不是 `npm run build`）
3. 检查 `dist/index.html` 内容

### 问题：开发环境意外加载了 GTM

**检查项**：
1. 确认 `.env.development` **不包含** `VITE_GTM_ID`
2. 清空缓存：`rm -rf dist node_modules/.vite`
3. 重新启动：`npm run dev`

### 问题：GTM 容器无数据

**检查项**：
1. 使用 [Google Tag Assistant](https://tagassistant.google.com/) 验证标签触发
2. 在 GTM 预览模式下测试
3. 检查浏览器控制台是否有 JavaScript 错误

## 更新历史

- **2026-01-27**：初始集成，仅生产环境启用 GTM-WMJSMTWF

## 相关文档

- [LogoSilhouette_数据埋点方案.md](./LogoSilhouette_数据埋点方案.md) - Umami Analytics 方案
- [Environment_Overview.md](./Environment_Overview.md) - 环境配置总览
- [Environment_Configuration.md](./Environment_Configuration.md) - 详细环境配置

---

**最后更新**：2026-01-27
