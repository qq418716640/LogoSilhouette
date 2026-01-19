# LogoSilhouette V1 冻结方案 · 开发交付文档

> 面向对象：**前端 / 全栈 / 技术负责人**  
> 产品名：**LogoSilhouette**  
> 版本：**V1（冻结）**  
> 产品形态：**单页 Landing Page + Embedded App**  
> 本文档目标：**开发可直接按此实现，不再反复对齐需求**

---

## 0. 文档说明（必读）

- 本文档整合了：
  - **V1 冻结产品方案**
  - **A：HTML 结构骨架**
  - **B：预设与参数设计**
  - **C：处理管线与架构设计**
- 除非产品方明确提出变更，**V1 实现不得偏离本方案**
- 所有 UI 文案、交互、导出规格均已冻结

---

## 1. 产品核心目标（V1）

- 用户 **3 秒内可开始使用**
- 默认预设直接生成 **可用 Logo 剪影**
- 成功导出（SVG / PNG / JPG）是唯一核心转化
- 支撑 SEO Landing Page 即用即转化

---

## 2. 页面与路由结构（冻结）

### 2.1 页面形态
- ❌ 不存在 Tool Page
- ✅ **Landing Page = Tool Page**
- 单一路由（如 `/logosilhouette`）

### 2.2 页面结构顺序（不可调整）
```
Hero（可上传 / Sample）
Embedded App（工具本体）
-------------------------
How it works
Features
Use cases
FAQ
Final CTA
```

---

## 3. Hero 区交互规范（冻结）

### 必须包含
- H1：Free Logo Silhouette Generator
- Upload Image（Primary CTA）
- Try a sample logo（Secondary CTA）
- 隐私提示：No upload / Browser-based

### 行为
- Upload / Sample 均直接触发 Embedded App
- Sample：
  - 加载内置图片
  - 自动使用 **Minimal Logo（默认预设）**
  - 推荐：自动滚动至 Preview

---

## 4. Embedded App 功能模块（冻结）

Embedded App = 实际工具，包含以下模块：

1. Upload
2. Presets
3. Advanced Settings（默认折叠）
4. Preview
5. Export

---

## 5. 默认预设与参数设计（B 成果）

### 5.1 预设列表（V1 冻结）

| Preset | 是否默认 | 目标 |
|------|--------|------|
| Minimal Logo | ✅ 默认 | 极简、节点少、适合 Logo |
| Clean Silhouette | 否 | 通用剪影 |
| Keep Details | 否 | 保留细节 |

### 5.2 关键参数（抽象）
- threshold
- invert
- denoise_level
- simplification (pathOmit)
- auto_crop

> 高级设置仅允许微调，不改变预设整体方向

---

## 6. 图像处理管线（C 成果，核心）

### 6.1 内部统一规则
- **内部工作图：最长边缩放至 512px（等比）**
- 所有算法基于该尺寸

### 6.2 Pipeline 顺序（不可改）
```
decode image
→ resize (512px)
→ grayscale + threshold (+ invert)
→ denoise (lite)
→ main component detection
→ auto crop (+ padding)
→ bitmap tracing (SVG, 2 colors)
→ remove white paths
```

### 6.3 失败兜底
- 未检测到主体 → 跳过裁剪
- 生成失败 → 显示错误提示，不崩页面

---

## 7. 性能与架构要求（C 成果）

- 图像处理与 tracing **必须放入 Web Worker**
- 主线程仅负责：
  - UI
  - 预览渲染
  - 导出触发
- 参数变更 → **增量重算**
  - 改 simplification → 仅重跑 trace

---

## 8. 预览与状态规范

### Preview Tabs
- Original
- Black & White
- SVG Preview

### 状态
- Processing…
- Silhouette ready
- Empty state（首次）

---

## 9. 导出规范（冻结）

### 9.1 导出格式
- SVG（透明，仅黑色路径）
- PNG（透明）
- JPG（白底）

### 9.2 导出分辨率
- 512 × 512
- **1024 × 1024（默认）**
- 2048 × 2048

### 9.3 渲染规则
- 输出画布为正方形
- 剪影居中、不拉伸（contain）
- JPG 必须先铺白底

---

## 10. Sample Logo 机制（冻结）

- 必须支持 Try a sample logo
- Sample 行为与真实上传完全一致
- Sample 用于：提升激活率（Activation）

---

## 11. HTML 结构实现要求（A 成果）

- 已提供完整 HTML 语义结构骨架
- class / section / aria 已设计完成
- JS 实现不得破坏语义结构

> HTML 骨架文件见前置交付内容（不可自行重构）

---

## 12. 数据埋点要求（强制）

- 使用 **Umami**
- 事件前缀统一：`ls_`
- 导出事件必须完整

### MVP 必埋事件
- ls_image_uploaded / ls_sample_loaded
- ls_preset_selected
- ls_process_started / completed
- ls_export_click
- ls_export_completed / failed
- ls_outbound_main_product

> 详细事件表见《LogoSilhouette_数据埋点事件规范》

---

## 13. 不在 V1 范围内（明确不做）

- 批量处理
- 历史记录
- 登录 / 账户系统
- 云端存储
- OpenCV 增强模式
- 付费 / Pro 功能

---

## 14. V1 验收标准（开发自检）

- [ ] Hero 可直接使用
- [ ] Sample 一键生成结果
- [ ] 默认预设无需调整即可导出
- [ ] SVG 可在 Figma / Illustrator 打开
- [ ] PNG / JPG 尺寸正确、背景正确
- [ ] Worker 不阻塞 UI
- [ ] 导出埋点可在 Umami 看到

---

## 15. 相关参考文档

- 《LogoSilhouette_嵌入式应用程序产品方案》
- 《LogoSilhouette_落地页内容文档》
- 《LogoSilhouette_数据埋点事件规范》
- 《工具矩阵_统一规范》

---

**文档状态**：冻结（V1）  
**变更流程**：需产品负责人确认  
**维护人**：LogoSilhouette 产品团队
