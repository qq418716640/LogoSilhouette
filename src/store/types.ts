/**
 * 状态类型定义
 */

import type { ProcessParams, PresetId } from '@/presets/types'
import type { PipelineCache, PipelineResult } from '@/core/pipeline/types'

export type ExportFormat = 'svg' | 'png' | 'jpg'
export type ExportResolution = 512 | 1024 | 2048
export type PreviewTab = 'original' | 'bw' | 'result'

// 预设填充色
export const FILL_COLOR_PRESETS = [
  '#000000',
  '#FFFFFF',
  '#FF383C',
  '#006FFF',
  '#B8986C',
  '#4E4E58',
] as const

export interface SourceInfo {
  width: number
  height: number
  type: string
  name: string
  size: number
}

export interface AppState {
  // 源图像
  sourceImage: ImageData | null
  sourceInfo: SourceInfo | null

  // 预设与参数
  activePreset: PresetId
  params: ProcessParams

  // 处理结果
  pipelineCache: Partial<PipelineCache>
  result: PipelineResult | null

  // 导出配置
  exportFormat: ExportFormat
  exportResolution: ExportResolution
  fillColor: string

  // UI 状态
  isProcessing: boolean
  processingProgress: number
  advancedOpen: boolean
  previewTab: PreviewTab
  error: string | null
}

export interface AppActions {
  // 图像操作
  setSourceImage: (imageData: ImageData, info: SourceInfo) => void
  clearSourceImage: () => void

  // 预设操作
  setActivePreset: (presetId: PresetId) => void

  // 参数操作
  setParams: (params: Partial<ProcessParams>) => void
  resetParamsToPreset: () => void

  // 处理结果
  setResult: (result: PipelineResult, cache: PipelineCache) => void
  clearResult: () => void

  // 处理状态
  setProcessing: (isProcessing: boolean, progress?: number) => void
  setError: (error: string | null) => void

  // 导出配置
  setExportFormat: (format: ExportFormat) => void
  setExportResolution: (resolution: ExportResolution) => void
  setFillColor: (color: string) => void

  // UI 状态
  setAdvancedOpen: (open: boolean) => void
  setPreviewTab: (tab: PreviewTab) => void

  // 重置
  reset: () => void
}

export type AppStore = AppState & AppActions
