export type DenoiseLevel = 'off' | 'low' | 'medium' | 'high'

export type PresetId = 'minimal_logo' | 'clean_silhouette' | 'keep_details'

export type WorkingResolution = 512 | 1024 | 2048

export interface ProcessParams {
  // 工作分辨率
  maxSize: WorkingResolution  // 工作分辨率（最长边）

  // 二值化参数
  threshold: number           // 黑白阈值 (0-255)
  invert: boolean             // 是否反相

  // 降噪参数
  denoiseLevel: DenoiseLevel  // 降噪级别
  removeSpecksMinArea: number // 去小黑点最小面积
  fillHolesMaxArea: number    // 填洞最大面积

  // 裁剪参数
  autoCrop: boolean           // 是否自动裁剪
  cropPaddingPct: number      // 裁剪留边百分比
  minMainComponentAreaPct: number // 主体最小面积百分比

  // SVG tracing 参数 (imagetracerjs)
  qtres: number               // 曲线容差 (0.5-3.0)，值越大越平滑
  ltres: number               // 直线容差 (0.5-3.0)，值越大直线越少
  pathomit: number            // 路径最小节点数，用于噪声过滤
  roundcoords: number         // 坐标精度 (1-3)
  rightangleenhance: boolean  // 是否增强直角
}

export interface Preset {
  id: PresetId
  name: string
  description: string
  params: ProcessParams
}
