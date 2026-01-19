/**
 * Hero 区域
 * 页面顶部的主要入口区域
 */

import { useCallback } from 'react'
import { useAppStore } from '@/store'
import { urlToImageData } from '@/core/steps/resize512'

// 示例图片 URL（实际项目中应该放在 assets 目录）
const SAMPLE_IMAGE_URL = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <circle cx="50" cy="50" r="45" fill="#333"/>
  <circle cx="35" cy="40" r="8" fill="white"/>
  <circle cx="65" cy="40" r="8" fill="white"/>
  <path d="M 30 65 Q 50 80 70 65" stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>
`)

export function Hero() {
  const { setSourceImage, setError, setProcessing, sourceImage } = useAppStore()

  const handleTrySample = useCallback(async () => {
    setProcessing(true)

    try {
      const imageData = await urlToImageData(SAMPLE_IMAGE_URL)
      setSourceImage(imageData, {
        width: imageData.width,
        height: imageData.height,
        type: 'image/svg+xml',
        name: 'sample-logo.svg',
        size: 0,
      })
    } catch (err) {
      setError('Failed to load sample image')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }, [setSourceImage, setError, setProcessing])

  const scrollToApp = useCallback(() => {
    const appElement = document.getElementById('embedded-app')
    if (appElement) {
      appElement.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* 主标题 */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Free Logo Silhouette Generator
        </h1>

        {/* 副标题 */}
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Turn any logo image into a clean <strong className="text-gray-900">black silhouette SVG</strong>.
          Export <strong className="text-gray-900">SVG</strong>, <strong className="text-gray-900">transparent PNG</strong>, or <strong className="text-gray-900">white-background JPG</strong>.
        </p>

        {/* 核心卖点 */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Default preset: Minimal Logo
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            100% browser-based
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Export: 512 / 1024 / 2048
          </span>
        </div>

        {/* CTA 按钮 */}
        {!sourceImage && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToApp}
              className="px-8 py-4 bg-gray-900 text-white text-lg font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Upload Image
            </button>
            <button
              onClick={handleTrySample}
              className="px-8 py-4 bg-white text-gray-700 text-lg font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Try a sample logo
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
