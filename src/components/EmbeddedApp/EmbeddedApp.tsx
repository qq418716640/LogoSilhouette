/**
 * 嵌入式应用主组件
 * 整合上传、预设、高级设置、预览、导出
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { useAppStore } from '@/store'
import { useProcessor } from '@/workers/useProcessor'
import { getChangedParams, getEarliestStartStep } from '@/core/pipeline/dependencies'
import { getFastPreviewParams } from '@/core/utils/performanceGuard'
import { ImageUploader } from './ImageUploader'
import { PresetSelector } from './PresetSelector'
import { AdvancedSettings } from './AdvancedSettings'
import { Preview } from './Preview'
import { ExportPanel } from './ExportPanel'

/**
 * Invert colors 开关组件
 * 从高级设置中提取出来，更容易被用户发现
 */
function InvertToggle() {
  const { params, setParams } = useAppStore()

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <label className="text-sm font-medium text-gray-700">Invert colors</label>
      </div>
      <button
        onClick={() => setParams({ invert: !params.invert })}
        className={`
          relative w-11 h-6 rounded-full transition-colors
          ${params.invert ? 'bg-gray-900' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
            transition-transform ${params.invert ? 'translate-x-5' : ''}
          `}
        />
      </button>
    </div>
  )
}

export function EmbeddedApp() {
  const {
    sourceImage,
    sourceInfo,
    params,
    pipelineCache,
    setResult,
    setProcessing,
    setError,
    clearSourceImage,
  } = useAppStore()

  const { process } = useProcessor()
  const prevParamsRef = useRef(params)
  const isFirstProcess = useRef(true)
  const [_isInteracting, setIsInteracting] = useState(false)
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finalProcessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 处理图像
  const processImage = useCallback(async (startStep?: string, useFastPreview = false, showLoading = true) => {
    if (!sourceImage) return

    // 只在需要时显示 loading（首次处理或最终处理）
    if (showLoading) {
      setProcessing(true)
    }

    try {
      // 快速预览模式：使用优化后的参数
      const effectiveParams = useFastPreview
        ? {
            ...params,
            ...getFastPreviewParams(params),
          }
        : params

      const result = await process({
        imageData: sourceImage,
        params: effectiveParams,
        startStep: (startStep as any) || 'resize',
        cache: isFirstProcess.current ? undefined : pipelineCache,
      })

      isFirstProcess.current = false
      setResult(result.result, result.cache)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed')
      console.error('Processing error:', err)
    }
  }, [sourceImage, params, pipelineCache, process, setResult, setProcessing, setError])

  // 图像上传后自动处理
  useEffect(() => {
    if (sourceImage) {
      isFirstProcess.current = true
      processImage('resize', false)
    }
  }, [sourceImage]) // 只在 sourceImage 变化时触发

  // 参数变化时重新处理（增量 + 快速预览）
  useEffect(() => {
    if (!sourceImage) return

    const changedParams = getChangedParams(prevParamsRef.current, params)
    prevParamsRef.current = params

    if (changedParams.length > 0 && !isFirstProcess.current) {
      const startStep = getEarliestStartStep(changedParams)

      // 标记为正在交互
      setIsInteracting(true)

      // 清除之前的定时器
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current)
      }
      if (finalProcessTimerRef.current) {
        clearTimeout(finalProcessTimerRef.current)
      }

      // 快速预览（使用优化参数，不显示 loading）
      interactionTimerRef.current = setTimeout(() => {
        processImage(startStep, true, false)
      }, 100)

      // 延迟执行最终处理（用户停止调整后，不显示 loading）
      finalProcessTimerRef.current = setTimeout(() => {
        setIsInteracting(false)
        processImage(startStep, false, false)
      }, 800)

      return () => {
        if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current)
        if (finalProcessTimerRef.current) clearTimeout(finalProcessTimerRef.current)
      }
    }
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* 左侧：控制面板 */}
          <div className="p-6 space-y-6 border-b md:border-b-0 md:border-r border-gray-200">
            {/* 上传区域 */}
            {!sourceImage ? (
              <ImageUploader />
            ) : (
              <div className="space-y-4">
                {/* 已上传提示 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                        {sourceInfo?.name || 'Image'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sourceInfo?.width} × {sourceInfo?.height}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearSourceImage}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 预设选择 */}
                <PresetSelector />

                {/* Invert colors - 常用选项，放在外面 */}
                <InvertToggle />

                {/* 高级设置 */}
                <AdvancedSettings />
              </div>
            )}

            {/* 导出面板 */}
            {sourceImage && (
              <div className="pt-4 border-t border-gray-200">
                <ExportPanel />
              </div>
            )}
          </div>

          {/* 右侧：预览区域 */}
          <div className="p-6">
            <Preview />
          </div>
        </div>
      </div>
    </div>
  )
}
