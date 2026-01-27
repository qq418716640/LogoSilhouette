# Umami 私有化部署配置说明

## 部署信息

本项目使用私有化部署的 Umami 实例,而非 Umami Cloud 公共服务。

### 私有部署地址
- **Umami Dashboard**: https://umami-rose-delta.vercel.app
- **Script URL**: https://umami-rose-delta.vercel.app/script.js
- **API Endpoint**: https://umami-rose-delta.vercel.app/api/send

### Website ID
- **开发/生产环境**: `8133b90d-9f06-4b08-a1ef-9f522a35490d`

---

## 与 Umami Cloud 的区别

| 项目 | Umami Cloud | 私有部署 |
|-----|-------------|---------|
| Dashboard URL | https://cloud.umami.is | https://umami-rose-delta.vercel.app |
| Script URL | https://cloud.umami.is/script.js | https://umami-rose-delta.vercel.app/script.js |
| API Endpoint | https://cloud.umami.is/api/send | https://umami-rose-delta.vercel.app/api/send |
| 数据存储 | Umami 服务器 | 你的 Vercel + 数据库 |
| 隐私控制 | 完全自主 | 完全自主 |

---

## 访问 Dashboard

1. 访问: https://umami-rose-delta.vercel.app
2. 使用你的账号密码登录
3. 选择对应的 Website 查看数据

---

## 重要提醒

### 环境变量配置

所有环境变量文件已配置为指向私有部署:

```bash
# .env.development
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js

# .env.production
VITE_UMAMI_SRC=https://umami-rose-delta.vercel.app/script.js
```

### 更新配置后重启服务

修改 `.env.*` 文件后,必须重启开发服务器:

```bash
# 停止当前服务 (Ctrl+C)
# 然后重新启动
npm run dev
```

Vite 只在启动时读取环境变量,运行时修改不会生效。

---

## 验证配置

### 1. 检查脚本加载

打开浏览器开发者工具 → Network 标签,应该看到:

```
Request URL: https://umami-rose-delta.vercel.app/script.js
Status: 200 OK
```

### 2. 检查数据上报

触发一些交互后,应该看到:

```
Request URL: https://umami-rose-delta.vercel.app/api/send
Request Method: POST
Status: 200 OK
```

### 3. 检查控制台日志

开发环境下,控制台应该显示:

```
[Analytics] ls_page_ready { ... }
[Analytics] ls_app_loaded { ... }
```

---

## 常见问题

### Q: 为什么看到 404 错误?

如果看到 `POST https://api-gateway.umami.dev/api/send 404`,说明配置还指向了旧地址。

**解决方法**:
1. 检查 `.env.development` 中的 `VITE_UMAMI_SRC` 是否正确
2. 重启开发服务器 (`npm run dev`)
3. 硬刷新浏览器 (Ctrl+Shift+R / Cmd+Shift+R)

### Q: 数据没有显示在 Dashboard?

**检查清单**:
- [ ] Umami 服务是否正常运行 (访问 Dashboard 能否打开)
- [ ] Website ID 是否正确
- [ ] 浏览器 Network 中能否看到成功的 `/api/send` 请求
- [ ] Dashboard 中选择的时间范围是否包含当前时间

### Q: 本地开发看不到控制台日志?

确认:
- 使用的是开发环境 (`npm run dev`)
- 浏览器控制台没有过滤 `[Analytics]`
- `tracker.ts` 中的 `import.meta.env.DEV` 判断正常

---

## Vercel 部署说明

你的 Umami 部署在 Vercel 上,具有以下特点:

### 优势
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 免费额度充足
- ✅ 无需维护服务器

### 注意事项
- Vercel 免费版有请求限制,大流量网站建议升级
- 需要配置数据库 (推荐 PostgreSQL)
- 定期备份数据

---

**最后更新**: 2026-01-27
