# Preview 访问指南

## 问题说明

运行 `npm run preview` 后，如果在控制台看到以下错误：

```
GET http://localhost:4173/favicon.svg 404 (Not Found)
The server is configured with a public base URL of /logo-silhouette/
- did you mean to visit /logo-silhouette/favicon.svg instead?
```

**这是正常现象，可以忽略。**

---

## 为什么会出现这个错误？

### 浏览器行为

1. **浏览器默认请求**: 在 HTML 加载之前，浏览器会尝试从根路径请求 `/favicon.ico` 或 `/favicon.svg`
2. **时序问题**: 这个请求发生在浏览器解析 HTML `<link rel="icon">` 标签之前
3. **Base Path 配置**: 由于项目配置了 `/logo-silhouette/` 作为 base path，根路径的请求会失败

### 实际影响

- ❌ 控制台显示 404 错误
- ✅ 但页面加载后，favicon **会正确显示**
- ✅ HTML 中的 `<link rel="icon" href="/logo-silhouette/favicon.svg">` 会正常工作
- ✅ 不影响任何功能

---

## 正确的访问方式

### 本地预览

```bash
# 1. 构建生产版本
npm run build

# 2. 启动预览服务器
npm run preview

# 3. 访问正确的 URL (注意路径)
# ✅ 正确
http://localhost:4173/logo-silhouette/

# ❌ 错误 (会看到空白页面或 404)
http://localhost:4173/
```

**重要**: URL 末尾的 `/` 很重要，确保加上。

---

## 验证图标是否正常

### 检查清单

访问 `http://localhost:4173/logo-silhouette/` 后：

1. **浏览器标签页**
   - [ ] 标签页显示紫色渐变图标 ✅
   - [ ] 图标不是浏览器默认的空白图标

2. **开发者工具 Network**
   - [ ] 打开 Network 标签
   - [ ] 刷新页面
   - [ ] 搜索 "favicon"
   - [ ] 应该看到 `/logo-silhouette/favicon.svg` 状态 200 ✅

3. **直接访问图标**
   - [ ] 访问 `http://localhost:4173/logo-silhouette/favicon.svg`
   - [ ] 应该能看到完整的图标 ✅

---

## 消除 404 错误的方法

### 方法 1: 忽略错误（推荐）

这个 404 错误不影响功能，可以安全忽略。生产环境中，服务器配置通常会处理这种情况。

### 方法 2: 添加根路径 favicon（不推荐）

如果想消除这个错误，可以在根路径也放一个 favicon：

```bash
# 复制 favicon 到 dist 根目录（每次构建后）
cp dist/favicon.svg dist/../favicon.svg
```

但这不推荐，因为：
- 每次构建都需要手动操作
- 与 base path 设计不一致
- 生产环境不需要这样做

### 方法 3: 浏览器开发者工具过滤

Chrome DevTools → Console → Filter:
```
-favicon
```

这会隐藏包含 "favicon" 的日志。

---

## 生产环境配置

### Nginx 配置

在生产环境中，可以配置服务器优雅地处理根路径的 favicon 请求：

```nginx
server {
    listen 80;
    server_name example.com;

    # 根路径 favicon 重定向到二级路径
    location = /favicon.ico {
        return 301 /logo-silhouette/favicon.svg;
    }

    location = /favicon.svg {
        return 301 /logo-silhouette/favicon.svg;
    }

    # 主应用路径
    location /logo-silhouette/ {
        alias /var/www/logo-silhouette/dist/;
        try_files $uri $uri/ /logo-silhouette/index.html;
    }
}
```

### Apache 配置

```apache
# 重定向根路径的 favicon 请求
RedirectMatch 301 ^/favicon\.ico$ /logo-silhouette/favicon.svg
RedirectMatch 301 ^/favicon\.svg$ /logo-silhouette/favicon.svg

<Directory "/var/www/html/logo-silhouette">
    RewriteEngine On
    RewriteBase /logo-silhouette/
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /logo-silhouette/index.html [L]
</Directory>
```

---

## 常见问题

### Q1: 为什么 favicon 在标签页不显示？

**检查步骤**:
1. 确认访问的是 `/logo-silhouette/` (带末尾斜杠)
2. 硬刷新浏览器 (Ctrl+Shift+R / Cmd+Shift+R)
3. 清除浏览器缓存
4. 检查 Network 标签确认 favicon.svg 返回 200

### Q2: 为什么看到的是 Vite 的默认图标？

这是浏览器缓存问题：

**解决方法**:
```bash
# 1. 完全关闭浏览器
# 2. 清除缓存
# 3. 重新打开浏览器
# 4. 访问 http://localhost:4173/logo-silhouette/
```

### Q3: 开发环境没有这个问题，为什么预览有？

开发环境使用根路径 `/`，所以 `/favicon.svg` 是有效路径。
预览环境使用生产配置 `/logo-silhouette/`，所以需要访问 `/logo-silhouette/favicon.svg`。

---

## 最佳实践

### 开发阶段

```bash
# 开发环境 (根路径)
npm run dev
# 访问 http://localhost:5173/
# ✅ 无 favicon 404 错误
```

### 预览阶段

```bash
# 预览生产构建
npm run build
npm run preview
# 访问 http://localhost:4173/logo-silhouette/
# ⚠️  可能看到 favicon 404（可忽略）
# ✅ 但 favicon 会正确显示
```

### 生产部署

```bash
# 部署到服务器
scp -r dist/* user@server:/var/www/logo-silhouette/
# 配置服务器支持 /logo-silhouette/ 路径
# ✅ 服务器配置会处理 favicon 请求
```

---

## 总结

- 📝 **404 错误是预期行为**: 浏览器在解析 HTML 前的默认请求
- ✅ **功能正常**: Favicon 会通过 HTML link 标签正常加载
- 🔧 **生产环境**: 服务器配置会优雅处理这种情况
- 🚀 **无需担心**: 不影响用户体验和应用功能

**记住**: 只要访问 `http://localhost:4173/logo-silhouette/` (注意末尾斜杠)，应用就能正常工作！

---

**最后更新**: 2026-01-27
