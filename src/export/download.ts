/**
 * 文件下载工具
 */

/**
 * 下载 Blob 为文件
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 生成文件名
 */
export function generateFilename(
  baseName: string,
  format: 'svg' | 'png' | 'jpg',
  resolution?: number
): string {
  const timestamp = Date.now()
  const suffix = resolution ? `-${resolution}` : ''
  return `${baseName}${suffix}-${timestamp}.${format}`
}
