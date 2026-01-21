/**
 * 图像缩放：最长边缩放至指定尺寸（等比）
 * 内部统一工作尺寸
 */

import type { WorkingResolution } from '@/presets/types'

const DEFAULT_MAX_SIZE = 512

/**
 * 缩放图像到指定的最大尺寸
 * @param imageData 输入图像
 * @param maxSize 最长边的目标尺寸 (512/1024/2048)
 */
export function resizeToMax(imageData: ImageData, maxSize: WorkingResolution = DEFAULT_MAX_SIZE): ImageData {
  const { width, height } = imageData

  // 如果图像已经足够小，直接返回
  if (width <= maxSize && height <= maxSize) {
    return imageData
  }

  // 计算缩放比例
  const scale = maxSize / Math.max(width, height)
  const newWidth = Math.round(width * scale)
  const newHeight = Math.round(height * scale)

  // 使用 OffscreenCanvas 进行缩放
  const sourceCanvas = new OffscreenCanvas(width, height)
  const sourceCtx = sourceCanvas.getContext('2d')!
  sourceCtx.putImageData(imageData, 0, 0)

  const targetCanvas = new OffscreenCanvas(newWidth, newHeight)
  const targetCtx = targetCanvas.getContext('2d')!

  // 使用高质量缩放
  targetCtx.imageSmoothingEnabled = true
  targetCtx.imageSmoothingQuality = 'high'
  targetCtx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight)

  return targetCtx.getImageData(0, 0, newWidth, newHeight)
}

/**
 * @deprecated 使用 resizeToMax(imageData, maxSize) 代替
 */
export function resize512(imageData: ImageData): ImageData {
  return resizeToMax(imageData, 512)
}

/**
 * 从 ImageBitmap 获取 ImageData
 */
export function imageBitmapToImageData(bitmap: ImageBitmap): ImageData {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height)
}

/**
 * 从文件创建 ImageData
 */
export async function fileToImageData(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file)
  const imageData = imageBitmapToImageData(bitmap)
  bitmap.close()
  return imageData
}

/**
 * 从 URL 加载图像并转为 ImageData
 */
export async function urlToImageData(url: string): Promise<ImageData> {
  const response = await fetch(url)
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob)
  const imageData = imageBitmapToImageData(bitmap)
  bitmap.close()
  return imageData
}
