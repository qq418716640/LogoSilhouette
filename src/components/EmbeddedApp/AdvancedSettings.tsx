/**
 * 高级设置面板
 */

import { useAppStore } from '@/store'
import type { DenoiseLevel } from '@/presets/types'

const DENOISE_OPTIONS: { value: DenoiseLevel; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function AdvancedSettings() {
  const { params, setParams, advancedOpen, setAdvancedOpen, resetParamsToPreset } = useAppStore()

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* 折叠头部 */}
      <button
        onClick={() => setAdvancedOpen(!advancedOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">Advanced Settings</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 展开内容 */}
      {advancedOpen && (
        <div className="p-4 space-y-5 bg-white">
          {/* Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-gray-600">Threshold</label>
              <span className="text-sm text-gray-500">{params.threshold}</span>
            </div>
            <input
              type="range"
              min={50}
              max={240}
              value={params.threshold}
              onChange={(e) => setParams({ threshold: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Invert */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Invert colors</label>
            <button
              onClick={() => setParams({ invert: !params.invert })}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${params.invert ? 'bg-gray-900' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                  transition-transform ${params.invert ? 'translate-x-5' : ''}
                `}
              />
            </button>
          </div>

          {/* Noise Cleanup */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Noise Cleanup</label>
            <div className="flex gap-2">
              {DENOISE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setParams({ denoiseLevel: option.value })}
                  className={`
                    px-3 py-1.5 text-xs rounded-md transition-colors
                    ${params.denoiseLevel === option.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simplification */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-gray-600">Simplification</label>
              <span className="text-sm text-gray-500">{params.pathOmit}</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={params.pathOmit}
              onChange={(e) => setParams({ pathOmit: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Auto Crop */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Auto crop to logo</label>
            <button
              onClick={() => setParams({ autoCrop: !params.autoCrop })}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${params.autoCrop ? 'bg-gray-900' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                  transition-transform ${params.autoCrop ? 'translate-x-5' : ''}
                `}
              />
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetParamsToPreset}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset to preset defaults
          </button>
        </div>
      )}
    </div>
  )
}
