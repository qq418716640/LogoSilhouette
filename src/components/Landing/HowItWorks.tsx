/**
 * How it works 区域
 */

const STEPS = [
  {
    number: '1',
    title: 'Upload a logo image',
    description: 'Drop your PNG, JPG, or WebP file',
  },
  {
    number: '2',
    title: 'Choose a preset',
    description: 'Select Minimal Logo, Clean Silhouette, or Keep Details',
  },
  {
    number: '3',
    title: 'Download SVG, PNG, or JPG',
    description: 'Export in your preferred format and resolution',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
