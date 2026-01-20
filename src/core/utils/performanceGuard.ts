/**
 * 性能保护工具
 * 防止复杂图像导致浏览器崩溃
 */

export const LIMITS = {
  /** 最大轮廓数量 */
  MAX_CONTOURS: 500,
  /** 处理超时（毫秒） */
  PROCESSING_TIMEOUT: 15000,
  /** 警告的图像尺寸阈值 */
  WARN_IMAGE_SIZE: 2000,
  /** 最大图像尺寸（像素） */
  MAX_IMAGE_DIMENSION: 4096,
  /** 用于判断复杂图像的颜色数量阈值 */
  COMPLEX_COLOR_THRESHOLD: 1000,
} as const

/**
 * 图像分析结果
 */
export interface ImageAnalysis {
  /** 是否为简单图像（适合处理） */
  isSimple: boolean
  /** 原始尺寸 */
  dimensions: { width: number; height: number }
  /** 是否过大 */
  isOversized: boolean
  /** 是否可能是照片/渐变 */
  isLikelyPhoto: boolean
  /** 警告信息 */
  warnings: string[]
  /** 建议 */
  suggestions: string[]
}

/**
 * 分析图像特征，判断是否适合处理
 */
export function analyzeImage(imageData: ImageData): ImageAnalysis {
  const { width, height, data } = imageData
  const warnings: string[] = []
  const suggestions: string[] = []

  // 检查尺寸
  const isOversized = width > LIMITS.MAX_IMAGE_DIMENSION || height > LIMITS.MAX_IMAGE_DIMENSION
  const needsSizeWarning = width > LIMITS.WARN_IMAGE_SIZE || height > LIMITS.WARN_IMAGE_SIZE

  if (isOversized) {
    warnings.push(`Image is very large (${width}×${height}). This may cause performance issues.`)
    suggestions.push('Consider resizing the image before uploading.')
  } else if (needsSizeWarning) {
    warnings.push(`Large image detected (${width}×${height}).`)
  }

  // 采样分析颜色复杂度（检测是否可能是照片/渐变）
  const sampleSize = Math.min(10000, (width * height) / 4)
  const step = Math.max(1, Math.floor((width * height) / sampleSize))
  const colorSet = new Set<string>()

  for (let i = 0; i < data.length && colorSet.size < LIMITS.COMPLEX_COLOR_THRESHOLD + 100; i += step * 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // 量化颜色以减少噪声影响（每通道 16 级）
    const quantR = Math.floor(r / 16)
    const quantG = Math.floor(g / 16)
    const quantB = Math.floor(b / 16)
    colorSet.add(`${quantR},${quantG},${quantB}`)
  }

  const isLikelyPhoto = colorSet.size > LIMITS.COMPLEX_COLOR_THRESHOLD

  if (isLikelyPhoto) {
    warnings.push('Image appears to contain gradients or photographic content.')
    suggestions.push('Logo silhouettes work best with flat colors and clear edges.')
    suggestions.push('Try increasing the "Noise Cleanup" setting.')
  }

  const isSimple = !isOversized && !isLikelyPhoto

  return {
    isSimple,
    dimensions: { width, height },
    isOversized,
    isLikelyPhoto,
    warnings,
    suggestions,
  }
}

/**
 * 轮廓数量检查结果
 */
export interface ContourCheckResult {
  /** 是否超过限制 */
  exceeds: boolean
  /** 实际数量 */
  count: number
  /** 限制数量 */
  limit: number
}

/**
 * 检查轮廓数量是否超过限制
 */
export function checkContourLimit(contourCount: number): ContourCheckResult {
  return {
    exceeds: contourCount > LIMITS.MAX_CONTOURS,
    count: contourCount,
    limit: LIMITS.MAX_CONTOURS,
  }
}

/**
 * 创建可中断的处理上下文
 */
export function createAbortableContext(timeoutMs: number = LIMITS.PROCESSING_TIMEOUT) {
  let aborted = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const startTime = performance.now()

  const context = {
    /** 检查是否应该中止 */
    shouldAbort: () => {
      if (aborted) return true
      if (performance.now() - startTime > timeoutMs) {
        aborted = true
        return true
      }
      return false
    },

    /** 手动中止 */
    abort: () => {
      aborted = true
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },

    /** 是否已中止 */
    isAborted: () => aborted,

    /** 设置超时回调 */
    onTimeout: (callback: () => void) => {
      timeoutId = setTimeout(() => {
        if (!aborted) {
          aborted = true
          callback()
        }
      }, timeoutMs)
    },

    /** 清理 */
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
  }

  return context
}

/**
 * 处理错误类型
 */
export class ProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: 'TIMEOUT' | 'CONTOUR_LIMIT' | 'ABORTED' | 'UNKNOWN',
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ProcessingError'
  }
}

/**
 * 快速预览参数调整
 * 用于实时预览时提升性能
 */
export interface FastPreviewParams {
  qtres: number
  ltres: number
  pathomit: number
  denoiseLevel: 'off' | 'low' | 'medium' | 'high'
  removeSpecksMinArea: number
  fillHolesMaxArea: number
}

/**
 * 获取快速预览参数
 * 提高简化程度以加速处理
 */
export function getFastPreviewParams(originalParams: FastPreviewParams): Partial<FastPreviewParams> {
  return {
    // 至少使用 2.5 的曲线容差（更平滑，处理更快）
    qtres: Math.max(2.5, originalParams.qtres),
    ltres: Math.max(2.0, originalParams.ltres),
    // 至少使用 12 的路径过滤
    pathomit: Math.max(12, originalParams.pathomit),
    // 至少使用 medium 降噪
    denoiseLevel: originalParams.denoiseLevel === 'off' || originalParams.denoiseLevel === 'low'
      ? 'medium'
      : originalParams.denoiseLevel,
    // 增加去噪面积阈值
    removeSpecksMinArea: Math.max(100, originalParams.removeSpecksMinArea),
    fillHolesMaxArea: Math.max(100, originalParams.fillHolesMaxArea),
  }
}
