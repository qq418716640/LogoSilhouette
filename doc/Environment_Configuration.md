# 环境配置说明

## 三种环境配置

本项目支持三种环境配置，每种环境可以有不同的 Base Path 和 Analytics 配置。

| 环境 | 配置文件 | Base Path | 访问路径 | 构建命令 |
|------|---------|-----------|---------|---------|
| **开发环境** | `.env.development` | `/` | `http://localhost:5173/` | `npm run dev` |
| **预发布环境** | `.env.staging` | `/` | `https://staging.example.com/` | `npm run build:staging` |
| **生产环境** | `.env.production` | `/logo-silhouette/` | `https://example.com/logo-silhouette/` | `npm run build:production` |

---

## 环境配置文件

### 开发环境 (`.env.development`)

```bash
# Development Environment
VITE_UMAMI_WEBSITE_ID=8133b90d-9f06-4b08-a1ef-9f522a35490d
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js
VITE_BASE_PATH=/
```

**用途**: 本地开发调试
**Base Path**: 根路径 `/`
**启动**: `npm run dev`

### 预发布环境 (`.env.staging`)

```bash
# Staging Environment (预发布环境)
VITE_UMAMI_WEBSITE_ID=8133b90d-9f06-4b08-a1ef-9f522a35490d
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js
VITE_BASE_PATH=/
```

**用途**: 上线前测试，模拟生产环境但使用根路径
**Base Path**: 根路径 `/` (与开发环境一致)
**构建**: `npm run build:staging`

### 生产环境 (`.env.production`)

```bash
# Production Environment
VITE_UMAMI_WEBSITE_ID=8133b90d-9f06-4b08-a1ef-9f522a35490d
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js
VITE_BASE_PATH=/logo-silhouette/
```

**用途**: 正式线上环境
**Base Path**: 二级路径 `/logo-silhouette/`
**构建**: `npm run build:production` 或 `npm run build`

---

## 构建命令详解

### 1. 开发环境

```bash
# 启动开发服务器
npm run dev

# 访问
http://localhost:5173/
```

- ✅ 热更新 (HMR)
- ✅ 根路径访问
- ✅ 开发环境控制台日志

### 2. 预发布环境

```bash
# 构建预发布版本
npm run build:staging

# 查看构建产物
ls dist/

# 部署到预发布服务器
scp -r dist/* user@staging-server:/var/www/html/
```

**访问路径**: `https://staging.example.com/` (根路径)

**用途**:
- 测试生产构建
- 验证功能完整性
- 性能测试
- UAT (用户验收测试)

### 3. 生产环境

```bash
# 方式 1: 默认构建（使用 production 模式）
npm run build

# 方式 2: 显式指定生产环境
npm run build:production

# 部署到生产服务器
scp -r dist/* user@production-server:/var/www/logo-silhouette/
```

**访问路径**: `https://example.com/logo-silhouette/` (二级路径)

---

## 本地预览

### 预览预发布构建

```bash
# 构建并预览
npm run preview:staging

# 或者分步执行
npm run build:staging
npm run preview

# 访问
http://localhost:4173/
```

### 预览生产构建

```bash
# 构建并预览
npm run preview:production

# 或者分步执行
npm run build:production
npm run preview

# 访问（注意二级路径）
http://localhost:4173/logo-silhouette/
```

---

## 验证构建配置

### 检查 Base Path

构建后检查 `dist/index.html`:

```bash
# 预发布环境（根路径）
npm run build:staging
cat dist/index.html | grep 'src=\|href='
# 应该看到: src="/assets/..."

# 生产环境（二级路径）
npm run build:production
cat dist/index.html | grep 'src=\|href='
# 应该看到: src="/logo-silhouette/assets/..."
```

### 使用验证脚本

```bash
# 验证生产构建
npm run build:production
./scripts/verify-build.sh

# 验证预发布构建
npm run build:staging
./scripts/verify-build.sh
```

---

## 部署流程

### 预发布环境部署

```bash
# 1. 构建预发布版本
npm run build:staging

# 2. 验证构建
ls dist/
cat dist/index.html | head -30

# 3. 部署到预发布服务器
# 方式 1: SCP
scp -r dist/* user@staging-server:/var/www/html/

# 方式 2: rsync
rsync -avz --delete dist/ user@staging-server:/var/www/html/

# 4. 访问验证
# https://staging.example.com/
```

**Nginx 配置示例** (预发布 - 根路径):

```nginx
server {
    listen 80;
    server_name staging.example.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 生产环境部署

```bash
# 1. 构建生产版本
npm run build:production

# 2. 验证构建
./scripts/verify-build.sh

# 3. 部署到生产服务器
scp -r dist/* user@production-server:/var/www/logo-silhouette/

# 4. 访问验证
# https://example.com/logo-silhouette/
```

**Nginx 配置示例** (生产 - 二级路径):

```nginx
server {
    listen 80;
    server_name example.com;

    location /logo-silhouette/ {
        alias /var/www/logo-silhouette/dist/;
        try_files $uri $uri/ /logo-silhouette/index.html;
    }
}
```

---

## 常见场景

### 场景 1: 测试预发布环境

```bash
# 构建预发布版本
npm run build:staging

# 本地预览
npm run preview

# 访问根路径（与开发环境一致）
open http://localhost:4173/
```

### 场景 2: 测试生产环境

```bash
# 构建生产版本
npm run build:production

# 本地预览
npm run preview

# 访问二级路径
open http://localhost:4173/logo-silhouette/
```

### 场景 3: 切换环境重新构建

```bash
# 先构建预发布
npm run build:staging

# 切换到生产构建
npm run build:production

# dist/ 目录会被新构建覆盖
```

---

## 自定义环境

如果需要更多环境（如 UAT、灰度发布等），可以创建新的配置文件：

### 1. 创建配置文件

```bash
# 创建 UAT 环境配置
cat > .env.uat <<EOF
# UAT Environment
VITE_UMAMI_WEBSITE_ID=your-uat-website-id
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js
VITE_BASE_PATH=/
EOF
```

### 2. 添加构建命令

编辑 `package.json`:

```json
{
  "scripts": {
    "build:uat": "tsc -b && vite build --mode uat",
    "preview:uat": "npm run build:uat && vite preview"
  }
}
```

### 3. 使用

```bash
npm run build:uat
npm run preview:uat
```

---

## 环境变量优先级

Vite 加载环境变量的优先级（从高到低）：

1. `.env.{mode}.local` (git ignored)
2. `.env.{mode}`
3. `.env.local` (git ignored)
4. `.env`

**示例**:

```bash
# 创建本地覆盖（不提交到 git）
cat > .env.staging.local <<EOF
VITE_UMAMI_WEBSITE_ID=my-local-staging-id
EOF

# 构建时会使用 .env.staging.local 中的值
npm run build:staging
```

---

## 常见问题

### Q1: 为什么预发布要用根路径？

**回答**: 预发布环境通常部署在独立域名（如 `staging.example.com`），使用根路径：
- ✅ 配置简单，不需要 Nginx rewrite
- ✅ 与开发环境一致，便于调试
- ✅ 测试更接近真实用户体验

### Q2: 如何修改生产环境的二级路径？

编辑 `.env.production`:

```bash
# 修改为其他路径
VITE_BASE_PATH=/my-app/

# 或改为根路径
VITE_BASE_PATH=/
```

### Q3: 忘记指定环境会怎样？

```bash
# 不指定模式时，默认使用 production
npm run build
# 等同于
npm run build:production
```

### Q4: 如何查看当前使用的环境变量？

```bash
# 在代码中打印
console.log('Base URL:', import.meta.env.BASE_URL)
console.log('Mode:', import.meta.env.MODE)

# 或在构建时查看
npm run build:staging -- --debug
```

---

## 最佳实践

### ✅ 推荐

1. **明确区分环境**: 使用 `build:staging` 和 `build:production` 而不是 `build`
2. **预发布测试**: 上线前必须在预发布环境验证
3. **使用 .local 文件**: 个人配置放在 `.env.*.local`（不提交）
4. **文档化配置**: 在 README 中说明各环境的用途

### ❌ 避免

1. ❌ 混用环境变量文件
2. ❌ 跳过预发布直接生产
3. ❌ 提交 `.env.local` 到 git
4. ❌ 硬编码环境相关配置

---

## 总结

### 三种环境对比

| 特性 | 开发环境 | 预发布环境 | 生产环境 |
|------|---------|----------|---------|
| Base Path | `/` | `/` | `/logo-silhouette/` |
| 热更新 | ✅ | ❌ | ❌ |
| 压缩优化 | ❌ | ✅ | ✅ |
| Source Map | ✅ | ✅ | ❌ (可选) |
| 调试日志 | ✅ | ❌ | ❌ |
| 部署位置 | 本地 | 预发布服务器 | 生产服务器 |

### 快速参考

```bash
# 开发
npm run dev                    # 本地开发

# 预发布
npm run build:staging          # 构建预发布
npm run preview:staging        # 预览预发布

# 生产
npm run build:production       # 构建生产
npm run preview:production     # 预览生产
```

---

**最后更新**: 2026-01-27
