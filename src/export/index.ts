/**
 * 导出功能统一入口
 */

import { exportSvgBlob } from './exportSvg'
import { exportPngBlob, exportJpgBlob, type ExportResolution } from './exportRaster'
import { downloadBlob, generateFilename } from './download'
import type { ExportFormat } from '@/store/types'

export interface ExportOptions {
  svgContent: string
  format: ExportFormat
  resolution: ExportResolution
  filename?: string
}

export interface ExportResult {
  blob: Blob
  filename: string
  size: number
  duration: number
}

/**
 * 执行导出
 */
export async function performExport(options: ExportOptions): Promise<ExportResult> {
  const { svgContent, format, resolution, filename = 'logo-silhouette' } = options
  const startTime = performance.now()

  let blob: Blob

  switch (format) {
    case 'svg':
      blob = exportSvgBlob(svgContent)
      break
    case 'png':
      blob = await exportPngBlob(svgContent, resolution)
      break
    case 'jpg':
      blob = await exportJpgBlob(svgContent, resolution)
      break
    default:
      throw new Error(`Unknown format: ${format}`)
  }

  const duration = performance.now() - startTime
  const exportFilename = generateFilename(
    filename,
    format,
    format !== 'svg' ? resolution : undefined
  )

  return {
    blob,
    filename: exportFilename,
    size: blob.size,
    duration,
  }
}

/**
 * 导出并下载
 */
export async function exportAndDownload(options: ExportOptions): Promise<ExportResult> {
  const result = await performExport(options)
  downloadBlob(result.blob, result.filename)
  return result
}

export { downloadBlob, generateFilename } from './download'
export { exportSvgBlob } from './exportSvg'
export { exportPngBlob, exportJpgBlob } from './exportRaster'
export type { ExportResolution } from './exportRaster'
