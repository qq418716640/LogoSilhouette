import type { ProcessParams } from '@/presets/types'

export type PipelineStep = 'resize' | 'bw' | 'denoise' | 'crop' | 'trace' | 'clean'

export interface PipelineInput {
  imageData: ImageData
  params: ProcessParams
  startStep: PipelineStep
}

export interface PipelineResult {
  svgClean: string
  resized: ImageData
  bwImage: ImageData
  cropped: ImageData
  originalWidth: number
  originalHeight: number
}

export interface PipelineCache {
  resized: ImageData | null
  bwImage: ImageData | null
  denoised: ImageData | null
  cropped: ImageData | null
  svgRaw: string | null
  svgClean: string | null
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}
