/**
 * 图片裁剪组件
 * 移动端友好的全屏裁剪弹窗
 */

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
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
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)

  const handleCropComplete = useCallback(
    (_croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleConfirm = useCallback(() => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels)
    }
  }, [croppedAreaPixels, onCropComplete])

  // 切换比例时重置 crop 位置
  const handleAspectChange = useCallback((newAspect: number | undefined) => {
    setAspect(newAspect)
    setCrop({ x: 0, y: 0 })
  }, [])

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
        <div className="w-10" /> {/* 占位保持标题居中 */}
      </div>

      {/* 裁剪区域 */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          minZoom={0.5}
          maxZoom={3}
          showGrid={true}
          style={{
            containerStyle: {
              background: '#000',
            },
            cropAreaStyle: {
              border: '2px solid #fff',
            },
          }}
        />

        {/* 尺寸信息 */}
        {croppedAreaPixels && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
            {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)} px
            <span className="text-white/60 ml-2">
              ({getSimplifiedRatio(croppedAreaPixels.width, croppedAreaPixels.height)})
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

        {/* 缩放滑块 */}
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:shadow-lg"
          />
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
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
