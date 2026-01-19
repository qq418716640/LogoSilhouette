/**
 * 嵌入式应用主组件
 * 整合上传、预设、高级设置、预览、导出
 */

import { useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/store'
import { useProcessor } from '@/workers/useProcessor'
import { getChangedParams, getEarliestStartStep } from '@/core/pipeline/dependencies'
import { ImageUploader } from './ImageUploader'
import { PresetSelector } from './PresetSelector'
import { AdvancedSettings } from './AdvancedSettings'
import { Preview } from './Preview'
import { ExportPanel } from './ExportPanel'

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

  // 处理图像
  const processImage = useCallback(async (startStep?: string) => {
    if (!sourceImage) return

    setProcessing(true)

    try {
      const result = await process({
        imageData: sourceImage,
        params,
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
      processImage('resize')
    }
  }, [sourceImage]) // 只在 sourceImage 变化时触发

  // 参数变化时重新处理（增量）
  useEffect(() => {
    if (!sourceImage) return

    const changedParams = getChangedParams(prevParamsRef.current, params)
    prevParamsRef.current = params

    if (changedParams.length > 0 && !isFirstProcess.current) {
      const startStep = getEarliestStartStep(changedParams)
      // 使用防抖处理参数变化
      const timer = setTimeout(() => {
        processImage(startStep)
      }, 150)
      return () => clearTimeout(timer)
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
