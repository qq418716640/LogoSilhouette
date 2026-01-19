/**
 * 埋点事件定义
 * 参见: LogoSilhouette_数据埋点事件规范.md
 */

import { tracker } from './tracker'

export const events = {
  // ========== Hero 区事件 ==========
  heroView: () => tracker.track('ls_hero_view'),

  heroUploadClick: (ctaId: string) =>
    tracker.track('ls_hero_upload_click', { cta_id: ctaId }),

  heroSampleClick: (sampleId: string) =>
    tracker.track('ls_hero_sample_click', { sample_id: sampleId }),

  // ========== 上传事件 ==========
  uploadOpen: (source: 'hero' | 'app') =>
    tracker.track('ls_upload_open', { source }),

  imageUploaded: (info: {
    fileType: string
    fileSizeKb: number
    imgW: number
    imgH: number
  }) =>
    tracker.track('ls_image_uploaded', {
      file_type: info.fileType,
      file_size_kb: info.fileSizeKb,
      img_w: info.imgW,
      img_h: info.imgH,
    }),

  imageDropped: (info: {
    fileType: string
    fileSizeKb: number
    imgW: number
    imgH: number
  }) =>
    tracker.track('ls_image_dropped', {
      file_type: info.fileType,
      file_size_kb: info.fileSizeKb,
      img_w: info.imgW,
      img_h: info.imgH,
    }),

  sampleLoaded: (sampleId: string) =>
    tracker.track('ls_sample_loaded', { sample_id: sampleId }),

  // ========== 预设事件 ==========
  presetSelected: (preset: string, isDefault: boolean) =>
    tracker.track('ls_preset_selected', { preset, is_default: isDefault }),

  advancedToggle: (state: 'open' | 'close') =>
    tracker.track('ls_advanced_toggle', { state }),

  paramChanged: (param: string, value: unknown) =>
    tracker.track('ls_param_changed', { param, value }),

  // ========== 处理事件 ==========
  processStarted: (trigger: string, startStep: string) =>
    tracker.track('ls_process_started', { trigger, start_step: startStep }),

  processCompleted: (durationMs: number, fallbackNoCrop: boolean) =>
    tracker.track('ls_process_completed', {
      duration_ms: durationMs,
      fallback_no_crop: fallbackNoCrop,
    }),

  processFailed: (step: string, errorCode: string) =>
    tracker.track('ls_process_failed', { step, error_code: errorCode }),

  previewTab: (tab: string) => tracker.track('ls_preview_tab', { tab }),

  // ========== 导出事件 ==========
  exportPanelView: () => tracker.track('ls_export_panel_view'),

  exportFormat: (format: string) =>
    tracker.track('ls_export_format', { format }),

  exportResolution: (resolution: number) =>
    tracker.track('ls_export_resolution', { resolution }),

  exportClick: (data: {
    format: string
    resolution: number
    preset: string
    hasResult: boolean
  }) => tracker.track('ls_export_click', data),

  exportStarted: (format: string, resolution: number) =>
    tracker.track('ls_export_started', { format, resolution }),

  exportCompleted: (data: {
    format: string
    resolution: number
    durationMs: number
    fileSizeKb: number
  }) =>
    tracker.track('ls_export_completed', {
      format: data.format,
      resolution: data.resolution,
      duration_ms: data.durationMs,
      file_size_kb: data.fileSizeKb,
    }),

  exportFailed: (data: {
    format: string
    resolution: number
    stage: string
    errorCode: string
  }) =>
    tracker.track('ls_export_failed', {
      format: data.format,
      resolution: data.resolution,
      stage: data.stage,
      error_code: data.errorCode,
    }),

  exportDownload: (format: string, resolution: number) =>
    tracker.track('ls_export_download', { format, resolution }),

  // ========== SVG 质量指标 ==========
  svgQuality: (data: {
    pathsCount: number
    nodesCount: number
    whiteRemoved: number
  }) =>
    tracker.track('ls_svg_quality', {
      paths_count: data.pathsCount,
      nodes_count: data.nodesCount,
      white_removed: data.whiteRemoved,
    }),

  // ========== 导航事件 ==========
  navClick: (data: { location: string; linkId: string; to: string }) =>
    tracker.track('ls_nav_click', data),

  outboundMainProduct: (to: string) =>
    tracker.track('ls_outbound_main_product', { to }),

  ctaClick: (ctaId: string, location: string) =>
    tracker.track('ls_cta_click', { cta_id: ctaId, location }),

  externalLink: (toDomain: string) =>
    tracker.track('ls_external_link', { to_domain: toDomain }),

  // ========== FAQ 事件 ==========
  faqView: () => tracker.track('ls_faq_view'),

  faqToggle: (faqId: string, state: 'open' | 'close') =>
    tracker.track('ls_faq_toggle', { faq_id: faqId, state }),

  faqLink: (faqId: string, to: string) =>
    tracker.track('ls_faq_link', { faq_id: faqId, to }),

  // ========== 页面级事件 ==========
  pageReady: (ttInteractiveMs: number) =>
    tracker.track('ls_page_ready', { tt_interactive_ms: ttInteractiveMs }),

  scrollDepth: (percent: number) =>
    tracker.track('ls_scroll_depth', { percent }),

  sectionView: (sectionId: string) =>
    tracker.track('ls_section_view', { section_id: sectionId }),

  appLoaded: (workerSupported: boolean) =>
    tracker.track('ls_app_loaded', { worker_supported: workerSupported }),
}

export { tracker }
