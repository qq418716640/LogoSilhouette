/**
 * Final CTA 区域
 */

export function FinalCTA() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="py-16 px-4 bg-gray-900">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Create a clean logo silhouette in seconds
        </h2>
        <p className="text-gray-400 mb-8">
          No upload to servers. No signup required. Free exports.
        </p>
        <button
          onClick={scrollToTop}
          className="px-8 py-4 bg-white text-gray-900 text-lg font-medium rounded-xl hover:bg-gray-100 transition-colors"
        >
          Upload Logo Image
        </button>
      </div>
    </section>
  )
}
