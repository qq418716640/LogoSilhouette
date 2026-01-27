# 环境配置概览

## 三种环境完整对比

| 配置项 | 开发环境 | 预发布环境 (Staging) | 生产环境 (Production) |
|-------|---------|---------------------|---------------------|
| **配置文件** | `.env.development` | `.env.staging` | `.env.production` |
| **Base Path** | `/` | `/` | `/logo-silhouette/` |
| **Umami Website ID** | `8133b90d-...5490d` | `8133b90d-...5490d` | `1fcc9639-...3db68` |
| **构建命令** | `npm run dev` | `npm run build:staging` | `npm run build:production` |
| **典型域名** | localhost:5173 | logosilhouette.vercel.app | your-domain.com |
| **部署位置** | 本地 | Vercel | 服务器 |
| **部署方式** | 自动热更新 | Git push 自动 | 手动上传 dist/ |

---

## Umami Analytics 配置

### 开发 + Staging 环境

```bash
Website ID: 8133b90d-9f06-4b08-a1ef-9f522a35490d
```

**用途**:
- 本地开发调试
- Vercel 预发布测试
- 共享同一数据源便于对比

**Dashboard 访问**:
https://umami-rose-delta.vercel.app/websites/8133b90d-9f06-4b08-a1ef-9f522a35490d

### 生产环境

```bash
Website ID: 1fcc9639-90d1-4270-83da-42d01343db68
```

**用途**:
- 正式线上环境数据追踪
- 独立数据源避免测试数据污染
- 准确反映真实用户行为

**Dashboard 访问**:
https://umami-rose-delta.vercel.app/websites/1fcc9639-90d1-4270-83da-42d01343db68

---

## 快速命令参考

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 访问
http://localhost:5173/

# 特点
- 热更新 (HMR)
- 根路径
- 控制台日志
```

### 预发布环境 (Vercel)

```bash
# 构建
npm run build:staging

# 本地预览
npm run preview:staging

# 部署到 Vercel (自动)
git push origin main

# 访问
https://logosilhouette.vercel.app/

# 特点
- 生产优化构建
- 根路径
- 自动部署
```

### 生产环境

```bash
# 构建
npm run build:production

# 本地预览
npm run preview:production

# 访问（注意二级路径）
http://localhost:4173/logo-silhouette/

# 部署 (手动)
scp -r dist/* user@server:/var/www/logo-silhouette/

# 访问
https://your-domain.com/logo-silhouette/

# 特点
- 生产优化构建
- 二级路径
- 独立 Analytics
```

---

## 访问路径对比

### 根路径 (开发 + Staging)

```
✅ https://logosilhouette.vercel.app/
✅ https://logosilhouette.vercel.app/assets/index.js
✅ https://logosilhouette.vercel.app/favicon.svg
```

### 二级路径 (生产)

```
✅ https://your-domain.com/logo-silhouette/
✅ https://your-domain.com/logo-silhouette/assets/index.js
✅ https://your-domain.com/logo-silhouette/favicon.svg
```

---

## 环境变量完整清单

### .env.development

```bash
VITE_UMAMI_WEBSITE_ID=8133b90d-9f06-4b08-a1ef-9f522a35490d
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js
VITE_BASE_PATH=/
```

### .env.staging

```bash
VITE_UMAMI_WEBSITE_ID=8133b90d-9f06-4b08-a1ef-9f522a35490d
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js
VITE_BASE_PATH=/
```

### .env.production

```bash
VITE_UMAMI_WEBSITE_ID=1fcc9639-90d1-4270-83da-42d01343db68
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js
VITE_BASE_PATH=/logo-silhouette/
```

---

## 数据追踪策略

### 为什么 Staging 和 Production 使用不同 Website ID?

| 原因 | 说明 |
|------|------|
| **数据隔离** | 测试数据不污染生产数据 |
| **准确分析** | 生产环境数据反映真实用户 |
| **独立监控** | 可分别查看各环境指标 |
| **调试方便** | Staging 可以随意测试埋点 |

### 数据分析建议

#### Staging 环境 (Dashboard 1)

- 用于验证埋点功能正常
- 测试新增事件是否上报
- 验证参数格式正确性
- 可以随意触发测试事件

#### Production 环境 (Dashboard 2)

- 查看真实用户行为数据
- 分析核心转化漏斗
- 监控关键性能指标
- 生成业务报表

---

## 部署工作流

### 完整开发流程

```
1. 本地开发
   ├── npm run dev
   ├── http://localhost:5173/
   └── Umami: 8133b90d... (Dev)

2. 提交代码
   └── git push origin main

3. Vercel 自动部署 (Staging)
   ├── npm run build:staging
   ├── https://logosilhouette.vercel.app/
   └── Umami: 8133b90d... (Staging)

4. 测试验证
   └── 在 Vercel 域名测试功能

5. 构建生产版本
   ├── npm run build:production
   └── 生成 dist/ 目录

6. 部署到生产服务器
   ├── scp dist/ → 服务器
   ├── https://your-domain.com/logo-silhouette/
   └── Umami: 1fcc9639... (Production)
```

---

## 验证 Checklist

### 开发环境

- [ ] `npm run dev` 正常启动
- [ ] 访问 `http://localhost:5173/` 页面显示
- [ ] 浏览器控制台有 `[Analytics]` 日志
- [ ] 图标和资源正常加载

### Staging 环境

- [ ] `git push origin main` 触发 Vercel 部署
- [ ] Vercel Dashboard 显示 "Ready"
- [ ] 访问 `https://logosilhouette.vercel.app/` 正常
- [ ] Umami Dashboard (8133b90d) 有实时数据
- [ ] 所有功能正常工作

### Production 环境

- [ ] `npm run build:production` 构建成功
- [ ] `./scripts/verify-build.sh` 验证通过
- [ ] 本地预览 `http://localhost:4173/logo-silhouette/` 正常
- [ ] 部署到服务器后访问正常
- [ ] Umami Dashboard (1fcc9639) 有实时数据
- [ ] 所有资源路径包含 `/logo-silhouette/` 前缀

---

## 常见问题

### Q: 为什么预览生产构建时看到 favicon 404?

**A**: 这是浏览器默认行为，不影响功能。详见 [Preview_Access_Guide.md](./Preview_Access_Guide.md)

### Q: Staging 和 Production 用同一个 Umami ID 可以吗?

**A**: 可以但不推荐。这样会导致测试数据和真实用户数据混在一起，难以分析。

### Q: 如何切换环境重新构建?

**A**: 直接运行对应的构建命令，dist/ 会被新构建覆盖:
```bash
npm run build:staging     # 切换到 staging
npm run build:production  # 切换到 production
```

### Q: 如何在 Vercel 查看 Staging 的 Analytics?

**A**:
1. 访问 https://umami-rose-delta.vercel.app
2. 选择 Website ID: `8133b90d-9f06-4b08-a1ef-9f522a35490d`
3. 查看 Real-time 数据

---

## 快速参考卡片

### 🏠 开发环境

```
命令:  npm run dev
URL:   http://localhost:5173/
Path:  /
Umami: 8133b90d-9f06-4b08-a1ef-9f522a35490d
用途:  本地开发调试
```

### 🧪 预发布环境 (Vercel)

```
命令:  git push origin main (自动部署)
URL:   https://logosilhouette.vercel.app/
Path:  /
Umami: 8133b90d-9f06-4b08-a1ef-9f522a35490d
用途:  上线前测试
```

### 🚀 生产环境

```
命令:  npm run build:production
URL:   https://your-domain.com/logo-silhouette/
Path:  /logo-silhouette/
Umami: 1fcc9639-90d1-4270-83da-42d01343db68
用途:  正式上线
```

---

## 相关文档

- [Environment_Configuration.md](./Environment_Configuration.md) - 详细环境配置
- [Vercel_Deployment.md](./Vercel_Deployment.md) - Vercel 部署指南
- [Base_Path_Configuration.md](./Base_Path_Configuration.md) - Base Path 配置
- [LogoSilhouette_数据埋点方案.md](./LogoSilhouette_数据埋点方案.md) - Analytics 方案
- [Umami_Quick_Reference.md](./Umami_Quick_Reference.md) - Umami 快速参考

---

**最后更新**: 2026-01-27
