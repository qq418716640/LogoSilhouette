import type { PipelineStep } from './types'
import type { ProcessParams } from '@/presets/types'

/**
 * 参数到起跑步骤的映射
 * 用于增量重算：只重跑受影响的步骤
 */
const PARAM_TO_STEP: Record<keyof ProcessParams, PipelineStep> = {
  // 工作分辨率
  maxSize: 'resize',
  // 二值化参数
  threshold: 'bw',
  invert: 'bw',
  // 降噪参数
  denoiseLevel: 'denoise',
  removeSpecksMinArea: 'denoise',
  fillHolesMaxArea: 'denoise',
  // 裁剪参数
  autoCrop: 'crop',
  cropPaddingPct: 'crop',
  minMainComponentAreaPct: 'crop',
  // SVG tracing 参数 (imagetracerjs)
  qtres: 'trace',
  ltres: 'trace',
  pathomit: 'trace',
  roundcoords: 'trace',
  rightangleenhance: 'trace',
}

/**
 * 步骤顺序（数字越小越早）
 */
const STEP_ORDER: Record<PipelineStep, number> = {
  resize: 0,
  bw: 1,
  denoise: 2,
  crop: 3,
  trace: 4,
  clean: 5,
}

/**
 * 获取参数变更后需要重跑的起始步骤
 */
export function getStartStep(changedParam: keyof ProcessParams): PipelineStep {
  return PARAM_TO_STEP[changedParam] || 'resize'
}

/**
 * 根据多个参数变更，计算最早需要重跑的步骤
 */
export function getEarliestStartStep(changedParams: (keyof ProcessParams)[]): PipelineStep {
  if (changedParams.length === 0) {
    return 'resize'
  }

  let earliest: PipelineStep = 'clean'
  let earliestOrder = STEP_ORDER['clean']

  for (const param of changedParams) {
    const step = getStartStep(param)
    const order = STEP_ORDER[step]
    if (order < earliestOrder) {
      earliest = step
      earliestOrder = order
    }
  }

  return earliest
}

/**
 * 判断是否需要执行某个步骤
 */
export function shouldRunStep(currentStep: PipelineStep, startStep: PipelineStep): boolean {
  return STEP_ORDER[currentStep] >= STEP_ORDER[startStep]
}

/**
 * 比较两个参数对象，返回变更的参数列表
 */
export function getChangedParams(
  oldParams: ProcessParams,
  newParams: ProcessParams
): (keyof ProcessParams)[] {
  const changed: (keyof ProcessParams)[] = []
  const keys = Object.keys(oldParams) as (keyof ProcessParams)[]

  for (const key of keys) {
    if (oldParams[key] !== newParams[key]) {
      changed.push(key)
    }
  }

  return changed
}
