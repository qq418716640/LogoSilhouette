/**
 * 几何计算工具
 */

import type { BoundingBox } from '../pipeline/types'

/**
 * 裁剪图像到指定区域
 */
export function cropImageData(
  imageData: ImageData,
  bbox: BoundingBox,
  paddingPct: number
): ImageData {
  const { width, height, data } = imageData

  // 计算 padding（基于边界框尺寸）
  const paddingX = Math.round((bbox.width * paddingPct) / 100)
  const paddingY = Math.round((bbox.height * paddingPct) / 100)

  // 计算裁剪区域（加上 padding）
  const cropX = Math.max(0, bbox.x - paddingX)
  const cropY = Math.max(0, bbox.y - paddingY)
  const cropRight = Math.min(width, bbox.x + bbox.width + paddingX)
  const cropBottom = Math.min(height, bbox.y + bbox.height + paddingY)
  const cropWidth = cropRight - cropX
  const cropHeight = cropBottom - cropY

  // 创建新的 ImageData
  const output = new ImageData(cropWidth, cropHeight)
  const outputData = output.data

  for (let y = 0; y < cropHeight; y++) {
    for (let x = 0; x < cropWidth; x++) {
      const sourceX = cropX + x
      const sourceY = cropY + y
      const sourceIdx = (sourceY * width + sourceX) * 4
      const targetIdx = (y * cropWidth + x) * 4

      outputData[targetIdx] = data[sourceIdx]
      outputData[targetIdx + 1] = data[sourceIdx + 1]
      outputData[targetIdx + 2] = data[sourceIdx + 2]
      outputData[targetIdx + 3] = data[sourceIdx + 3]
    }
  }

  return output
}

/**
 * 查找图像中黑色像素的边界框
 */
export function findBlackPixelsBBox(imageData: ImageData): BoundingBox | null {
  const { width, height, data } = imageData

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      if (data[idx] === 0) {
        // 黑色像素
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (maxX < 0) {
    return null
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

/**
 * 扩展边界框
 */
export function expandBBox(
  bbox: BoundingBox,
  paddingPct: number,
  maxWidth: number,
  maxHeight: number
): BoundingBox {
  const paddingX = Math.round((bbox.width * paddingPct) / 100)
  const paddingY = Math.round((bbox.height * paddingPct) / 100)

  const x = Math.max(0, bbox.x - paddingX)
  const y = Math.max(0, bbox.y - paddingY)
  const right = Math.min(maxWidth, bbox.x + bbox.width + paddingX)
  const bottom = Math.min(maxHeight, bbox.y + bbox.height + paddingY)

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  }
}
