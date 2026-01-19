/**
 * 主体裁剪
 * 基于最大连通域识别主体，自动裁剪
 */

import { findLargestComponentBBox } from '../utils/connectedComponents'
import { cropImageData, findBlackPixelsBBox } from '../utils/geometry'
import type { BoundingBox } from '../pipeline/types'

export interface CropResult {
  cropped: ImageData
  bbox: BoundingBox | null
  usedFallback: boolean
}

/**
 * 裁剪图像到主体区域
 * @param bwImage 二值图像
 * @param sourceImage 原始缩放后的图像（用于保持对应裁剪）
 * @param autoCrop 是否启用自动裁剪
 * @param paddingPct 裁剪留边百分比
 * @param minMainAreaPct 主体最小面积百分比
 */
export function cropToMain(
  bwImage: ImageData,
  autoCrop: boolean,
  paddingPct: number,
  minMainAreaPct: number
): CropResult {
  // 如果不启用自动裁剪，直接返回
  if (!autoCrop) {
    return {
      cropped: bwImage,
      bbox: null,
      usedFallback: false,
    }
  }

  // 尝试找到最大连通域
  let bbox = findLargestComponentBBox(bwImage, minMainAreaPct)
  let usedFallback = false

  // 如果没找到符合条件的连通域，使用兜底方案：找所有黑色像素的边界
  if (!bbox) {
    bbox = findBlackPixelsBBox(bwImage)
    usedFallback = true
  }

  // 如果还是没有，说明图像全白，返回原图
  if (!bbox) {
    return {
      cropped: bwImage,
      bbox: null,
      usedFallback: true,
    }
  }

  // 执行裁剪
  const cropped = cropImageData(bwImage, bbox, paddingPct)

  return {
    cropped,
    bbox,
    usedFallback,
  }
}

/**
 * 同步裁剪两个图像（bw 和 source 使用相同的裁剪参数）
 */
export function cropBoth(
  bwImage: ImageData,
  sourceImage: ImageData,
  autoCrop: boolean,
  paddingPct: number,
  minMainAreaPct: number
): { croppedBw: ImageData; croppedSource: ImageData; usedFallback: boolean } {
  if (!autoCrop) {
    return {
      croppedBw: bwImage,
      croppedSource: sourceImage,
      usedFallback: false,
    }
  }

  // 在黑白图像上找边界框
  let bbox = findLargestComponentBBox(bwImage, minMainAreaPct)
  let usedFallback = false

  if (!bbox) {
    bbox = findBlackPixelsBBox(bwImage)
    usedFallback = true
  }

  if (!bbox) {
    return {
      croppedBw: bwImage,
      croppedSource: sourceImage,
      usedFallback: true,
    }
  }

  // 使用相同的边界框裁剪两个图像
  const croppedBw = cropImageData(bwImage, bbox, paddingPct)
  const croppedSource = cropImageData(sourceImage, bbox, paddingPct)

  return {
    croppedBw,
    croppedSource,
    usedFallback,
  }
}
