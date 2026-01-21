/**
 * 图片裁剪组件
 * 移动端友好的全屏裁剪弹窗
 * 使用 react-advanced-cropper 支持缩放、平移和自由调整裁剪框
 */

import { useState, useCallback, useRef } from 'react'
import { Cropper, type CropperRef } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import type { CropArea } from '@/utils/cropImage'

// 比例预设
const ASPECT_PRESETS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
] as const

/**
 * 计算最简比例
 */
function getSimplifiedRatio(width: number, height: number): string {
  if (width === 0 || height === 0) return '0:0'
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(Math.round(width), Math.round(height))
  const w = Math.round(width / divisor)
  const h = Math.round(height / divisor)

  // 如果比例数字太大，显示小数比例
  if (w > 20 || h > 20) {
    return (width / height).toFixed(2) + ':1'
  }
  return `${w}:${h}`
}

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedAreaPixels: CropArea) => void
  onSkip: () => void
  onCancel: () => void
}

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onSkip,
  onCancel,
}: ImageCropperProps) {
  const cropperRef = useRef<CropperRef>(null)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [currentCrop, setCurrentCrop] = useState<{ width: number; height: number } | null>(null)

  // 裁剪变化时更新显示尺寸
  const handleChange = useCallback((cropper: CropperRef) => {
    const coords = cropper.getCoordinates()
    if (coords) {
      setCurrentCrop({
        width: coords.width,
        height: coords.height,
      })
    }
  }, [])

  // 切换比例
  const handleAspectChange = useCallback((newAspect: number | undefined) => {
    setAspect(newAspect)
  }, [])

  // 确认裁剪
  const handleConfirm = useCallback(() => {
    if (cropperRef.current) {
      const coords = cropperRef.current.getCoordinates()
      if (coords && coords.width > 0 && coords.height > 0) {
        onCropComplete({
          x: Math.round(coords.left),
          y: Math.round(coords.top),
          width: Math.round(coords.width),
          height: Math.round(coords.height),
        })
      }
    }
  }, [onCropComplete])

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button
          onClick={onCancel}
          className="text-white/80 hover:text-white p-2 -m-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-white font-medium">Crop Image</h2>
        <div className="w-10" />
      </div>

      {/* 裁剪区域 */}
      <div className="flex-1 relative overflow-hidden">
        <Cropper
          ref={cropperRef}
          src={imageSrc}
          onChange={handleChange}
          stencilProps={{
            aspectRatio: aspect,
            grid: true,
          }}
          className="h-full"
        />

        {/* 尺寸信息 */}
        {currentCrop && currentCrop.width > 0 && currentCrop.height > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
            {Math.round(currentCrop.width)} × {Math.round(currentCrop.height)} px
            <span className="text-white/60 ml-2">
              ({getSimplifiedRatio(currentCrop.width, currentCrop.height)})
            </span>
          </div>
        )}
      </div>

      {/* 底部控制栏 */}
      <div className="px-4 py-4 bg-black/80 space-y-4">
        {/* 比例预设 */}
        <div className="flex items-center justify-center gap-2">
          {ASPECT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleAspectChange(preset.value)}
              className={`
                px-3 py-1.5 text-xs rounded-lg transition-colors
                ${aspect === preset.value
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
                }
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-3 text-white/80 hover:text-white border border-white/30 hover:border-white/50 rounded-xl transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
