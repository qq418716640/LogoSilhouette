# LogoSilhouette 数据埋点事件规范（Umami）

> 适用产品：**LogoSilhouette**  
> 产品形态：**单页 Landing Page + 内嵌工具（Embedded App）**  
> 分析工具：**Umami Analytics**  
> 目标：清晰衡量【使用 → 生成 → 导出】核心转化，重点关注导出行为

---

## 1. 埋点设计原则

- 使用 `umami.track(event, data)`
- **事件名稳定、字段可扩展**
- 核心关注：
  - 是否用起来（upload / sample）
  - 是否生成成功（process）
  - 是否导出成功（export）
- 所有事件统一前缀：`ls_`（LogoSilhouette）

---

## 2. 全局公共字段（所有事件默认附带）

建议在封装的 `track()` 方法中自动注入：

| 字段 | 示例 |
|----|----|
| tool | LogoSilhouette |
| tool_version | v1 |
| page | /logosilhouette |
| locale | en-US |
| utm_source | google |
| utm_medium | organic |
| utm_campaign | logo-tools |
| ab_variant | hero_a |

> Umami 已自动采集：URL、referrer、设备、浏览器、OS

---

## 3. 页面级事件（Page-level）

| 事件名 | 触发时机 | data |
|------|--------|------|
| ls_page_ready | 页面可交互 | tt_interactive_ms |
| ls_scroll_depth | 首次滚动到阈值 | percent |
| ls_section_view | 关键区块曝光 | section_id |

section_id：hero / embedded_app / faq / final_cta

---

## 4. Hero 区事件

| 事件名 | 触发时机 | data |
|------|--------|------|
| ls_hero_view | Hero 首次曝光 | — |
| ls_hero_upload_click | Hero 上传按钮 | cta_id |
| ls_hero_sample_click | Try a sample logo | sample_id |

---

## 5. Embedded App 核心事件（使用漏斗）

| 事件名 | 触发时机 | data |
|------|--------|------|
| ls_app_loaded | 工具初始化完成 | worker_supported |
| ls_upload_open | 打开文件选择器 | source |
| ls_image_uploaded | 成功上传文件 | file_type, file_size_kb, img_w, img_h |
| ls_image_dropped | 拖拽上传 | 同上 |
| ls_sample_loaded | 示例图加载完成 | sample_id |
| ls_preset_selected | 切换预设 | preset, is_default |
| ls_advanced_toggle | 展开/收起高级设置 | state |
| ls_param_changed | 参数变化（节流） | param, value |
| ls_process_started | pipeline 开始 | trigger, start_step |
| ls_process_completed | pipeline 完成 | duration_ms, fallback_no_crop |
| ls_process_failed | pipeline 失败 | step, error_code |
| ls_preview_tab | 切换预览 | tab |

preset 枚举：minimal_logo / clean_silhouette / keep_details

---

## 6. 导出事件（最重要）

### 6.1 导出配置

| 事件名 | 触发 | data |
|------|----|------|
| ls_export_panel_view | Export 区曝光 | — |
| ls_export_format | 选择格式 | format |
| ls_export_resolution | 选择分辨率 | resolution |

format：svg / png / jpg  
resolution：512 / 1024 / 2048

---

### 6.2 导出执行与结果

| 事件名 | 触发 | data |
|------|----|------|
| ls_export_click | 点击下载 | format, resolution, preset, has_result |
| ls_export_started | 开始生成文件 | format, resolution |
| ls_export_completed | 文件生成完成 | format, resolution, duration_ms, file_size_kb |
| ls_export_download | 浏览器下载触发 | format, resolution |
| ls_export_failed | 导出失败 | format, resolution, stage, error_code |

stage：rasterize / serialize / blob / download

---

### 6.3 SVG 质量指标（可选但推荐）

| 事件名 | 触发 | data |
|------|----|------|
| ls_svg_quality | SVG clean 后 | paths_count, nodes_count, white_removed |

---

## 7. 导航与引流事件

| 事件名 | 触发 | data |
|------|----|------|
| ls_nav_click | 导航点击 | location, link_id, to |
| ls_outbound_main_product | 去主营产品 | to |
| ls_cta_click | CTA 点击 | cta_id, location |
| ls_external_link | 外链点击 | to_domain |

---

## 8. FAQ 交互事件（推荐）

| 事件名 | 触发 | data |
|------|----|------|
| ls_faq_view | FAQ 区曝光 | — |
| ls_faq_toggle | 展开/收起 FAQ | faq_id, state |
| ls_faq_link | FAQ 内链接 | faq_id, to |

---

## 9. MVP 最小埋点集（强烈推荐）

上线初期 **至少埋以下事件**：

1. ls_hero_sample_click  
2. ls_image_uploaded / ls_sample_loaded  
3. ls_preset_selected  
4. ls_process_started  
5. ls_process_completed  
6. ls_export_format  
7. ls_export_resolution  
8. ls_export_click  
9. ls_export_completed  
10. ls_export_failed  
11. ls_nav_click  
12. ls_outbound_main_product  

---

## 10. 核心分析问题（埋点目标）

- Sample vs Upload：哪种更容易导出？
- Minimal Logo 是否是最佳默认预设？
- SVG / PNG / JPG 的真实使用比例？
- 1024 是否为主流分辨率？
- 导出失败率与失败阶段？
- 完成生成但未导出的流失点在哪里？

---

**文档维护人**：LogoSilhouette 产品团队  
**版本**：v1  
