/**
 * Use Cases 区域
 */

const USE_CASES = [
  {
    title: 'Logo silhouette SVG for branding',
    description: 'Create clean vector silhouettes for brand guidelines',
  },
  {
    title: 'Transparent PNG for websites',
    description: 'Perfect for overlays and responsive web design',
  },
  {
    title: 'White-background JPG for documents',
    description: 'Ready for print materials and presentations',
  },
  {
    title: 'Laser cutting & engraving',
    description: 'Simplified shapes ideal for CNC and laser machines',
  },
]

export function UseCases() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
          Use Cases
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {USE_CASES.map((useCase) => (
            <div
              key={useCase.title}
              className="flex gap-4 p-6 bg-white rounded-xl border border-gray-200"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {useCase.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {useCase.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
