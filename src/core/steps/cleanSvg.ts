/**
 * SVG 清理
 * 删除白色路径，优化输出
 * 注意：使用正则表达式实现，因为 Web Worker 中没有 DOMParser
 */

/**
 * 清理 SVG：移除白色填充的路径
 * @param svg SVG 字符串
 * @returns 清理后的 SVG 字符串
 */
export function cleanSvg(svg: string): string {
  // 移除白色填充的路径
  // 匹配 fill="#ffffff", fill="#fff", fill="white", fill="rgb(255,255,255)" 等
  const whitePathPattern = /<path[^>]*fill\s*=\s*["'](#ffffff|#fff|white|rgb\s*\(\s*255\s*,\s*255\s*,\s*255\s*\))["'][^>]*\/?\s*>/gi

  let cleaned = svg.replace(whitePathPattern, '')

  // 也处理 fill 在其他位置的情况
  const pathWithWhiteFill = /<path[^>]*>[^<]*<\/path>/gi
  cleaned = cleaned.replace(pathWithWhiteFill, (match) => {
    if (/fill\s*=\s*["'](#ffffff|#fff|white)["']/i.test(match)) {
      return ''
    }
    return match
  })

  return cleaned
}

/**
 * 优化 SVG 路径
 * 合并相同填充色的路径
 */
export function optimizeSvgPaths(svg: string): string {
  // 提取所有黑色路径的 d 属性
  const blackPathPattern = /<path[^>]*fill\s*=\s*["'](#000000|#000|black)["'][^>]*d\s*=\s*["']([^"']+)["'][^>]*\/?>/gi
  const blackPathPattern2 = /<path[^>]*d\s*=\s*["']([^"']+)["'][^>]*fill\s*=\s*["'](#000000|#000|black)["'][^>]*\/?>/gi

  const dValues: string[] = []

  // 提取 d 属性值
  let match
  while ((match = blackPathPattern.exec(svg)) !== null) {
    dValues.push(match[2])
  }
  while ((match = blackPathPattern2.exec(svg)) !== null) {
    dValues.push(match[1])
  }

  if (dValues.length === 0) {
    return svg
  }

  // 移除所有黑色路径
  let result = svg.replace(/<path[^>]*fill\s*=\s*["'](#000000|#000|black)["'][^>]*\/?>/gi, '')
  result = result.replace(/<path[^>]*fill\s*=\s*["'](#000000|#000|black)["'][^>]*>[^<]*<\/path>/gi, '')

  // 在 </svg> 前插入合并后的路径
  const mergedD = dValues.join(' ')
  const mergedPath = `<path d="${mergedD}" fill="#000000" fill-rule="evenodd"/>`

  result = result.replace('</svg>', `${mergedPath}\n</svg>`)

  return result
}

/**
 * 提取 SVG 的 viewBox 信息
 */
export function getSvgViewBox(svg: string): { width: number; height: number } | null {
  // 匹配 viewBox 属性
  const viewBoxMatch = svg.match(/viewBox\s*=\s*["']([^"']+)["']/)
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/\s+/)
    if (parts.length >= 4) {
      return {
        width: parseFloat(parts[2]),
        height: parseFloat(parts[3]),
      }
    }
  }

  // 匹配 width 和 height 属性
  const widthMatch = svg.match(/\bwidth\s*=\s*["'](\d+(?:\.\d+)?)["']/)
  const heightMatch = svg.match(/\bheight\s*=\s*["'](\d+(?:\.\d+)?)["']/)

  if (widthMatch && heightMatch) {
    return {
      width: parseFloat(widthMatch[1]),
      height: parseFloat(heightMatch[1]),
    }
  }

  return null
}

/**
 * 设置 SVG 的尺寸
 */
export function setSvgSize(svg: string, width: number, height: number): string {
  let result = svg

  // 替换或添加 width 属性
  if (/\bwidth\s*=\s*["'][^"']*["']/.test(result)) {
    result = result.replace(/\bwidth\s*=\s*["'][^"']*["']/, `width="${width}"`)
  } else {
    result = result.replace('<svg', `<svg width="${width}"`)
  }

  // 替换或添加 height 属性
  if (/\bheight\s*=\s*["'][^"']*["']/.test(result)) {
    result = result.replace(/\bheight\s*=\s*["'][^"']*["']/, `height="${height}"`)
  } else {
    result = result.replace('<svg', `<svg height="${height}"`)
  }

  return result
}
