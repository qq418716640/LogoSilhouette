/**
 * 高级设置面板
 */

import { useAppStore } from '@/store'
import type { DenoiseLevel, WorkingResolution } from '@/presets/types'
import { DEBUG_MODE } from '@/config/debug'

const DENOISE_OPTIONS: { value: DenoiseLevel; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const RESOLUTION_OPTIONS: { value: WorkingResolution; label: string }[] = [
  { value: 512, label: '512' },
  { value: 1024, label: '1024' },
  { value: 2048, label: '2048' },
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

          {/* Smoothness (qtres) - 核心参数 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-gray-600">Smoothness</label>
              <span className="text-sm text-gray-500">{params.qtres.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5.0}
              step={0.1}
              value={params.qtres}
              onChange={(e) => setParams({ qtres: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-400">
              Higher = smoother curves, fewer anchor points
            </p>
          </div>

          {/* Path Filter (pathomit) */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-gray-600">Path Filter</label>
              <span className="text-sm text-gray-500">{params.pathomit}</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              value={params.pathomit}
              onChange={(e) => setParams({ pathomit: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-400">
              0 = keep all paths, higher = filter small paths
            </p>
          </div>

          {/* Right Angle Enhance */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Enhance right angles</label>
            <button
              onClick={() => setParams({ rightangleenhance: !params.rightangleenhance })}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${params.rightangleenhance ? 'bg-gray-900' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                  transition-transform ${params.rightangleenhance ? 'translate-x-5' : ''}
                `}
              />
            </button>
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

          {/* Debug Panel - 仅在 DEBUG_MODE 开启时显示 */}
          {DEBUG_MODE && (
            <div className="mt-6 pt-4 border-t border-dashed border-orange-300 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">Debug Panel</span>
                <span className="text-xs text-orange-400">(dev only)</span>
              </div>

              {/* Working Resolution */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Working Resolution (maxSize)</label>
                <div className="flex gap-2">
                  {RESOLUTION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setParams({ maxSize: option.value })}
                      className={`
                        px-3 py-1.5 text-xs rounded-md transition-colors
                        ${params.maxSize === option.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {option.label}px
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Higher = more details, slower processing
                </p>
              </div>

              {/* ltres (直线容差) */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-600">Line Tolerance (ltres)</label>
                  <span className="text-sm text-gray-500">{params.ltres.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5.0}
                  step={0.1}
                  value={params.ltres}
                  onChange={(e) => setParams({ ltres: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* roundcoords (坐标精度) */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-600">Coord Precision (roundcoords)</label>
                  <span className="text-sm text-gray-500">{params.roundcoords}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={params.roundcoords}
                  onChange={(e) => setParams({ roundcoords: Number(e.target.value) })}
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
                    ${params.invert ? 'bg-orange-500' : 'bg-gray-300'}
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

              {/* removeSpecksMinArea */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-600">Remove Specks Area</label>
                  <span className="text-sm text-gray-500">{params.removeSpecksMinArea}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={300}
                  step={10}
                  value={params.removeSpecksMinArea}
                  onChange={(e) => setParams({ removeSpecksMinArea: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* fillHolesMaxArea */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-600">Fill Holes Area</label>
                  <span className="text-sm text-gray-500">{params.fillHolesMaxArea}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={300}
                  step={10}
                  value={params.fillHolesMaxArea}
                  onChange={(e) => setParams({ fillHolesMaxArea: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* cropPaddingPct */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-600">Crop Padding %</label>
                  <span className="text-sm text-gray-500">{params.cropPaddingPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={params.cropPaddingPct}
                  onChange={(e) => setParams({ cropPaddingPct: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* minMainComponentAreaPct */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-600">Min Component %</label>
                  <span className="text-sm text-gray-500">{params.minMainComponentAreaPct.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={params.minMainComponentAreaPct}
                  onChange={(e) => setParams({ minMainComponentAreaPct: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
