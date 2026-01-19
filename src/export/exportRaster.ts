/**
 * 光栅图像导出 (PNG / JPG)
 */

import { getSvgNaturalSize } from './exportSvg'

export type RasterFormat = 'png' | 'jpg'
export type ExportResolution = 512 | 1024 | 2048

/**
 * 将 SVG 渲染为指定尺寸的光栅图像
 * @param svgContent SVG 字符串
 * @param size 目标尺寸（正方形）
 * @param format 输出格式
 * @returns Blob
 */
export async function exportRasterBlob(
  svgContent: string,
  size: ExportResolution,
  format: RasterFormat
): Promise<Blob> {
  // 获取 SVG 原始尺寸
  const naturalSize = getSvgNaturalSize(svgContent)
  if (!naturalSize) {
    throw new Error('Cannot determine SVG dimensions')
  }

  // 创建画布
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Cannot create canvas context')
  }

  // JPG 需要先铺白底
  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
  }

  // 创建 Image 加载 SVG
  const img = new Image()
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load SVG'))
      img.src = url
    })

    // 计算居中绘制参数（contain 模式）
    const scale = Math.min(size / naturalSize.width, size / naturalSize.height)
    const drawWidth = naturalSize.width * scale
    const drawHeight = naturalSize.height * scale
    const offsetX = (size - drawWidth) / 2
    const offsetY = (size - drawHeight) / 2

    // 绘制到画布
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
  } finally {
    URL.revokeObjectURL(url)
  }

  // 转换为 Blob
  return new Promise<Blob>((resolve, reject) => {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    const quality = format === 'jpg' ? 0.92 : undefined

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob'))
        }
      },
      mimeType,
      quality
    )
  })
}

/**
 * 导出 PNG
 */
export async function exportPngBlob(
  svgContent: string,
  size: ExportResolution
): Promise<Blob> {
  return exportRasterBlob(svgContent, size, 'png')
}

/**
 * 导出 JPG
 */
export async function exportJpgBlob(
  svgContent: string,
  size: ExportResolution
): Promise<Blob> {
  return exportRasterBlob(svgContent, size, 'jpg')
}
