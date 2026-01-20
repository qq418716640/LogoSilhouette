/**
 * 预览组件
 * 显示处理结果，实时反映导出设置
 */

import { useMemo, useState, useCallback } from 'react'
import { useAppStore } from '@/store'
import type { PreviewTab } from '@/store/types'

const TABS: { id: PreviewTab; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'bw', label: 'B/W' },
  { id: 'result', label: 'Result' },
]

/**
 * 将 SVG 应用填充色
 * 支持 imagetracerjs 的 rgb(0,0,0) 格式和标准 #000000 格式
 */
function applySvgFillColor(svgContent: string, fillColor: string): string {
  if (!fillColor || fillColor === '#000000') {
    return svgContent
  }
  // 替换 imagetracerjs 格式: fill="rgb(0,0,0)"
  let result = svgContent.replace(/fill="rgb\(0,\s*0,\s*0\)"/g, `fill="${fillColor}"`)
  // 替换标准格式: fill="#000000"
  result = result.replace(/fill="#000000"/g, `fill="${fillColor}"`)
  return result
}

/**
 * 将 SVG 渲染为指定分辨率的图像
 */
async function renderSvgToImage(
  svgContent: string,
  resolution: number,
  format: 'png' | 'jpg',
  fillColor: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 应用填充色
    const coloredSvg = applySvgFillColor(svgContent, fillColor)

    // 解析 SVG 尺寸
    const viewBoxMatch = coloredSvg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/)
    if (!viewBoxMatch) {
      reject(new Error('Invalid SVG: no viewBox'))
      return
    }

    const svgWidth = parseFloat(viewBoxMatch[1])
    const svgHeight = parseFloat(viewBoxMatch[2])
    const aspectRatio = svgWidth / svgHeight

    // 计算目标尺寸（保持比例，最大边为 resolution）
    let targetWidth: number
    let targetHeight: number
    if (aspectRatio >= 1) {
      targetWidth = resolution
      targetHeight = Math.round(resolution / aspectRatio)
    } else {
      targetHeight = resolution
      targetWidth = Math.round(resolution * aspectRatio)
    }

    // 创建 canvas
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')!

    // JPG 格式需要白色背景
    if (format === 'jpg') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, targetWidth, targetHeight)
    }

    // 创建 Image 对象加载 SVG
    const img = new Image()
    const blob = new Blob([coloredSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
      URL.revokeObjectURL(url)

      const dataUrl = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.92)
      resolve(dataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG'))
    }

    img.src = url
  })
}

/**
 * 从 SVG 字符串中提取路径和锚点统计
 */
function extractSvgStats(svgContent: string): { paths: number; anchors: number } {
  // 计算路径数量 - 匹配 <path 开头
  const pathMatches = svgContent.match(/<path[\s>]/g)
  const paths = pathMatches ? pathMatches.length : 0

  // 提取所有 d 属性内容（d= 前面可能有空格或在标签开头）
  const dRegex = /\bd="([^"]+)"/g
  let anchors = 0
  let match

  while ((match = dRegex.exec(svgContent)) !== null) {
    const d = match[1] // 捕获组 1 是 d 属性的内容

    // 统计 SVG 路径命令数量
    // M: moveto (1 点)
    // L: lineto (1 点)
    // C: cubic bezier (1 终点，2 控制点不算)
    // Q: quadratic bezier (1 终点，1 控制点不算)
    // A: arc (1 点)
    // Z: closepath (0 点)
    const mCount = (d.match(/M\s*-?[\d.]+/gi) || []).length
    const lCount = (d.match(/L\s*-?[\d.]+/gi) || []).length
    const cCount = (d.match(/C\s*-?[\d.]+/gi) || []).length
    const qCount = (d.match(/Q\s*-?[\d.]+/gi) || []).length
    const aCount = (d.match(/A\s*-?[\d.]+/gi) || []).length

    anchors += mCount + lCount + cCount + qCount + aCount
  }

  return { paths, anchors }
}

export function Preview() {
  const {
    sourceImage,
    result,
    isProcessing,
    previewTab,
    setPreviewTab,
    exportFormat,
    exportResolution,
    fillColor,
  } = useAppStore()

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [isGeneratingLightbox, setIsGeneratingLightbox] = useState(false)

  // 将 ImageData 转换为 Data URL
  const originalDataUrl = useMemo(() => {
    if (!sourceImage) return null
    const canvas = document.createElement('canvas')
    canvas.width = sourceImage.width
    canvas.height = sourceImage.height
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(sourceImage, 0, 0)
    return canvas.toDataURL()
  }, [sourceImage])

  const bwDataUrl = useMemo(() => {
    if (!result?.bwImage) return null
    const canvas = document.createElement('canvas')
    canvas.width = result.bwImage.width
    canvas.height = result.bwImage.height
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(result.bwImage, 0, 0)
    return canvas.toDataURL()
  }, [result?.bwImage])

  // 应用填充色的 SVG
  const coloredSvg = useMemo(() => {
    if (!result?.svgClean) return null
    return applySvgFillColor(result.svgClean, fillColor)
  }, [result?.svgClean, fillColor])

  // 计算 SVG 统计信息
  const svgStats = useMemo(() => {
    if (!result?.svgClean) return null
    return extractSvgStats(result.svgClean)
  }, [result?.svgClean])

  // 是否显示白色背景（JPG 格式）
  const showWhiteBackground = exportFormat === 'jpg' && previewTab === 'result'

  // 点击预览打开大图
  const handlePreviewClick = useCallback(async () => {
    if (previewTab === 'result' && result?.svgClean) {
      // Result 标签：根据导出格式生成预览
      if (exportFormat === 'svg') {
        // SVG 格式直接显示
        setLightboxImage(null)
        setLightboxOpen(true)
      } else {
        // PNG/JPG 格式：生成指定分辨率的图像
        setIsGeneratingLightbox(true)
        setLightboxOpen(true)
        try {
          const imageUrl = await renderSvgToImage(
            result.svgClean,
            exportResolution,
            exportFormat as 'png' | 'jpg',
            fillColor
          )
          setLightboxImage(imageUrl)
        } catch (err) {
          console.error('Failed to generate lightbox image:', err)
          setLightboxImage(null)
        } finally {
          setIsGeneratingLightbox(false)
        }
      }
    } else if (originalDataUrl || bwDataUrl) {
      // Original/B&W 标签
      setLightboxImage(null)
      setLightboxOpen(true)
    }
  }, [previewTab, result?.svgClean, originalDataUrl, bwDataUrl, exportFormat, exportResolution, fillColor])

  // 获取当前预览的内容
  const getCurrentContent = useCallback(() => {
    switch (previewTab) {
      case 'original':
        return originalDataUrl ? { type: 'image' as const, src: originalDataUrl } : null
      case 'bw':
        return bwDataUrl ? { type: 'image' as const, src: bwDataUrl } : null
      case 'result':
        return coloredSvg ? { type: 'svg' as const, content: coloredSvg } : null
      default:
        return null
    }
  }, [previewTab, originalDataUrl, bwDataUrl, coloredSvg])

  // 渲染预览内容
  const renderPreviewContent = () => {
    if (!sourceImage) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Upload an image to see preview</p>
        </div>
      )
    }

    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500">Processing...</p>
        </div>
      )
    }

    switch (previewTab) {
      case 'original':
        return originalDataUrl ? (
          <img
            src={originalDataUrl}
            alt="Original"
            className="max-w-full max-h-full object-contain cursor-zoom-in"
            style={{ maxHeight: '280px' }}
          />
        ) : null

      case 'bw':
        return bwDataUrl ? (
          <img
            src={bwDataUrl}
            alt="Black & White"
            className="max-w-full max-h-full object-contain cursor-zoom-in"
            style={{ maxHeight: '280px' }}
          />
        ) : (
          <div className="text-gray-400">Process the image first</div>
        )

      case 'result':
        if (coloredSvg) {
          // 添加显式的 width 和 height 以确保 SVG 显示
          const styledSvg = coloredSvg.replace(
            /<svg\s/,
            '<svg style="max-width:100%;max-height:280px;width:100%;height:auto;display:block;" '
          )
          return (
            <div
              className="w-full max-h-full cursor-zoom-in flex items-center justify-center"
              style={{ maxHeight: '280px', minHeight: '100px' }}
              dangerouslySetInnerHTML={{ __html: styledSvg }}
            />
          )
        }
        return <div className="text-gray-400">Process the image first</div>

      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      {/* Tab 切换 */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPreviewTab(tab.id)}
            className={`
              px-4 py-1.5 text-sm rounded-md transition-colors
              ${previewTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 预览区域 */}
      <div
        className="relative bg-gray-50 border border-gray-200 rounded-xl overflow-hidden"
        onClick={handlePreviewClick}
      >
        {/* 背景：JPG 格式显示白色，其他显示棋盘格（透明指示） */}
        <div
          className="absolute inset-0"
          style={showWhiteBackground ? {
            backgroundColor: '#FFFFFF',
          } : {
            backgroundImage: `
              linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
              linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}
        />

        {/* 内容 */}
        <div className="relative flex items-center justify-center min-h-[300px] p-6">
          {renderPreviewContent()}
        </div>

        {/* 放大提示 */}
        {(result?.svgClean || originalDataUrl || bwDataUrl) && !isProcessing && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-60 pointer-events-none">
            {previewTab === 'result' && exportFormat !== 'svg'
              ? `Click to preview ${exportFormat.toUpperCase()} ${exportResolution}px`
              : 'Click to enlarge'
            }
          </div>
        )}
      </div>

      {/* SVG 统计信息 */}
      {previewTab === 'result' && svgStats && (
        <div className="text-xs text-gray-400 text-center">
          {svgStats.paths} path{svgStats.paths !== 1 ? 's' : ''} · {svgStats.anchors} anchor{svgStats.anchors !== 1 ? 's' : ''}
        </div>
      )}

      {/* Lightbox 大图弹窗 */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => {
            setLightboxOpen(false)
            setLightboxImage(null)
          }}
        >
          {/* 关闭按钮 */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            onClick={() => {
              setLightboxOpen(false)
              setLightboxImage(null)
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 格式/分辨率标签 */}
          {previewTab === 'result' && (
            <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1.5 rounded z-10">
              {exportFormat.toUpperCase()}{exportFormat !== 'svg' ? ` · ${exportResolution}px` : ' · Vector'}
            </div>
          )}

          {/* 大图内容 */}
          <div
            className="max-w-[90vw] max-h-[90vh] bg-white rounded-lg p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            style={previewTab === 'result' && exportFormat === 'jpg' ? {
              backgroundColor: '#FFFFFF',
            } : {
              backgroundImage: `
                linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
                linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
                linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          >
            {isGeneratingLightbox ? (
              <div className="flex flex-col items-center justify-center min-w-[200px] min-h-[200px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-gray-500">Generating {exportResolution}px preview...</p>
              </div>
            ) : lightboxImage ? (
              // 显示生成的 PNG/JPG 图像
              <img
                src={lightboxImage}
                alt={`${exportFormat.toUpperCase()} Preview`}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              // 显示 SVG 或原始/B&W 图像
              (() => {
                const content = getCurrentContent()
                if (!content) return null
                if (content.type === 'image') {
                  return (
                    <img
                      src={content.src}
                      alt="Preview"
                      className="max-w-full max-h-[80vh] object-contain"
                    />
                  )
                }
                // SVG 需要显式设置尺寸
                const styledSvg = content.content.replace(
                  /<svg\s/,
                  '<svg style="max-width:80vw;max-height:80vh;width:100%;height:auto;display:block;" '
                )
                return (
                  <div
                    style={{ minWidth: '200px', minHeight: '200px' }}
                    dangerouslySetInnerHTML={{ __html: styledSvg }}
                  />
                )
              })()
            )}
          </div>
        </div>
      )}
    </div>
  )
}
