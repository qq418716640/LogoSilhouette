# Vercel 部署配置

## 概述

本项目配置为在 Vercel 上部署 **Staging (预发布)** 环境，使用根路径。

## 当前配置

### vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build:staging",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**配置说明**:
- ✅ `buildCommand`: 使用 `npm run build:staging` (根路径)
- ✅ `outputDirectory`: 输出到 `dist/` 目录
- ✅ `rewrites`: SPA 路由支持，所有路径重定向到 index.html

---

## 部署方式

### 方式 1: Git 集成自动部署（推荐）

#### 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"New Project"**
3. 选择你的 GitHub 仓库: `qq418716640/LogoSilhouette`
4. Vercel 会自动检测到 `vercel.json` 配置

#### 自动部署触发

```bash
# 推送到 main 分支自动触发部署
git push origin main

# Vercel 会自动：
# 1. 拉取最新代码
# 2. 执行 npm run build:staging
# 3. 部署 dist/ 目录
# 4. 分配域名: https://your-project.vercel.app
```

### 方式 2: Vercel CLI 手动部署

#### 安装 CLI

```bash
npm install -g vercel
```

#### 登录

```bash
vercel login
```

#### 部署

```bash
# 进入项目目录
cd /path/to/LogoSilhouette

# 部署到 staging (预览)
vercel

# 部署到生产
vercel --prod
```

---

## 环境配置

### Staging 环境 (当前配置)

**配置**: 使用 `npm run build:staging`
**Base Path**: `/` (根路径)
**访问**: `https://your-project.vercel.app/`

**适用场景**:
- ✅ Vercel 自动预览部署
- ✅ PR 预览
- ✅ Staging 测试环境

### Production 环境 (需要单独配置)

如果需要在 Vercel 部署生产环境（二级路径），有两种方案：

#### 方案 1: 创建单独的 Vercel 项目

1. **创建 vercel.json.production**:
   ```json
   {
     "buildCommand": "npm run build:production",
     "outputDirectory": "dist"
   }
   ```

2. **部署时指定配置**:
   ```bash
   vercel --prod --local-config vercel.json.production
   ```

#### 方案 2: 使用环境变量覆盖

在 Vercel Dashboard 配置环境变量：

1. 进入项目 Settings → Environment Variables
2. 添加变量:
   - `VITE_BASE_PATH` = `/logo-silhouette/`
3. 重新部署

---

## Vercel 环境变量配置

### 在 Dashboard 中配置

1. 进入 Vercel 项目 → **Settings** → **Environment Variables**

2. 添加以下变量:

| 变量名 | 值 | 环境 |
|-------|---|------|
| `VITE_UMAMI_WEBSITE_ID` | `8133b90d-9f06-4b08-a1ef-9f522a35490d` | All |
| `VITE_UMAMI_SRC` | `https://umami-rose-delta.vercel.app/script.js` | All |
| `VITE_BASE_PATH` | `/` | Preview, Development |
| `VITE_BASE_PATH` | `/logo-silhouette/` | Production (如需要) |

3. 保存后触发重新部署

### 通过 CLI 配置

```bash
# 设置 Preview/Development 环境变量
vercel env add VITE_BASE_PATH development
# 输入: /

vercel env add VITE_BASE_PATH preview
# 输入: /

# 设置 Production 环境变量 (如需要)
vercel env add VITE_BASE_PATH production
# 输入: /logo-silhouette/
```

---

## 域名配置

### 默认域名

Vercel 自动分配域名:
- **生产**: `https://logo-silhouette.vercel.app`
- **预览**: `https://logo-silhouette-git-branch-name.vercel.app`
- **PR**: `https://logo-silhouette-pr-123.vercel.app`

### 自定义域名

#### 添加自定义域名

1. 进入 Vercel 项目 → **Settings** → **Domains**
2. 点击 **"Add Domain"**
3. 输入域名: `staging.logosilhouette.com`
4. 按照提示配置 DNS 记录

#### DNS 配置示例

**A 记录** (推荐):
```
Type: A
Name: staging
Value: 76.76.21.21
```

**CNAME 记录**:
```
Type: CNAME
Name: staging
Value: cname.vercel-dns.com
```

---

## 部署工作流

### 自动部署流程

```
┌─────────────────┐
│  Git Push       │
│  origin/main    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel 检测    │
│  新提交         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  执行构建       │
│  npm run        │
│  build:staging  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  部署 dist/     │
│  分配域名       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  部署成功       │
│  发送通知       │
└─────────────────┘
```

### 分支部署策略

#### Main 分支 → Staging 环境

```bash
# 推送到 main 分支
git push origin main

# Vercel 自动部署到:
# https://your-project.vercel.app/
```

#### Feature 分支 → Preview 环境

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 推送到远程
git push origin feature/new-feature

# Vercel 自动创建预览部署:
# https://your-project-git-feature-new-feature.vercel.app/
```

#### Pull Request → PR Preview

创建 PR 后，Vercel 自动在 PR 中添加预览链接。

---

## 构建优化

### 缓存配置

Vercel 自动缓存 `node_modules`，加速构建。

### 构建时间优化

```json
{
  "buildCommand": "npm run build:staging",
  "installCommand": "npm ci",
  "framework": "vite"
}
```

**优化要点**:
- ✅ 使用 `npm ci` 而不是 `npm install` (更快)
- ✅ Vite 框架检测自动优化
- ✅ 增量构建缓存

---

## 监控和日志

### 查看部署日志

1. 进入 Vercel Dashboard
2. 选择项目
3. 点击最新的 Deployment
4. 查看 **"Building"** 标签页

### 实时日志

```bash
# 使用 CLI 查看实时日志
vercel logs your-deployment-url
```

### 性能监控

Vercel 自动提供性能指标:
- **Function Duration**: 函数执行时间
- **Bandwidth**: 带宽使用
- **Cache Hit Rate**: 缓存命中率

---

## 常见问题

### Q1: 部署失败，构建超时

**原因**: 免费版有 45s 构建时间限制

**解决方法**:
```bash
# 优化构建速度
npm run build:staging -- --mode staging

# 或升级 Vercel 付费计划
```

### Q2: 环境变量不生效

**检查步骤**:
1. 确认环境变量名以 `VITE_` 开头
2. 在 Vercel Dashboard 检查变量配置
3. 触发重新部署（Redeploy）

### Q3: 404 错误，路由不工作

**原因**: SPA 路由配置缺失

**解决方法**:
确保 `vercel.json` 包含 rewrites 配置:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Q4: 想要部署 Production 环境到 Vercel

**方案 A**: 创建新的 Vercel 项目
- 项目名: `LogoSilhouette-Production`
- 使用 `vercel.json.production`

**方案 B**: 使用不同的分支
```bash
# production 分支使用生产配置
git checkout -b production
# 修改 vercel.json 为 build:production
git push origin production
# Vercel 单独部署这个分支
```

---

## 部署 Checklist

### 首次部署

- [ ] 连接 GitHub 仓库到 Vercel
- [ ] 确认 `vercel.json` 配置正确
- [ ] 配置环境变量（Umami ID、Base Path）
- [ ] 推送代码触发部署
- [ ] 验证部署成功，访问 Vercel 域名
- [ ] 测试所有功能正常
- [ ] 检查 Analytics 数据上报

### 后续部署

- [ ] 本地测试通过 (`npm run build:staging && npm run preview`)
- [ ] 提交代码到 Git
- [ ] 推送到 main 分支
- [ ] 等待 Vercel 自动部署
- [ ] 在 PR 中检查预览链接
- [ ] 合并后验证生产部署

---

## 回滚

### 快速回滚

1. 进入 Vercel Dashboard
2. 选择项目 → **Deployments**
3. 找到之前的成功部署
4. 点击 **"Promote to Production"**

### 通过 Git 回滚

```bash
# 回滚到上一个提交
git revert HEAD
git push origin main

# Vercel 自动部署回滚版本
```

---

## 安全配置

### 环境变量保护

- ✅ 敏感信息存储在 Vercel Environment Variables
- ✅ 不要在代码中硬编码 secrets
- ✅ 使用 `VITE_` 前缀暴露给客户端的变量

### HTTPS

Vercel 自动提供 HTTPS:
- ✅ 自动 SSL 证书
- ✅ 强制 HTTPS 重定向
- ✅ HTTP/2 支持

---

## 成本估算

### 免费版限制

- ✅ 100GB 带宽/月
- ✅ 6000 分钟构建时间/月
- ✅ 无限部署次数
- ✅ 自动 SSL

对于本项目（纯静态 SPA）完全够用。

---

## 与其他平台对比

| 功能 | Vercel | Netlify | Cloudflare Pages |
|------|--------|---------|------------------|
| 自动部署 | ✅ | ✅ | ✅ |
| PR 预览 | ✅ | ✅ | ✅ |
| 自定义域名 | ✅ | ✅ | ✅ |
| 免费额度 | 100GB | 100GB | 无限 |
| 构建速度 | 快 | 中等 | 快 |
| 配置简单 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

**选择 Vercel 的理由**:
- ✅ Vite 项目开箱即用
- ✅ Git 集成简单
- ✅ 国内访问速度尚可

---

## 总结

### 当前配置

- ✅ **环境**: Staging (预发布)
- ✅ **Base Path**: `/` (根路径)
- ✅ **构建命令**: `npm run build:staging`
- ✅ **自动部署**: Git push 触发
- ✅ **域名**: `https://your-project.vercel.app`

### 快速命令

```bash
# 推送代码自动部署
git push origin main

# 查看部署状态
vercel ls

# 查看日志
vercel logs

# 打开项目 Dashboard
vercel
```

---

**最后更新**: 2026-01-27
