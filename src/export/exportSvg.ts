/**
 * SVG 导出
 */

/**
 * 导出 SVG 为 Blob
 */
export function exportSvgBlob(svgContent: string): Blob {
  // 添加 XML 声明
  const svgWithDeclaration = svgContent.startsWith('<?xml')
    ? svgContent
    : `<?xml version="1.0" encoding="UTF-8"?>\n${svgContent}`

  return new Blob([svgWithDeclaration], { type: 'image/svg+xml;charset=utf-8' })
}

/**
 * 获取 SVG 的自然尺寸
 */
export function getSvgNaturalSize(svgContent: string): { width: number; height: number } | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')
  const svgElement = doc.querySelector('svg')

  if (!svgElement) {
    return null
  }

  // 优先从 viewBox 获取
  const viewBox = svgElement.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.split(/\s+/)
    if (parts.length >= 4) {
      return {
        width: parseFloat(parts[2]),
        height: parseFloat(parts[3]),
      }
    }
  }

  // 其次从 width/height 属性获取
  const width = svgElement.getAttribute('width')
  const height = svgElement.getAttribute('height')

  if (width && height) {
    return {
      width: parseFloat(width),
      height: parseFloat(height),
    }
  }

  return null
}
