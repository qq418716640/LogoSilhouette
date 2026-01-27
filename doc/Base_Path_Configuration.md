# Base Path 配置指南

## 概述

本项目支持配置不同的 base path (二级路径),可以根据部署环境灵活调整。

- **开发环境**: 默认根路径 `/`
- **生产环境**: 支持二级路径 `/logo-silhouette/` (可配置)

---

## 配置方式

### 环境变量配置

通过 `.env.*` 文件配置 `VITE_BASE_PATH`:

#### 开发环境 (`.env.development`)
```bash
# 开发环境使用根路径
VITE_BASE_PATH=/
```

#### 生产环境 (`.env.production`)
```bash
# 生产环境使用二级路径
VITE_BASE_PATH=/logo-silhouette/
```

### 自定义路径

如果需要修改生产环境的路径,只需编辑 `.env.production`:

```bash
# 自定义为其他路径
VITE_BASE_PATH=/my-custom-path/

# 或者回到根路径
VITE_BASE_PATH=/
```

**注意**: 路径必须以 `/` 开头和结尾 (如 `/logo-silhouette/`)

---

## 工作原理

### 1. Vite Base 配置

`vite.config.ts` 会读取 `VITE_BASE_PATH` 并设置为 Vite 的 `base` 选项:

```typescript
const basePath = env.VITE_BASE_PATH || '/'
const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`

export default defineConfig({
  base: normalizedBase,
  // ...
})
```

Vite 会自动处理:
- ✅ HTML 中的 `<script>` 和 `<link>` 标签
- ✅ CSS 中的 `url()` 引用
- ✅ JS 中的 `import` 语句
- ✅ 打包后的资源文件路径

### 2. 静态资源处理

对于 `public/` 目录中的静态资源,需要使用 `getAssetPath()` 函数:

```typescript
import { getAssetPath } from '@/utils/path'

// ❌ 错误 - 直接硬编码路径
<img src="/cases/case_1.png" />

// ✅ 正确 - 使用 getAssetPath
<img src={getAssetPath('/cases/case_1.png')} />
```

**工作原理**:
- 开发环境: `getAssetPath('/cases/case_1.png')` → `/cases/case_1.png`
- 生产环境: `getAssetPath('/cases/case_1.png')` → `/logo-silhouette/cases/case_1.png`

### 3. HTML 中的占位符

`index.html` 中使用 `%VITE_BASE_PATH%` 占位符:

```html
<!-- 会被构建时替换 -->
<link rel="icon" href="%VITE_BASE_PATH%vite.svg" />
```

构建后:
- 开发环境: `<link rel="icon" href="/vite.svg" />`
- 生产环境: `<link rel="icon" href="/logo-silhouette/vite.svg" />`

---

## 构建和部署

### 本地开发

```bash
# 使用 .env.development (base path = /)
npm run dev

# 访问 http://localhost:5173/
```

### 生产构建

```bash
# 使用 .env.production (base path = /logo-silhouette/)
npm run build

# dist/ 目录会包含正确的路径配置
```

### 部署

构建后的 `dist/` 目录需要部署到服务器的对应路径:

**示例 1: Nginx 配置**

如果 `VITE_BASE_PATH=/logo-silhouette/`:

```nginx
server {
    listen 80;
    server_name example.com;

    # 部署到 /logo-silhouette/ 路径
    location /logo-silhouette/ {
        alias /var/www/logo-silhouette/dist/;
        try_files $uri $uri/ /logo-silhouette/index.html;
    }
}
```

**示例 2: Apache 配置**

```apache
<Directory "/var/www/html/logo-silhouette">
    RewriteEngine On
    RewriteBase /logo-silhouette/
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /logo-silhouette/index.html [L]
</Directory>
```

**示例 3: Vercel 配置**

创建 `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/logo-silhouette/(.*)",
      "dest": "/logo-silhouette/$1"
    },
    {
      "src": "/logo-silhouette",
      "dest": "/logo-silhouette/index.html"
    }
  ]
}
```

---

## 测试验证

### 1. 本地预览生产构建

```bash
# 构建生产版本
npm run build

# 预览 (注意需要访问 /logo-silhouette/)
npm run preview

# 访问 http://localhost:4173/logo-silhouette/
```

### 2. 检查资源路径

构建后检查 `dist/index.html`:

```bash
cat dist/index.html | grep -E 'href=|src='
```

应该看到:
```html
<script type="module" crossorigin src="/logo-silhouette/assets/index-abc123.js"></script>
<link rel="stylesheet" crossorigin href="/logo-silhouette/assets/index-def456.css">
<link rel="icon" type="image/svg+xml" href="/logo-silhouette/vite.svg" />
```

### 3. 检查静态资源

访问页面后,打开开发者工具 → Network:

- ✅ 所有资源请求应该以 `/logo-silhouette/` 开头
- ✅ 没有 404 错误
- ✅ 图片正确加载

---

## 常见问题

### Q1: 生产环境资源 404

**原因**: 服务器配置与 base path 不匹配

**解决方法**:
1. 确认 `.env.production` 中的 `VITE_BASE_PATH` 正确
2. 确认服务器配置的路径与 base path 一致
3. 重新构建: `npm run build`

### Q2: 图片加载失败

**原因**: 代码中直接硬编码了路径,没有使用 `getAssetPath()`

**解决方法**:
```typescript
// ❌ 错误
<img src="/images/logo.png" />

// ✅ 正确
import { getAssetPath } from '@/utils/path'
<img src={getAssetPath('/images/logo.png')} />
```

### Q3: 本地预览生产构建访问不了

**原因**: `npm run preview` 默认在根路径提供服务

**解决方法**:
访问带二级路径的 URL: `http://localhost:4173/logo-silhouette/`

或者修改 `package.json`:
```json
{
  "scripts": {
    "preview": "vite preview --base /logo-silhouette/"
  }
}
```

### Q4: 如何临时使用不同的 base path?

可以在构建时通过命令行覆盖:

```bash
# 临时使用根路径构建
VITE_BASE_PATH=/ npm run build

# 临时使用其他路径
VITE_BASE_PATH=/my-path/ npm run build
```

---

## 代码规范

### ✅ 正确做法

```typescript
// 1. 导入工具函数
import { getAssetPath } from '@/utils/path'

// 2. 使用工具函数处理所有 public 资源
const imageSrc = getAssetPath('/cases/example.png')
<img src={getAssetPath('/images/logo.png')} />

// 3. 通过 import 引入的资源会自动处理 (推荐)
import logo from '@/assets/logo.png'
<img src={logo} />
```

### ❌ 错误做法

```typescript
// 1. 直接硬编码路径
<img src="/cases/example.png" />

// 2. 手动拼接 base path
const base = import.meta.env.BASE_URL
<img src={`${base}cases/example.png`} />

// 3. 使用模板字符串
<img src={`/cases/${fileName}.png`} />  // 应该用 getAssetPath(`/cases/${fileName}.png`)
```

---

## 迁移指南

如果代码中已有硬编码的路径,按以下步骤迁移:

### 1. 搜索所有硬编码路径

```bash
# 搜索 public 资源引用
grep -r "src=\"/" src/
grep -r "'/cases" src/
grep -r '"/tips' src/
```

### 2. 批量替换

使用 `getAssetPath()` 包装所有路径:

```typescript
// Before
sourceImage: '/cases/case_1.png'

// After
sourceImage: getAssetPath('/cases/case_1.png')
```

### 3. 测试验证

```bash
# 开发环境测试
npm run dev
# 检查页面正常,图片加载成功

# 生产构建测试
npm run build
npm run preview
# 访问 http://localhost:4173/logo-silhouette/
# 检查所有资源正常加载
```

---

## 已处理的文件

项目中已经更新以下文件支持 base path:

- ✅ `vite.config.ts` - Vite base 配置
- ✅ `index.html` - Favicon 路径占位符
- ✅ `src/utils/path.ts` - 路径工具函数
- ✅ `src/data/cases.ts` - 案例图片路径
- ✅ `src/components/EmbeddedApp/ImageUploader.tsx` - Tips 图片路径

---

**最后更新**: 2026-01-27
