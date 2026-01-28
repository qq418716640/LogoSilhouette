/**
 * LogoSilhouette 主应用
 * Landing Page + Embedded App
 */

import { lazy, Suspense } from 'react'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { EmbeddedApp } from '@/components/EmbeddedApp'
import { CaseGallery } from '@/components/CaseGallery'
import { useError } from '@/store'

// 懒加载非首屏 Landing 组件
const HowItWorks = lazy(() => import('@/components/Landing/HowItWorks').then(m => ({ default: m.HowItWorks })))
const Features = lazy(() => import('@/components/Landing/Features').then(m => ({ default: m.Features })))
const UseCases = lazy(() => import('@/components/Landing/UseCases').then(m => ({ default: m.UseCases })))
const FAQ = lazy(() => import('@/components/Landing/FAQ').then(m => ({ default: m.FAQ })))
const RelatedTools = lazy(() => import('@/components/Landing/RelatedTools').then(m => ({ default: m.RelatedTools })))
const FinalCTA = lazy(() => import('@/components/Landing/FinalCTA').then(m => ({ default: m.FinalCTA })))

// Landing 区块加载占位
function LandingSectionFallback() {
  return <div className="py-16" />
}

function App() {
  const error = useError()

  return (
    <div className="min-h-screen bg-white">
      {/* 全局错误提示 */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500 text-white rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Hero 区域 */}
      <Hero />

      {/* 案例展示 */}
      <CaseGallery />

      {/* 嵌入式应用 */}
      <section id="embedded-app" className="py-8 px-4 bg-gray-50">
        <EmbeddedApp />
      </section>

      {/* SEO 内容区域 - 懒加载 */}
      <Suspense fallback={<LandingSectionFallback />}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={<LandingSectionFallback />}>
        <Features />
      </Suspense>
      <Suspense fallback={<LandingSectionFallback />}>
        <UseCases />
      </Suspense>
      <Suspense fallback={<LandingSectionFallback />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<LandingSectionFallback />}>
        <RelatedTools />
      </Suspense>
      <Suspense fallback={<LandingSectionFallback />}>
        <FinalCTA />
      </Suspense>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-gray-500">
        <p>LogoSilhouette &mdash; Free Logo Silhouette Generator</p>
        <p className="mt-1">100% browser-based. Your files never leave your device.</p>
      </footer>
    </div>
  )
}

export default App
