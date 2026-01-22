/**
 * LogoSilhouette 主应用
 * Landing Page + Embedded App
 */

import { Hero } from '@/components/Hero'
import { EmbeddedApp } from '@/components/EmbeddedApp'
import { CaseGallery } from '@/components/CaseGallery'
import { HowItWorks, Features, UseCases, FAQ, FinalCTA } from '@/components/Landing'
import { useError } from '@/store'

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

      {/* Hero 区域 */}
      <Hero />

      {/* 嵌入式应用 */}
      <section id="embedded-app" className="py-8 px-4 bg-gray-50">
        <EmbeddedApp />
      </section>

      {/* 案例展示 */}
      <CaseGallery />

      {/* SEO 内容区域 */}
      <HowItWorks />
      <Features />
      <UseCases />
      <FAQ />
      <FinalCTA />

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-gray-500">
        <p>LogoSilhouette &mdash; Free Logo Silhouette Generator</p>
        <p className="mt-1">100% browser-based. Your files never leave your device.</p>
      </footer>
    </div>
  )
}

export default App
