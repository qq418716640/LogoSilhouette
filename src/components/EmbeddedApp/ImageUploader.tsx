/**
 * 图像上传组件
 * 支持拖拽和点击上传
 */

import { useCallback, useRef, useState } from 'react'
import { useAppStore } from '@/store'
import { fileToImageData } from '@/core/steps/resize512'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface ImageUploaderProps {
  onUploadStart?: () => void
  onUploadComplete?: () => void
}

export function ImageUploader({ onUploadStart, onUploadComplete }: ImageUploaderProps) {
  const { setSourceImage, setError, sourceImage } = useAppStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

    setIsLoading(true)
    onUploadStart?.()

    try {
      const imageData = await fileToImageData(file)

      setSourceImage(imageData, {
        width: imageData.width,
        height: imageData.height,
        type: file.type,
        name: file.name,
        size: file.size,
      })

      onUploadComplete?.()
    } catch (err) {
      setError('Failed to load image. Please try another file.')
      console.error('Image load error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [setSourceImage, setError, onUploadStart, onUploadComplete])

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
    inputRef.current?.click()
  }, [])

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
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-8
        flex flex-col items-center justify-center
        cursor-pointer transition-all duration-200
        min-h-[200px]
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
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading image...</p>
        </>
      ) : (
        <>
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
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
          <p className="text-gray-700 font-medium mb-1">
            Drop your logo here or click to upload
          </p>
          <p className="text-gray-500 text-sm">
            PNG, JPG, or WebP (max 10MB)
          </p>
        </>
      )}
    </div>
  )
}
