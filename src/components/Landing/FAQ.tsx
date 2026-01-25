/**
 * FAQ 区域
 */

import { useState } from 'react'

const FAQS = [
  {
    id: 'what-is',
    question: 'What is LogoSilhouette?',
    answer: 'LogoSilhouette is a free online tool that converts logo images into clean black silhouette graphics. You can export the result as SVG, transparent PNG, or white-background JPG.',
  },
  {
    id: 'free',
    question: 'Is LogoSilhouette free to use?',
    answer: 'Yes. LogoSilhouette is completely free and does not require signup or login.',
  },
  {
    id: 'privacy',
    question: 'Are my logo images uploaded to a server?',
    answer: 'No. All image processing happens locally in your browser. Your files are never uploaded or stored on our servers.',
  },
  {
    id: 'formats-input',
    question: 'What image formats are supported?',
    answer: 'You can upload PNG, JPG, or WebP images. For best results, use logos with clear contrast between the foreground and background.',
  },
  {
    id: 'formats-output',
    question: 'What export formats does LogoSilhouette support?',
    answer: 'LogoSilhouette supports SVG (vector format, ideal for design tools), PNG (transparent background), and JPG (white background).',
  },
  {
    id: 'sizes',
    question: 'What export sizes are available?',
    answer: 'PNG and JPG exports are available in 512×512, 1024×1024 (recommended), and 2048×2048. SVG exports are resolution-independent.',
  },
  {
    id: 'preset',
    question: 'What is the default preset and who is it for?',
    answer: 'The default preset is Minimal Logo, optimized for logo marks, icons, laser cutting and engraving, and clean, simplified vector shapes.',
  },
  {
    id: 'rough',
    question: 'Why does my silhouette look rough or noisy?',
    answer: 'This usually happens when the source image has low contrast or too much background detail. Try using the Minimal Logo or Clean Silhouette preset, increasing the simplification level, or uploading a higher-contrast logo image.',
  },
  {
    id: 'edit-svg',
    question: 'Can I edit the exported SVG file?',
    answer: 'Yes. The exported SVG works in popular design tools such as Figma, Adobe Illustrator, and Inkscape.',
  },
  {
    id: 'laser',
    question: 'Is LogoSilhouette suitable for laser cutting or engraving?',
    answer: 'Yes. The Minimal Logo preset produces simplified shapes with fewer vector nodes, making it suitable for laser cutting and engraving workflows.',
  },
]

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null)

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <section id="faq" className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
