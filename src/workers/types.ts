/**
 * Worker 通信类型定义
 */

import type { ProcessParams } from '@/presets/types'
import type { PipelineStep, PipelineResult, PipelineCache } from '@/core/pipeline/types'

export interface WorkerRequest {
  type: 'process'
  id: string
  payload: {
    imageData: ImageData
    params: ProcessParams
    startStep: PipelineStep
    cache?: Partial<PipelineCache>
  }
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'progress'
  id: string
  payload: WorkerResultPayload | WorkerErrorPayload | WorkerProgressPayload
}

export interface WorkerResultPayload {
  result: PipelineResult
  cache: PipelineCache
  duration: number
}

export interface WorkerErrorPayload {
  error: string
  step?: PipelineStep
}

export interface WorkerProgressPayload {
  step: PipelineStep
  progress: number
}
