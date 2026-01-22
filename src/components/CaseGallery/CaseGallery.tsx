/**
 * 案例展示区域
 * 展示效果案例，点击可制作同款
 */

import { useCallback, useState } from 'react'
import { useAppStore } from '@/store'
import { CASES, type CaseData } from '@/data/cases'
import { urlToImageData } from '@/core/steps/resize512'
import { DEFAULT_PRESET_ID } from '@/presets/presets'

export function CaseGallery() {
  const { setSourceImage, setParams, setActivePreset, setFillColor } = useAppStore()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleMakeSame = useCallback(async (caseData: CaseData) => {
    setLoadingId(caseData.id)

    try {
      // 1. 加载源图片
      const imageData = await urlToImageData(caseData.sourceImage)

      // 2. 设置预设 - 这会重置 params 为预设默认值
      // 始终调用以确保参数重置，没有指定预设则使用默认预设
      setActivePreset(caseData.presetId || DEFAULT_PRESET_ID)

      // 3. 立即覆盖参数（在 setSourceImage 之前，确保处理时使用正确的参数）
      if (caseData.params) {
        setParams(caseData.params)
      }

      // 4. 设置填充色（如果有）
      if (caseData.fillColor) {
        setFillColor(caseData.fillColor)
      }

      // 5. 设置源图片（这会触发处理流程，此时参数已经设置好）
      setSourceImage(imageData, {
        width: imageData.width,
        height: imageData.height,
        type: 'image/png',
        name: caseData.sourceImage.split('/').pop() || 'case.png',
        size: 0,
      })

      // 滚动到工作区
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Failed to load case:', err)
    } finally {
      setLoadingId(null)
    }
  }, [setSourceImage, setParams, setActivePreset, setFillColor])

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Example Gallery
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Click any example to try it yourself
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CASES.map((caseData) => (
            <div
              key={caseData.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleMakeSame(caseData)}
            >
              {/* 效果展示图 */}
              <div className="relative bg-gray-100">
                <img
                  src={caseData.previewImage}
                  alt={caseData.title}
                  className="w-full h-auto transition-transform group-hover:scale-[1.02]"
                />

                {/* 悬浮遮罩 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                    {loadingId === caseData.id ? 'Loading...' : 'Try it'}
                  </span>
                </div>

                {/* 加载状态 */}
                {loadingId === caseData.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* 标题和描述 */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{caseData.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{caseData.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
