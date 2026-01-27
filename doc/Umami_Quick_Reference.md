# Umami Analytics 快速参考

## 当前配置状态

### ✅ 已完成

- [x] 环境配置文件创建 (`.env.development`, `.env.production`, `.env.example`)
- [x] Vite 配置更新支持环境变量替换 (`vite.config.ts`)
- [x] index.html 添加 Umami 脚本标签
- [x] .gitignore 更新排除敏感环境变量文件
- [x] 埋点基础架构 (`src/analytics/`)
- [x] 50+ 事件定义完成
- [x] 完整埋点方案文档
- [x] 配置指南文档

### 🔧 当前配置

| 项目 | 值 |
|-----|---|
| **开发/Staging Website ID** | `8133b90d-9f06-4b08-a1ef-9f522a35490d` |
| **生产环境 Website ID** | `1fcc9639-90d1-4270-83da-42d01343db68` |
| **Umami 脚本源** | `https://umami-rose-delta.vercel.app/script.js` |
| **环境变量文件** | `.env.development`, `.env.staging`, `.env.production` |

---

## 快速测试

### 1. 本地开发测试

```bash
# 启动开发服务器
npm run dev

# 打开浏览器访问 http://localhost:5173
# 打开控制台,应该看到:
# [Analytics] ls_page_ready { ... }
# [Analytics] ls_app_loaded { ... }
```

### 2. 手动触发测试事件

在浏览器控制台执行:

```javascript
// 检查 Umami 是否加载
window.umami

// 手动触发测试事件
window.umami.track('ls_test_event', {
  tool: 'LogoSilhouette',
  test: 'manual_trigger'
})
```

### 3. 在 Umami Dashboard 查看

1. 访问 https://umami-rose-delta.vercel.app
2. 登录你的账号
3. 选择 Website: LogoSilhouette Development
4. 点击 **Real-time** 查看实时数据
5. 点击 **Events** 查看自定义事件列表

---

## 生产环境上线 Checklist

### Step 1: 创建生产 Website

- [ ] 登录 Umami Cloud: https://umami-rose-delta.vercel.app
- [ ] 创建新 Website: "LogoSilhouette Production"
- [ ] 复制生产环境的 Website ID

### Step 2: 更新配置

- [ ] 编辑 `.env.production`
- [ ] 替换 `VITE_UMAMI_WEBSITE_ID` 为生产 ID
- [ ] 提交配置文件 (不要提交 `.env.local`)

### Step 3: 构建和部署

```bash
# 构建生产版本
npm run build

# 验证 dist/index.html 中 data-website-id 是否为生产 ID
grep -A 3 "umami" dist/index.html

# 部署到服务器
# (根据你的部署方式)
```

### Step 4: 验证生产环境

- [ ] 访问生产网站
- [ ] 打开开发者工具 → Network
- [ ] 过滤 `umami` 请求
- [ ] 确认看到 POST 请求到 `https://umami-rose-delta.vercel.app/api/send`
- [ ] 在 Umami Dashboard 查看实时数据

---

## 常用事件速查

### 页面级

```typescript
events.pageReady(ttInteractiveMs)
events.appLoaded(workerSupported)
events.scrollDepth(percent)
```

### 上传

```typescript
events.uploadOpen(source)
events.imageUploaded({ fileType, fileSizeKb, imgW, imgH })
events.imageDropped({ fileType, fileSizeKb, imgW, imgH })
```

### 处理

```typescript
events.processStarted(trigger, startStep)
events.processCompleted(durationMs, fallbackNoCrop)
events.processFailed(step, errorCode)
```

### 导出

```typescript
events.exportPanelView()
events.exportClick({ format, resolution, preset, hasResult })
events.exportCompleted({ format, resolution, durationMs, fileSizeKb })
events.exportDownload(format, resolution)
```

---

## 调试技巧

### 查看所有事件定义

```bash
# 查看 events.ts 文件
cat src/analytics/events.ts | grep "^ *[a-zA-Z]*:" | head -20
```

### 监听所有 umami.track 调用

在浏览器控制台:

```javascript
const originalTrack = window.umami.track
window.umami.track = function(...args) {
  console.log('🔍 Umami Track:', args)
  return originalTrack.apply(this, args)
}
```

### 检查环境变量

开发环境运行:

```bash
node -e "console.log(process.env)" | grep VITE_UMAMI
```

---

## 关键 Dashboard URL

| 页面 | URL |
|-----|-----|
| Umami Login | https://umami-rose-delta.vercel.app/login |
| Website 列表 | https://umami-rose-delta.vercel.app/websites |
| 实时数据 | https://umami-rose-delta.vercel.app/websites/[website-id]/realtime |
| 事件统计 | https://umami-rose-delta.vercel.app/websites/[website-id]/events |
| 设置 | https://umami-rose-delta.vercel.app/settings/websites |

---

## 文档索引

| 文档 | 说明 |
|-----|------|
| [LogoSilhouette_数据埋点方案.md](./LogoSilhouette_数据埋点方案.md) | 完整埋点架构、事件清单、关键指标 |
| [Analytics_Setup_Guide.md](./Analytics_Setup_Guide.md) | 配置步骤、使用指南、常见问题 |
| [Umami_Quick_Reference.md](./Umami_Quick_Reference.md) | 本文档 - 快速参考 |

---

## 支持

如有问题,请参考:
- Umami 官方文档: https://umami.is/docs
- Umami GitHub: https://github.com/umami-software/umami
- Umami Discord: https://discord.gg/4dz4zcXYrQ

---

**最后更新**: 2026-01-27
