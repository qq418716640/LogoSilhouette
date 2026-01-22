/**
 * 案例数据配置
 */

import type { ProcessParams, PresetId } from '@/presets/types'

export interface CaseData {
  id: string
  /** 源图片路径（用于制作同款） */
  sourceImage: string
  /** 效果展示图路径 */
  previewImage: string
  /** 预设 ID */
  presetId?: PresetId
  /** 需要覆盖的参数 */
  params?: Partial<ProcessParams>
  /** 填充颜色（导出时使用） */
  fillColor?: string
}

export const CASES: CaseData[] = [
  {
    id: 'case_1',
    sourceImage: '/cases/case_1.png',
    previewImage: '/cases/case_1_BA_43403D.png',
    fillColor: '#43403D',
  },
  {
    id: 'case_2',
    sourceImage: '/cases/case_2.png',
    previewImage: '/cases/case_2_BA_Minimal logo_Threshold 140_Invert colors.png',
    presetId: 'minimal_logo',
    params: {
      threshold: 140,
      invert: true,
    },
  },
  {
    id: 'case_3',
    sourceImage: '/cases/case_3.png',
    previewImage: '/cases/case_3_BA_Smoothness 3.0.png',
    params: {
      qtres: 3.0,
    },
  },
  {
    id: 'case_4',
    sourceImage: '/cases/case_4.png',
    previewImage: '/cases/case_4_BA_Keep details_Smoothness 3.0.png',
    presetId: 'keep_details',
    params: {
      qtres: 3.0,
    },
  },
]
