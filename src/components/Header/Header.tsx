/**
 * Header 组件
 * 页面顶部导航栏
 */

export function Header() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              LogoSilhouette
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection('embedded-app')}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try It Free
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
