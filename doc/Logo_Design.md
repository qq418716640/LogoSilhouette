# LogoSilhouette 图标设计文档

## 设计理念

LogoSilhouette 的图标设计围绕"从彩色图像到黑色轮廓"的核心转换过程展开。

### 视觉元素

1. **左侧 - 原始图像**
   - 多个半透明彩色圆形重叠
   - 代表原始的彩色、复杂的 Logo
   - 使用柔和的渐变色 (蓝色、绿色、粉色)

2. **中间 - 转换过程**
   - 向右的箭头表示处理方向
   - 虚线连接表示转换过程
   - 白色高亮表示"智能处理"

3. **右侧 - 生成的轮廓**
   - 清晰的黑色单色形状
   - 平滑的曲线轮廓
   - 白色描边发光效果增强质感

4. **底部标识**
   - "LS" 字母缩写 (LogoSilhouette)
   - 简洁醒目,易于识别

### 配色方案

- **主色调**: 渐变紫蓝色 (#6366f1 → #8b5cf6)
- **原图色**: 蓝色 (#60a5fa) / 绿色 (#34d399) / 粉色 (#f472b6)
- **轮廓色**: 深灰黑 (#1e293b)
- **强调色**: 白色 (用于箭头和发光)

---

## 图标文件清单

### 核心图标

| 文件 | 尺寸 | 用途 |
|------|------|------|
| `public/favicon.svg` | 32x32 | 浏览器标签页图标 (简化版) |
| `public/logo.svg` | 200x200 | 网站 Logo、Header、社交分享 |
| `public/logo-192.svg` | 192x192 | PWA 图标、Android |
| `public/logo-512.svg` | 512x512 | PWA 启动图、高清展示 |

### 配置文件

| 文件 | 说明 |
|------|------|
| `public/manifest.json` | PWA 应用清单,定义图标和主题 |

---

## 使用示例

### 1. 在 React 组件中使用

```tsx
import { getAssetPath } from '@/utils/path'

// Header Logo
<img
  src={getAssetPath('/logo.svg')}
  alt="LogoSilhouette"
  className="w-8 h-8"
/>

// 大尺寸展示
<img
  src={getAssetPath('/logo-512.svg')}
  alt="LogoSilhouette"
  className="w-32 h-32"
/>
```

### 2. 在 HTML 中使用

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/logo-192.svg" />

<!-- Open Graph 社交分享 -->
<meta property="og:image" content="/logo-512.svg" />
```

### 3. 在 CSS 中使用

```css
.logo {
  background-image: url('/logo.svg');
  background-size: contain;
  width: 40px;
  height: 40px;
}
```

---

## 图标规格

### favicon.svg (32x32)

**特点**:
- 极简设计,小尺寸下清晰可辨
- 去除文字,只保留核心图形
- 适合浏览器标签页

**优化**:
- 减少细节,增强对比度
- 放大核心转换元素
- 确保 16x16 缩放后仍可识别

### logo.svg (200x200)

**特点**:
- 标准尺寸,平衡细节与文件大小
- 包含 "LS" 文字标识
- 适合 Header、社交分享、文档封面

**用途**:
- 网站 Header Logo
- README 封面
- 文档配图
- 社交媒体头像

### logo-192.svg (192x192)

**特点**:
- PWA 标准图标尺寸
- 支持 Android 添加到主屏幕
- Maskable 安全区设计

**用途**:
- Android 应用图标
- PWA 安装图标
- Chrome 新标签页快捷方式

### logo-512.svg (512x512)

**特点**:
- 高清大尺寸
- 完整细节和发光效果
- 支持高 DPI 显示

**用途**:
- PWA 启动画面
- App Store 截图
- 高清宣传素材
- 打印材料

---

## 技术细节

### SVG 优势

- ✅ **矢量无损**: 任意缩放不失真
- ✅ **文件小**: 比 PNG 小 80%+
- ✅ **可编辑**: 轻松修改颜色和样式
- ✅ **支持动画**: 可添加交互效果
- ✅ **SEO 友好**: 可被搜索引擎索引

### 浏览器兼容性

| 浏览器 | 支持 SVG Favicon | 支持 SVG Icon |
|--------|------------------|---------------|
| Chrome 80+ | ✅ | ✅ |
| Firefox 72+ | ✅ | ✅ |
| Safari 14+ | ✅ | ✅ |
| Edge 79+ | ✅ | ✅ |

---

## 自定义修改

### 修改颜色

编辑对应的 SVG 文件,调整渐变色:

```svg
<!-- 主背景渐变 -->
<linearGradient id="bgGradient">
  <stop offset="0%" style="stop-color:#6366f1" />   <!-- 起始色 -->
  <stop offset="100%" style="stop-color:#8b5cf6" /> <!-- 结束色 -->
</linearGradient>
```

### 修改尺寸

SVG 会自动适配容器,无需修改 `viewBox`:

```tsx
// 小尺寸
<img src="/logo.svg" className="w-6 h-6" />

// 中尺寸
<img src="/logo.svg" className="w-12 h-12" />

// 大尺寸
<img src="/logo.svg" className="w-24 h-24" />
```

### 导出 PNG (可选)

如果需要 PNG 版本:

1. 使用在线工具: https://svgtopng.com/
2. 或使用 ImageMagick:
   ```bash
   convert -background none logo.svg -resize 512x512 logo-512.png
   ```

---

## PWA 配置

### manifest.json

已配置完整的 PWA 图标:

```json
{
  "name": "LogoSilhouette",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    },
    {
      "src": "/logo-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/logo-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

### 测试 PWA 图标

1. 在 Chrome 中打开应用
2. 开发者工具 → Application 标签
3. 左侧 Manifest 查看图标预览
4. 测试 "添加到主屏幕"

---

## 社交媒体优化

### Open Graph (Facebook, LinkedIn)

```html
<meta property="og:image" content="https://logosilhouette.com/logo-512.svg" />
<meta property="og:image:width" content="512" />
<meta property="og:image:height" content="512" />
<meta property="og:image:alt" content="LogoSilhouette Logo" />
```

### Twitter Card

```html
<meta name="twitter:image" content="https://logosilhouette.com/logo-512.svg" />
<meta name="twitter:card" content="summary" />
```

---

## 品牌指南

### Logo 使用规范

**✅ 推荐**:
- 在白色或浅色背景上使用
- 保持图标完整,不裁剪
- 保持足够的留白空间
- 使用原始颜色或纯白版本

**❌ 避免**:
- 拉伸变形
- 旋转倾斜
- 添加阴影或边框
- 修改内部元素比例

### 最小尺寸

- **数字屏幕**: 最小 24x24px
- **打印材料**: 最小 15mm x 15mm

### 安全区

Logo 周围保持至少 Logo 宽度 10% 的留白。

---

## 文件路径配置

所有图标文件位于 `public/` 目录,使用时需通过 `getAssetPath()` 处理:

```tsx
// ❌ 错误 - 硬编码路径
<img src="/logo.svg" />

// ✅ 正确 - 支持 base path
import { getAssetPath } from '@/utils/path'
<img src={getAssetPath('/logo.svg')} />
```

这样可以确保在不同部署环境 (根路径或二级路径) 下都能正确加载。

---

## 设计工具

### 推荐编辑器

- **Figma**: 在线协作,导出 SVG
- **Adobe Illustrator**: 专业矢量编辑
- **Inkscape**: 免费开源 SVG 编辑器
- **Sketch**: macOS 设计工具

### 在线优化工具

- **SVGOMG**: https://jakearchibald.github.io/svgomg/
  - 压缩 SVG 文件大小
  - 移除无用代码

- **SVG Viewer**: https://www.svgviewer.dev/
  - 预览和调试 SVG
  - 检查渲染效果

---

## 更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-01-27 | v1.0 | 初始设计,创建所有尺寸图标 |

---

## 下一步优化

- [ ] 添加深色模式版本 (白色轮廓 + 深色背景)
- [ ] 创建动画版本 (箭头移动 + 转换过程)
- [ ] 设计水平布局的 Logo 变体 (图标 + 文字横向排列)
- [ ] 制作品牌 Guidelines PDF

---

**最后更新**: 2026-01-27
