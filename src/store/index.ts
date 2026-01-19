/**
 * 全局状态管理 (Zustand)
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { AppStore, AppState } from './types'
import { DEFAULT_PRESET_ID, getPreset, getDefaultParams } from '@/presets/presets'

const initialState: AppState = {
  // 源图像
  sourceImage: null,
  sourceInfo: null,

  // 预设与参数
  activePreset: DEFAULT_PRESET_ID,
  params: getDefaultParams(),

  // 处理结果
  pipelineCache: {},
  result: null,

  // 导出配置
  exportFormat: 'svg',
  exportResolution: 1024,

  // UI 状态
  isProcessing: false,
  processingProgress: 0,
  advancedOpen: false,
  previewTab: 'result',
  error: null,
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // 图像操作
    setSourceImage: (imageData, info) => {
      set({
        sourceImage: imageData,
        sourceInfo: info,
        result: null,
        pipelineCache: {},
        error: null,
        previewTab: 'result',
      })
    },

    clearSourceImage: () => {
      set({
        sourceImage: null,
        sourceInfo: null,
        result: null,
        pipelineCache: {},
        error: null,
      })
    },

    // 预设操作
    setActivePreset: (presetId) => {
      const preset = getPreset(presetId)
      set({
        activePreset: presetId,
        params: { ...preset.params },
        // 预设变化需要重新处理
        pipelineCache: {},
      })
    },

    // 参数操作
    setParams: (newParams) => {
      const currentParams = get().params
      set({
        params: { ...currentParams, ...newParams },
      })
    },

    resetParamsToPreset: () => {
      const presetId = get().activePreset
      const preset = getPreset(presetId)
      set({
        params: { ...preset.params },
        pipelineCache: {},
      })
    },

    // 处理结果
    setResult: (result, cache) => {
      set({
        result,
        pipelineCache: cache,
        isProcessing: false,
        processingProgress: 100,
        error: null,
      })
    },

    clearResult: () => {
      set({
        result: null,
        pipelineCache: {},
      })
    },

    // 处理状态
    setProcessing: (isProcessing, progress = 0) => {
      set({
        isProcessing,
        processingProgress: progress,
        error: isProcessing ? null : get().error,
      })
    },

    setError: (error) => {
      set({
        error,
        isProcessing: false,
      })
    },

    // 导出配置
    setExportFormat: (format) => {
      set({ exportFormat: format })
    },

    setExportResolution: (resolution) => {
      set({ exportResolution: resolution })
    },

    // UI 状态
    setAdvancedOpen: (open) => {
      set({ advancedOpen: open })
    },

    setPreviewTab: (tab) => {
      set({ previewTab: tab })
    },

    // 重置
    reset: () => {
      set(initialState)
    },
  }))
)

// 选择器 hooks
export const useSourceImage = () => useAppStore((s) => s.sourceImage)
export const useSourceInfo = () => useAppStore((s) => s.sourceInfo)
export const useActivePreset = () => useAppStore((s) => s.activePreset)
export const useParams = () => useAppStore((s) => s.params)
export const useResult = () => useAppStore((s) => s.result)
export const useIsProcessing = () => useAppStore((s) => s.isProcessing)
export const useProcessingProgress = () => useAppStore((s) => s.processingProgress)
export const useExportFormat = () => useAppStore((s) => s.exportFormat)
export const useExportResolution = () => useAppStore((s) => s.exportResolution)
export const useAdvancedOpen = () => useAppStore((s) => s.advancedOpen)
export const usePreviewTab = () => useAppStore((s) => s.previewTab)
export const useError = () => useAppStore((s) => s.error)

// 判断是否有可导出的结果
export const useHasResult = () => useAppStore((s) => s.result !== null)
