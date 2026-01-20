/**
 * Pipeline 调度器
 * 协调各处理步骤的执行
 */

import type { ProcessParams } from '@/presets/types'
import type { PipelineStep, PipelineResult, PipelineCache } from './types'
import { shouldRunStep } from './dependencies'
import { resize512 } from '../steps/resize512'
import { thresholdBW } from '../steps/thresholdBW'
import { denoiseLite } from '../steps/denoiseLite'
import { cropToMain } from '../steps/cropMain'
import { traceSvg } from '../steps/traceSvg'
import { cleanSvg, optimizeSvgPaths } from '../steps/cleanSvg'
import { createAbortableContext, LIMITS, ProcessingError } from '../utils/performanceGuard'

/**
 * 运行图像处理管线
 * @param input 输入图像数据
 * @param params 处理参数
 * @param startStep 起始步骤（用于增量重算）
 * @param cache 缓存的中间结果
 * @param timeoutMs 可选的超时时间（毫秒）
 * @returns 处理结果和更新后的缓存
 * @throws ProcessingError 当处理超时或轮廓数量超限时
 */
export function runPipeline(
  input: ImageData,
  params: ProcessParams,
  startStep: PipelineStep = 'resize',
  cache?: Partial<PipelineCache>,
  timeoutMs?: number
): { result: PipelineResult; cache: PipelineCache } {
  // 创建可中止的上下文
  const abortContext = createAbortableContext(timeoutMs || LIMITS.PROCESSING_TIMEOUT)
  const abortCheck = () => abortContext.shouldAbort()

  // 初始化缓存
  const currentCache: PipelineCache = {
    resized: cache?.resized || null,
    bwImage: cache?.bwImage || null,
    denoised: cache?.denoised || null,
    cropped: cache?.cropped || null,
    svgRaw: cache?.svgRaw || null,
    svgClean: cache?.svgClean || null,
  }

  try {
    // 检查超时
    if (abortCheck()) {
      throw new ProcessingError('Processing timeout', 'TIMEOUT')
    }

    // Step 1: Resize
    let resized: ImageData
    if (shouldRunStep('resize', startStep) || !currentCache.resized) {
      resized = resize512(input)
      currentCache.resized = resized
    } else {
      resized = currentCache.resized
    }

    // Step 2: Threshold to B/W
    let bwImage: ImageData
    if (shouldRunStep('bw', startStep) || !currentCache.bwImage) {
      if (abortCheck()) throw new ProcessingError('Processing timeout', 'TIMEOUT')
      bwImage = thresholdBW(resized, params.threshold, params.invert)
      currentCache.bwImage = bwImage
    } else {
      bwImage = currentCache.bwImage
    }

    // Step 3: Denoise
    let denoised: ImageData
    if (shouldRunStep('denoise', startStep) || !currentCache.denoised) {
      if (abortCheck()) throw new ProcessingError('Processing timeout', 'TIMEOUT')
      denoised = denoiseLite(
        bwImage,
        params.denoiseLevel,
        params.removeSpecksMinArea,
        params.fillHolesMaxArea
      )
      currentCache.denoised = denoised
    } else {
      denoised = currentCache.denoised
    }

    // Step 4: Crop
    let cropped: ImageData
    if (shouldRunStep('crop', startStep) || !currentCache.cropped) {
      if (abortCheck()) throw new ProcessingError('Processing timeout', 'TIMEOUT')
      const cropResult = cropToMain(
        denoised,
        params.autoCrop,
        params.cropPaddingPct,
        params.minMainComponentAreaPct
      )
      cropped = cropResult.cropped
      currentCache.cropped = cropped
    } else {
      cropped = currentCache.cropped
    }

    // Step 5: Trace to SVG (最耗时的步骤，传入 abortCheck)
    let svgRaw: string
    if (shouldRunStep('trace', startStep) || !currentCache.svgRaw) {
      if (abortCheck()) throw new ProcessingError('Processing timeout', 'TIMEOUT')
      svgRaw = traceSvg(cropped, params.pathOmit, params.cornerThreshold, true, abortCheck)
      currentCache.svgRaw = svgRaw
    } else {
      svgRaw = currentCache.svgRaw
    }

    // Step 6: Clean SVG
    let svgClean: string
    if (shouldRunStep('clean', startStep) || !currentCache.svgClean) {
      if (abortCheck()) throw new ProcessingError('Processing timeout', 'TIMEOUT')
      svgClean = cleanSvg(svgRaw)
      svgClean = optimizeSvgPaths(svgClean)
      currentCache.svgClean = svgClean
    } else {
      svgClean = currentCache.svgClean
    }

    const result: PipelineResult = {
      svgClean,
      resized,
      bwImage,
      cropped,
      originalWidth: input.width,
      originalHeight: input.height,
    }

    return { result, cache: currentCache }
  } finally {
    abortContext.cleanup()
  }
}

/**
 * 计算 Pipeline 执行进度
 */
export function calculateProgress(currentStep: PipelineStep): number {
  const stepProgress: Record<PipelineStep, number> = {
    resize: 10,
    bw: 25,
    denoise: 45,
    crop: 60,
    trace: 85,
    clean: 100,
  }
  return stepProgress[currentStep]
}
