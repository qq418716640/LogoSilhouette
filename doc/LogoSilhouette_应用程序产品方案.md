# LogoSilhouette 嵌入式应用程序产品方案

> 产品名：**LogoSilhouette**  
> 产品形态：**单页 Landing Page 内嵌工具（Embedded App）**  
> 目标用户：需要将 Logo / 图形快速转为剪影的设计师、创业者、运营人员  
> 核心输出：SVG / PNG（透明）/ JPG（白底）

---

## 1. 产品定位

LogoSilhouette 是一个**轻量、快速、无需登录**的 Logo 剪影生成工具，专注于：

- 将位图 Logo 转换为 **干净的黑色剪影**
- 输出 **可生产使用的 SVG**
- 满足 Web / Print / Logo 制作等高频场景

默认服务于 **Logo 制作工具矩阵**，以工具即用、快速转化为核心目标。

---

## 2. 整体产品形态

- **没有独立 Tool Page**
- Landing Page 本身即为可操作工具
- 页面结构分为两部分：
  - 上半部分：真实可用的嵌入式应用
  - 下半部分：SEO 内容（说明 / FAQ / 转化）

---

## 3. 用户流程（核心）

1. 用户进入页面（Hero 即可操作）
2. 上传 Logo 或点击 **Try a sample logo**
3. 默认使用 **Minimal Logo（默认预设）**
4. 实时生成剪影预览
5. 选择格式与分辨率
6. 下载 SVG / PNG / JPG

---

## 4. 图像处理管线（Pipeline）

### 4.1 内部统一规则

- **内部工作图尺寸**：最长边缩放到 **512px（等比，不拉伸）**
- 后续所有算法均基于该尺寸运行

### 4.2 处理步骤

1. 灰度化 + 阈值（可反相）
2. 轻量降噪（去小黑点 / 填洞）
3. 最大连通域识别主体
4. 自动裁剪（可 padding，失败兜底）
5. 位图描摹（2 色 SVG）
6. 删除白色路径，仅保留黑色剪影

---

## 5. 预设设计（V1 冻结）

### 5.1 Minimal Logo（默认）
- 目标：极简、块面化、节点少
- 适合：Logo mark、图标、激光切割

### 5.2 Clean Silhouette
- 目标：通用剪影，平衡细节与干净度

### 5.3 Keep Details
- 目标：保留细节轮廓（发丝、细线）

> 高级设置仅作为微调，预设为主路径

---

## 6. 高级设置（Advanced Settings）

- Threshold
- Invert colors
- Simplification（path 简化）
- Noise Cleanup（Off / Low / Medium / High）
- Auto crop to logo
- Reset to preset defaults

默认折叠，避免干扰新用户。

---

## 7. 导出规格（最终冻结）

### SVG
- 透明背景
- 仅黑色路径
- 可直接用于 Figma / Illustrator

### PNG（透明）
- 512 × 512
- **1024 × 1024（默认）**
- 2048 × 2048

### JPG（白底）
- 512 × 512
- **1024 × 1024（默认）**
- 2048 × 2048

---

## 8. Sample Logo 机制

- Hero 与 Upload 区均提供 **Try a sample logo**
- 行为：
  1. 加载内置示例
  2. 自动运行 Minimal Logo
  3. 自动滚动到 Preview（推荐）

目的：降低首次使用门槛，提高激活率。

---

## 9. 技术与架构要点（简述）

- 前端：Vite + TS
- 计算密集步骤放入 Web Worker
- 参数变更 → 增量重算（避免全量 pipeline）
- SVG / Raster 导出独立模块

---

## 10. 数据与优化目标

- 核心转化：**成功导出**
- 次级指标：
  - sample 使用率
  - 默认预设转化率
  - 各格式 / 分辨率使用分布

---

版本：v1  
维护人：LogoSilhouette 产品团队
