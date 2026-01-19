/**
 * 轻量降噪处理
 * 去除小黑点、填充小孔洞
 */

import type { DenoiseLevel } from '@/presets/types'
import { removeSmallComponents, fillSmallHoles } from '../utils/connectedComponents'

/**
 * 降噪级别对应的参数系数
 */
const DENOISE_MULTIPLIERS: Record<DenoiseLevel, number> = {
  off: 0,
  low: 0.5,
  medium: 1,
  high: 1.5,
}

/**
 * 执行轻量降噪
 * @param imageData 二值图像数据
 * @param level 降噪级别
 * @param baseRemoveSpecksArea 基础去噪点面积
 * @param baseFillHolesArea 基础填洞面积
 * @returns 处理后的图像数据
 */
export function denoiseLite(
  imageData: ImageData,
  level: DenoiseLevel,
  baseRemoveSpecksArea: number,
  baseFillHolesArea: number
): ImageData {
  // 如果降噪关闭，直接返回
  if (level === 'off') {
    return imageData
  }

  const multiplier = DENOISE_MULTIPLIERS[level]
  const removeSpecksArea = Math.round(baseRemoveSpecksArea * multiplier)
  const fillHolesArea = Math.round(baseFillHolesArea * multiplier)

  let result = imageData

  // 去除小黑点
  if (removeSpecksArea > 0) {
    result = removeSmallComponents(result, removeSpecksArea)
  }

  // 填充小孔洞
  if (fillHolesArea > 0) {
    result = fillSmallHoles(result, fillHolesArea)
  }

  return result
}
