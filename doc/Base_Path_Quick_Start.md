# Base Path 快速开始

## 当前配置 ✅

| 环境 | Base Path | 访问 URL |
|------|-----------|---------|
| **开发环境** | `/` | `http://localhost:5173/` |
| **生产环境** | `/logo-silhouette/` | `https://your-domain.com/logo-silhouette/` |

---

## 快速测试

### 1️⃣ 开发环境 (根路径)

```bash
npm run dev
```

访问: `http://localhost:5173/`

### 2️⃣ 生产构建 (二级路径)

```bash
# 构建
npm run build

# 验证配置
./scripts/verify-build.sh

# 预览
npm run preview
```

访问: `http://localhost:4173/logo-silhouette/`

---

## 修改生产路径

编辑 `.env.production`:

```bash
# 方案 1: 使用二级路径 (当前配置)
VITE_BASE_PATH=/logo-silhouette/

# 方案 2: 改为根路径
VITE_BASE_PATH=/

# 方案 3: 使用其他路径
VITE_BASE_PATH=/my-custom-path/
```

**注意**: 修改后需要重新构建 (`npm run build`)

---

## 验证 Checklist

构建后检查:

- [ ] 运行 `./scripts/verify-build.sh` 无错误
- [ ] `dist/index.html` 中所有 `src`/`href` 路径包含正确前缀
- [ ] 预览页面能正常访问 (注意使用正确的 URL)
- [ ] 所有图片和资源正常加载 (无 404)
- [ ] 浏览器 Network 标签显示所有请求成功

---

## 常见错误

### ❌ 错误 1: 预览时 404

```bash
# 错误访问
http://localhost:4173/  ❌

# 正确访问 (注意路径)
http://localhost:4173/logo-silhouette/  ✅
```

### ❌ 错误 2: 资源 404

**原因**: 代码中硬编码了路径

```typescript
// ❌ 错误
<img src="/cases/case_1.png" />

// ✅ 正确
import { getAssetPath } from '@/utils/path'
<img src={getAssetPath('/cases/case_1.png')} />
```

### ❌ 错误 3: 修改配置未生效

**解决**: 重新构建

```bash
npm run build
```

---

## 部署示例

### Nginx

```nginx
location /logo-silhouette/ {
    alias /var/www/logo-silhouette/dist/;
    try_files $uri $uri/ /logo-silhouette/index.html;
}
```

### Vercel

在项目根目录创建 `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/logo-silhouette/:path*",
      "destination": "/logo-silhouette/:path*"
    },
    {
      "source": "/logo-silhouette",
      "destination": "/logo-silhouette/index.html"
    }
  ]
}
```

---

## 更多信息

详细文档: [Base_Path_Configuration.md](./Base_Path_Configuration.md)

---

**最后更新**: 2026-01-27
