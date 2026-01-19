/**
 * 图像处理 Web Worker
 * 在后台线程执行计算密集型的图像处理
 */

import { runPipeline } from '@/core/pipeline/runPipeline'
import type { WorkerRequest, WorkerResponse } from './types'

// Worker 消息处理
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { type, id, payload } = event.data

  if (type === 'process') {
    const startTime = performance.now()

    try {
      const { imageData, params, startStep, cache } = payload

      // 执行 pipeline
      const { result, cache: newCache } = runPipeline(
        imageData,
        params,
        startStep,
        cache
      )

      const duration = performance.now() - startTime

      // 返回结果
      const response: WorkerResponse = {
        type: 'result',
        id,
        payload: {
          result,
          cache: newCache,
          duration,
        },
      }

      self.postMessage(response)
    } catch (error) {
      // 返回错误
      const response: WorkerResponse = {
        type: 'error',
        id,
        payload: {
          error: error instanceof Error ? error.message : String(error),
        },
      }

      self.postMessage(response)
    }
  }
}

// 导出空对象以满足模块要求
export {}
