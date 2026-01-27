/**
 * Related Tools - AI Logo Generator 工具推荐
 */

interface Tool {
  id: string
  title: string
  description: string
  features: string[]
  icon: string
  url: string
  color: string
}

const tools: Tool[] = [
  {
    id: 'text-to-logo',
    title: 'Text to Logo',
    description: 'Transform your brand name or slogan into professional wordmark designs instantly with AI.',
    features: [
      'Instant text-to-logo conversion',
      'Smart typography & spacing',
      'Industry-specific font styles',
      'Free SVG & PNG downloads',
    ],
    icon: '✍️',
    url: 'https://www.ailogocreator.io/ai-logo-generator/text-to-logo',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'image-to-logo',
    title: 'Image to Logo',
    description: 'Upload any image and let AI transform it into a professional, scalable logo design.',
    features: [
      'Visual recognition & analysis',
      'Color & shape detection',
      'Real-time customization',
      'High-resolution outputs',
    ],
    icon: '🖼️',
    url: 'https://www.ailogocreator.io/ai-logo-generator/image-to-logo',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'sketch-to-logo',
    title: 'Sketch to Logo',
    description: 'Turn your hand-drawn sketches into refined vector logos with automatic AI processing.',
    features: [
      'Hand-drawn sketch support',
      'Auto line detection & smoothing',
      'Vector conversion',
      'Multiple style options',
    ],
    icon: '✏️',
    url: 'https://www.ailogocreator.io/ai-logo-generator/sketch-to-logo',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'letter-to-logo',
    title: 'Letter to Logo',
    description: 'Create elegant monogram logos from initials or single letters, perfect for luxury brands.',
    features: [
      'Monogram generation',
      'Typography intelligence',
      'Geometric refinement',
      'Luxury brand focused',
    ],
    icon: '🅰️',
    url: 'https://www.ailogocreator.io/ai-logo-generator/letter-to-logo',
    color: 'from-green-500 to-emerald-500',
  },
]

export function RelatedTools() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Need More Than Silhouettes?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create full-color AI logos from text, images, sketches, or letters with these powerful tools
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
            >
              {/* Icon with Gradient Background */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {tool.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {tool.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {tool.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-4">
                {tool.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-xs text-gray-500">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                Try it Free
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* External Link Indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            All tools are AI-powered and offer free downloads in SVG and PNG formats
          </p>
        </div>
      </div>
    </section>
  )
}
