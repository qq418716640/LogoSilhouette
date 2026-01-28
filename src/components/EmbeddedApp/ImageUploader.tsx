/**
 * 图像上传组件
 * 支持拖拽和点击上传，带裁剪功能
 */

import { useCallback, useRef, useState, lazy, Suspense } from 'react'
import { useAppStore } from '@/store'
import { fileToImageData } from '@/core/steps/resize512'
import { analyzeImage, type ImageAnalysis } from '@/core/utils/performanceGuard'
import { fileToDataUrl, getCroppedImageData, type CropArea } from '@/utils/cropImage'
import { getAssetPath } from '@/utils/path'

// 懒加载裁剪组件（react-advanced-cropper 较大）
const ImageCropper = lazy(() => import('./ImageCropper').then(m => ({ default: m.ImageCropper })))

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface ImageUploaderProps {
  onUploadStart?: () => void
  onUploadComplete?: () => void
  onImageAnalysis?: (analysis: ImageAnalysis) => void
}

export function ImageUploader({ onUploadStart, onUploadComplete, onImageAnalysis }: ImageUploaderProps) {
  const { setSourceImage, setError, sourceImage } = useAppStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageWarning, setImageWarning] = useState<ImageAnalysis | null>(null)
  const [pendingFile, setPendingFile] = useState<{ imageData: ImageData; file: File } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 裁剪相关状态
  const [showCropper, setShowCropper] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)

  // 确认处理有警告的图像
  const confirmProcess = useCallback(() => {
    if (pendingFile) {
      setSourceImage(pendingFile.imageData, {
        width: pendingFile.imageData.width,
        height: pendingFile.imageData.height,
        type: pendingFile.file.type,
        name: pendingFile.file.name,
        size: pendingFile.file.size,
      })
      onUploadComplete?.()
      setImageWarning(null)
      setPendingFile(null)
    }
  }, [pendingFile, setSourceImage, onUploadComplete])

  // 取消处理
  const cancelProcess = useCallback(() => {
    setImageWarning(null)
    setPendingFile(null)
  }, [])

  // 处理裁剪后的图像
  const processImageData = useCallback(async (imageData: ImageData, file: File) => {
    // 分析图像特征
    const analysis = analyzeImage(imageData)
    onImageAnalysis?.(analysis)

    // 如果有警告，显示确认对话框
    if (analysis.warnings.length > 0) {
      setPendingFile({ imageData, file })
      setImageWarning(analysis)
      return
    }

    // 没有警告，直接处理
    setSourceImage(imageData, {
      width: imageData.width,
      height: imageData.height,
      type: file.type,
      name: file.name,
      size: file.size,
    })

    onUploadComplete?.()
  }, [setSourceImage, onImageAnalysis, onUploadComplete])

  // 裁剪完成回调
  const handleCropComplete = useCallback(async (croppedAreaPixels: CropArea) => {
    if (!cropImageSrc || !originalFile) return

    setShowCropper(false)
    setIsLoading(true)

    try {
      const croppedImageData = await getCroppedImageData(cropImageSrc, croppedAreaPixels)
      await processImageData(croppedImageData, originalFile)
    } catch (err) {
      setError('Failed to crop image. Please try again.')
      console.error('Crop error:', err)
    } finally {
      setIsLoading(false)
      setCropImageSrc(null)
      setOriginalFile(null)
    }
  }, [cropImageSrc, originalFile, processImageData, setError])

  // 跳过裁剪，使用原图
  const handleSkipCrop = useCallback(async () => {
    if (!originalFile) return

    setShowCropper(false)
    setIsLoading(true)

    try {
      const imageData = await fileToImageData(originalFile)
      await processImageData(imageData, originalFile)
    } catch (err) {
      setError('Failed to load image. Please try another file.')
      console.error('Image load error:', err)
    } finally {
      setIsLoading(false)
      setCropImageSrc(null)
      setOriginalFile(null)
    }
  }, [originalFile, processImageData, setError])

  // 取消裁剪
  const handleCancelCrop = useCallback(() => {
    setShowCropper(false)
    setCropImageSrc(null)
    setOriginalFile(null)
  }, [])

  const handleFile = useCallback(async (file: File) => {
    // 验证文件类型
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPG, or WebP image.')
      return
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB.')
      return
    }

    onUploadStart?.()

    try {
      // 转换为 Data URL 用于裁剪预览
      const dataUrl = await fileToDataUrl(file)
      setCropImageSrc(dataUrl)
      setOriginalFile(file)
      setShowCropper(true)
    } catch (err) {
      setError('Failed to load image. Please try another file.')
      console.error('Image load error:', err)
    }
  }, [setError, onUploadStart])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    // 裁剪弹窗显示时不触发上传
    if (showCropper) return
    inputRef.current?.click()
  }, [showCropper])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    // 重置 input 以允许重复选择同一文件
    e.target.value = ''
  }, [handleFile])

  // 如果已有图片，显示已上传状态
  if (sourceImage) {
    return null
  }

  return (
    <div>
      {/* 上传区域 */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 md:p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-200
          min-h-[160px] md:min-h-[200px]
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isLoading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleInputChange}
        />

        {isLoading ? (
          <>
            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 md:mb-4" />
            <p className="text-sm md:text-base text-gray-600">Loading image...</p>
          </>
        ) : (
          <>
            <svg
              className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-3 md:mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm md:text-base text-gray-700 font-medium mb-1">
              Drop your logo here or click to upload
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              PNG, JPG, or WebP (max 10MB)
            </p>
          </>
        )}

      {/* 图像警告对话框 */}
      {imageWarning && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={cancelProcess}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 警告图标 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Image Quality Notice</h3>
            </div>

            {/* 警告内容 */}
            <div className="space-y-3 mb-6">
              {imageWarning.warnings.map((warning, i) => (
                <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  {warning}
                </p>
              ))}

              {imageWarning.suggestions.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-2">Suggestions:</p>
                  {imageWarning.suggestions.map((suggestion, i) => (
                    <p key={i} className="text-xs text-gray-500 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">→</span>
                      {suggestion}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={cancelProcess}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmProcess}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

        {/* 图片裁剪弹窗 - 懒加载 */}
        {showCropper && cropImageSrc && (
          <Suspense fallback={
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <ImageCropper
              imageSrc={cropImageSrc}
              onCropComplete={handleCropComplete}
              onSkip={handleSkipCrop}
              onCancel={handleCancelCrop}
            />
          </Suspense>
        )}
      </div>

      {/* 提示区域 */}
      <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-xl">
        <p className="text-xs md:text-sm text-gray-600 text-center mb-3 md:mb-4">
          <span className="font-medium">Tip:</span> For the best results, use a clear logo on a clean background.
        </p>
        <div className="flex items-center justify-center gap-4 md:gap-6">
          {/* 正确示例 */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={getAssetPath('/tips/good.png')}
                alt="Good example"
                loading="lazy"
                decoding="async"
                className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-1.5 md:mt-2">Good</span>
          </div>
          {/* 错误示例 */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={getAssetPath('/tips/bad.png')}
                alt="Bad example"
                loading="lazy"
                decoding="async"
                className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-1.5 md:mt-2">Bad</span>
          </div>
        </div>
      </div>
    </div>
  )
}
