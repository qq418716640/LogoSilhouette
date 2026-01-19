export type DenoiseLevel = 'off' | 'low' | 'medium' | 'high'

export type PresetId = 'minimal_logo' | 'clean_silhouette' | 'keep_details'

export interface ProcessParams {
  threshold: number           // 黑白阈值 (0-255)
  invert: boolean             // 是否反相
  denoiseLevel: DenoiseLevel  // 降噪级别
  removeSpecksMinArea: number // 去小黑点最小面积
  fillHolesMaxArea: number    // 填洞最大面积
  autoCrop: boolean           // 是否自动裁剪
  cropPaddingPct: number      // 裁剪留边百分比
  minMainComponentAreaPct: number // 主体最小面积百分比
  pathOmit: number            // SVG 路径简化程度
  cornerThreshold: number     // 曲线拟合角度阈值 (度)
}

export interface Preset {
  id: PresetId
  name: string
  description: string
  params: ProcessParams
}
