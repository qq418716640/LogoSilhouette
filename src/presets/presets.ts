import type { Preset, PresetId, ProcessParams } from './types'

/**
 * V2 预设参数 - 使用 imagetracerjs
 *
 * qtres/ltres 参数说明：
 * - 值越小：越严格贴合原始轮廓，更多点/更多折线
 * - 值越大：允许更大误差用曲线概括，更平滑，折线更少
 *
 * 推荐范围：
 * - Keep Details: qtres = 0.8 ~ 1.2
 * - Clean Silhouette: qtres = 1.2 ~ 1.8
 * - Minimal Logo: qtres = 1.8 ~ 3.0
 */

export const PRESETS: Record<PresetId, Preset> = {
  minimal_logo: {
    id: 'minimal_logo',
    name: 'Minimal Logo',
    description: 'Ultra-clean silhouette, fewer nodes, ideal for logo marks.',
    params: {
      // 二值化
      threshold: 175,
      invert: false,
      // 降噪
      denoiseLevel: 'high',
      removeSpecksMinArea: 140,
      fillHolesMaxArea: 220,
      // 裁剪
      autoCrop: false,
      cropPaddingPct: 8,
      minMainComponentAreaPct: 1.2,
      // SVG tracing (imagetracerjs)
      qtres: 2.5,
      ltres: 2.0,
      pathomit: 16,
      roundcoords: 2,
      rightangleenhance: true,
    },
  },
  clean_silhouette: {
    id: 'clean_silhouette',
    name: 'Clean Silhouette',
    description: 'Balanced cleanup for most images.',
    params: {
      // 二值化
      threshold: 160,
      invert: false,
      // 降噪
      denoiseLevel: 'medium',
      removeSpecksMinArea: 80,
      fillHolesMaxArea: 120,
      // 裁剪
      autoCrop: false,
      cropPaddingPct: 6,
      minMainComponentAreaPct: 1.0,
      // SVG tracing (imagetracerjs)
      qtres: 1.5,
      ltres: 1.2,
      pathomit: 10,
      roundcoords: 2,
      rightangleenhance: true,
    },
  },
  keep_details: {
    id: 'keep_details',
    name: 'Keep Details',
    description: 'Preserve finer strokes and complex contours.',
    params: {
      // 二值化
      threshold: 145,
      invert: false,
      // 降噪
      denoiseLevel: 'low',
      removeSpecksMinArea: 40,
      fillHolesMaxArea: 60,
      // 裁剪
      autoCrop: false,
      cropPaddingPct: 4,
      minMainComponentAreaPct: 0.8,
      // SVG tracing (imagetracerjs)
      qtres: 1.0,
      ltres: 0.8,
      pathomit: 4,
      roundcoords: 2,
      rightangleenhance: true,
    },
  },
}

export const DEFAULT_PRESET_ID: PresetId = 'minimal_logo'

export function getPreset(id: PresetId): Preset {
  return PRESETS[id]
}

export function getDefaultParams(): ProcessParams {
  return { ...PRESETS[DEFAULT_PRESET_ID].params }
}

export function getPresetList(): Preset[] {
  return Object.values(PRESETS)
}
