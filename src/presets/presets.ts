import type { Preset, PresetId, ProcessParams } from './types'

/**
 * V1 冻结预设参数
 * 参见: LogoSilhouette_V1_冻结方案_开发交付文档_完整版.md
 */

export const PRESETS: Record<PresetId, Preset> = {
  minimal_logo: {
    id: 'minimal_logo',
    name: 'Minimal Logo',
    description: 'Ultra-clean silhouette, fewer nodes, ideal for logo marks.',
    params: {
      threshold: 175,
      invert: false,
      denoiseLevel: 'high',
      removeSpecksMinArea: 140,
      fillHolesMaxArea: 220,
      autoCrop: true,
      cropPaddingPct: 8,
      minMainComponentAreaPct: 1.2,
      pathOmit: 18,
    },
  },
  clean_silhouette: {
    id: 'clean_silhouette',
    name: 'Clean Silhouette',
    description: 'Balanced cleanup for most images.',
    params: {
      threshold: 160,
      invert: false,
      denoiseLevel: 'medium',
      removeSpecksMinArea: 80,
      fillHolesMaxArea: 120,
      autoCrop: true,
      cropPaddingPct: 6,
      minMainComponentAreaPct: 1.0,
      pathOmit: 10,
    },
  },
  keep_details: {
    id: 'keep_details',
    name: 'Keep Details',
    description: 'Preserve finer strokes and complex contours.',
    params: {
      threshold: 145,
      invert: false,
      denoiseLevel: 'low',
      removeSpecksMinArea: 40,
      fillHolesMaxArea: 60,
      autoCrop: true,
      cropPaddingPct: 4,
      minMainComponentAreaPct: 0.8,
      pathOmit: 4,
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
