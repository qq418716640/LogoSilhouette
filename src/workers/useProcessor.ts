/**
 * 图像处理 Worker Hook
 * 封装 Worker 通信，提供简洁的 API
 */

import { useCallback, useRef, useEffect } from 'react'
import type { ProcessParams } from '@/presets/types'
import type { PipelineStep, PipelineCache } from '@/core/pipeline/types'
import type { WorkerRequest, WorkerResponse, WorkerResultPayload, WorkerErrorPayload } from './types'

interface ProcessOptions {
  imageData: ImageData
  params: ProcessParams
  startStep?: PipelineStep
  cache?: Partial<PipelineCache>
}

interface UseProcessorReturn {
  process: (options: ProcessOptions) => Promise<WorkerResultPayload>
  isSupported: boolean
}

let requestId = 0

function generateId(): string {
  return `req_${++requestId}_${Date.now()}`
}

export function useProcessor(): UseProcessorReturn {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<string, {
    resolve: (value: WorkerResultPayload) => void
    reject: (error: Error) => void
  }>>(new Map())

  const isSupported = typeof Worker !== 'undefined'

  // 初始化 Worker
  useEffect(() => {
    if (!isSupported) return

    const worker = new Worker(
      new URL('./processor.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, id, payload } = event.data
      const pending = pendingRef.current.get(id)

      if (!pending) return

      if (type === 'result') {
        pending.resolve(payload as WorkerResultPayload)
      } else if (type === 'error') {
        pending.reject(new Error((payload as WorkerErrorPayload).error))
      }

      pendingRef.current.delete(id)
    }

    worker.onerror = (error) => {
      console.error('Worker error:', error)
      // 拒绝所有待处理的请求
      pendingRef.current.forEach(({ reject }) => {
        reject(new Error('Worker error'))
      })
      pendingRef.current.clear()
    }

    workerRef.current = worker

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [isSupported])

  const process = useCallback(async (options: ProcessOptions): Promise<WorkerResultPayload> => {
    const { imageData, params, startStep = 'resize', cache } = options

    // 如果 Worker 不支持，在主线程执行
    if (!isSupported || !workerRef.current) {
      const { runPipeline } = await import('@/core/pipeline/runPipeline')
      const startTime = performance.now()
      const { result, cache: newCache } = runPipeline(imageData, params, startStep, cache)
      const duration = performance.now() - startTime
      return { result, cache: newCache, duration }
    }

    // 通过 Worker 执行
    return new Promise((resolve, reject) => {
      const id = generateId()

      pendingRef.current.set(id, { resolve, reject })

      const request: WorkerRequest = {
        type: 'process',
        id,
        payload: {
          imageData,
          params,
          startStep,
          cache,
        },
      }

      workerRef.current!.postMessage(request)
    })
  }, [isSupported])

  return {
    process,
    isSupported,
  }
}

/**
 * 非 Hook 版本，用于非 React 上下文
 */
export class ProcessorWorker {
  private worker: Worker | null = null
  private pending = new Map<string, {
    resolve: (value: WorkerResultPayload) => void
    reject: (error: Error) => void
  }>()

  readonly isSupported = typeof Worker !== 'undefined'

  constructor() {
    if (this.isSupported) {
      this.worker = new Worker(
        new URL('./processor.worker.ts', import.meta.url),
        { type: 'module' }
      )

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { type, id, payload } = event.data
        const pending = this.pending.get(id)

        if (!pending) return

        if (type === 'result') {
          pending.resolve(payload as WorkerResultPayload)
        } else if (type === 'error') {
          pending.reject(new Error((payload as WorkerErrorPayload).error))
        }

        this.pending.delete(id)
      }
    }
  }

  async process(options: ProcessOptions): Promise<WorkerResultPayload> {
    const { imageData, params, startStep = 'resize', cache } = options

    if (!this.isSupported || !this.worker) {
      const { runPipeline } = await import('@/core/pipeline/runPipeline')
      const startTime = performance.now()
      const { result, cache: newCache } = runPipeline(imageData, params, startStep, cache)
      const duration = performance.now() - startTime
      return { result, cache: newCache, duration }
    }

    return new Promise((resolve, reject) => {
      const id = generateId()

      this.pending.set(id, { resolve, reject })

      const request: WorkerRequest = {
        type: 'process',
        id,
        payload: {
          imageData,
          params,
          startStep,
          cache,
        },
      }

      this.worker!.postMessage(request)
    })
  }

  terminate(): void {
    this.worker?.terminate()
    this.worker = null
    this.pending.clear()
  }
}
