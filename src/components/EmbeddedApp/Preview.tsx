/**
 * 预览组件
 * 显示处理结果
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
 * 从 SVG 字符串中提取路径和锚点统计
 */
function extractSvgStats(svgContent: string): { paths: number; anchors: number } {
  // 计算路径数量
  const pathMatches = svgContent.match(/<path\s/g)
  const paths = pathMatches ? pathMatches.length : 0

  // 计算锚点数量（M, L, C, Q, A, Z 命令）
  const dMatches = svgContent.match(/\sd="([^"]+)"/g) || []
  let anchors = 0
  for (const match of dMatches) {
    // M: 1 点, L: 1 点, C: 3 点（但只算终点）, Q: 2 点, A: 1 点, Z: 0 点
    const d = match.slice(4, -1) // 提取 d 属性内容
    const mCount = (d.match(/M\s/gi) || []).length
    const lCount = (d.match(/L\s/gi) || []).length
    const cCount = (d.match(/C\s/gi) || []).length
    const qCount = (d.match(/Q\s/gi) || []).length
    const aCount = (d.match(/A\s/gi) || []).length
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
  } = useAppStore()

  const [lightboxOpen, setLightboxOpen] = useState(false)

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

  // 计算 SVG 统计信息
  const svgStats = useMemo(() => {
    if (!result?.svgClean) return null
    return extractSvgStats(result.svgClean)
  }, [result?.svgClean])

  // 点击预览打开大图
  const handlePreviewClick = useCallback(() => {
    if (result?.svgClean || originalDataUrl || bwDataUrl) {
      setLightboxOpen(true)
    }
  }, [result?.svgClean, originalDataUrl, bwDataUrl])

  // 获取当前预览的内容
  const getCurrentContent = useCallback(() => {
    switch (previewTab) {
      case 'original':
        return originalDataUrl ? { type: 'image' as const, src: originalDataUrl } : null
      case 'bw':
        return bwDataUrl ? { type: 'image' as const, src: bwDataUrl } : null
      case 'result':
        return result?.svgClean ? { type: 'svg' as const, content: result.svgClean } : null
      default:
        return null
    }
  }, [previewTab, originalDataUrl, bwDataUrl, result?.svgClean])

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
        return result?.svgClean ? (
          <div
            className="max-w-full max-h-full cursor-zoom-in flex items-center justify-center"
            style={{ maxHeight: '280px' }}
            dangerouslySetInnerHTML={{ __html: result.svgClean.replace(
              /<svg\s/,
              '<svg style="max-width:100%;max-height:280px;width:auto;height:auto;" '
            ) }}
          />
        ) : (
          <div className="text-gray-400">Process the image first</div>
        )

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
        {/* 棋盘格背景（用于显示透明区域） */}
        <div
          className="absolute inset-0"
          style={{
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
            Click to enlarge
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
          onClick={() => setLightboxOpen(false)}
        >
          {/* 关闭按钮 */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 大图内容 */}
          <div
            className="max-w-[90vw] max-h-[90vh] bg-white rounded-lg p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
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
            {(() => {
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
              return (
                <div
                  dangerouslySetInnerHTML={{ __html: content.content.replace(
                    /<svg\s/,
                    '<svg style="max-width:80vw;max-height:80vh;width:auto;height:auto;" '
                  ) }}
                />
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
