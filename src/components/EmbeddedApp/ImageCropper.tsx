/**
 * 图片裁剪组件
 * 移动端友好的全屏裁剪弹窗
 * 使用 react-image-crop 支持自由拖动裁剪框
 */

import { useState, useCallback, useRef } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
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
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const imgRef = useRef<HTMLImageElement>(null)

  // 图片加载后设置初始裁剪区域
  const onImageLoad = useCallback(() => {
    // 默认选中 90% 区域
    const initialCrop: Crop = {
      unit: '%',
      x: 5,
      y: 5,
      width: 90,
      height: 90,
    }
    setCrop(initialCrop)
  }, [])

  // 切换比例时重置裁剪区域
  const handleAspectChange = useCallback((newAspect: number | undefined) => {
    setAspect(newAspect)
    if (imgRef.current) {
      const { width, height } = imgRef.current
      if (newAspect) {
        // 计算居中的裁剪区域
        let cropWidth = width * 0.8
        let cropHeight = cropWidth / newAspect
        if (cropHeight > height * 0.8) {
          cropHeight = height * 0.8
          cropWidth = cropHeight * newAspect
        }
        setCrop({
          unit: 'px',
          x: (width - cropWidth) / 2,
          y: (height - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
        })
      } else {
        // Free 模式：选中 90%
        setCrop({
          unit: '%',
          x: 5,
          y: 5,
          width: 90,
          height: 90,
        })
      }
    }
  }, [])

  const handleConfirm = useCallback(() => {
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
      onCropComplete({
        x: Math.round(completedCrop.x),
        y: Math.round(completedCrop.y),
        width: Math.round(completedCrop.width),
        height: Math.round(completedCrop.height),
      })
    }
  }, [completedCrop, onCropComplete])

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
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black p-4">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          className="max-h-full"
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop"
            onLoad={onImageLoad}
            className="max-h-[calc(100vh-220px)] max-w-full object-contain"
            style={{ display: 'block' }}
          />
        </ReactCrop>

        {/* 尺寸信息 */}
        {completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
            {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} px
            <span className="text-white/60 ml-2">
              ({getSimplifiedRatio(completedCrop.width, completedCrop.height)})
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
