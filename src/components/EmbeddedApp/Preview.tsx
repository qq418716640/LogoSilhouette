/**
 * 预览组件
 * 显示处理结果
 */

import { useMemo } from 'react'
import { useAppStore } from '@/store'
import type { PreviewTab } from '@/store/types'

const TABS: { id: PreviewTab; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'bw', label: 'B/W' },
  { id: 'result', label: 'Result' },
]

export function Preview() {
  const {
    sourceImage,
    result,
    isProcessing,
    previewTab,
    setPreviewTab,
  } = useAppStore()

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
            className="max-w-full max-h-full object-contain"
          />
        ) : null

      case 'bw':
        return bwDataUrl ? (
          <img
            src={bwDataUrl}
            alt="Black & White"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-gray-400">Process the image first</div>
        )

      case 'result':
        return result?.svgClean ? (
          <div
            className="max-w-full max-h-full"
            dangerouslySetInnerHTML={{ __html: result.svgClean }}
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
      <div className="relative bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
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
      </div>
    </div>
  )
}
