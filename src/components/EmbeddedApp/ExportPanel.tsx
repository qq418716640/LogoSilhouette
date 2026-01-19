/**
 * 导出面板
 */

import { useState, useRef } from 'react'
import { useAppStore } from '@/store'
import { exportAndDownload } from '@/export'
import type { ExportFormat, ExportResolution } from '@/store/types'
import { FILL_COLOR_PRESETS } from '@/store/types'

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'svg', label: 'SVG', description: 'Vector (scalable)' },
  { value: 'png', label: 'PNG', description: 'Transparent' },
  { value: 'jpg', label: 'JPG', description: 'White background' },
]

const RESOLUTION_OPTIONS: ExportResolution[] = [512, 1024, 2048]

export function ExportPanel() {
  const {
    result,
    exportFormat,
    exportResolution,
    fillColor,
    setExportFormat,
    setExportResolution,
    setFillColor,
  } = useAppStore()

  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    if (!result?.svgClean) return

    setIsExporting(true)
    setExportError(null)

    try {
      await exportAndDownload({
        svgContent: result.svgClean,
        format: exportFormat,
        resolution: exportResolution,
        fillColor,
      })
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
      console.error('Export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleColorPickerClick = () => {
    colorInputRef.current?.click()
  }

  const hasResult = result?.svgClean != null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Export</h3>

      {/* 格式选择 */}
      <div className="space-y-2">
        <label className="text-xs text-gray-500 uppercase tracking-wide">Format</label>
        <div className="flex gap-2">
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setExportFormat(option.value)}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm transition-colors
                ${exportFormat === option.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <div className="font-medium">{option.label}</div>
              <div className={`text-xs ${exportFormat === option.value ? 'text-gray-300' : 'text-gray-500'}`}>
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 分辨率选择（仅对光栅格式显示） */}
      {exportFormat !== 'svg' && (
        <div className="space-y-2">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Resolution</label>
          <div className="flex gap-2">
            {RESOLUTION_OPTIONS.map((res) => (
              <button
                key={res}
                onClick={() => setExportResolution(res)}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${exportResolution === res
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {res} × {res}
                {res === 1024 && <span className="ml-1 text-xs opacity-70">(Default)</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 填充色选择 */}
      <div className="space-y-2">
        <label className="text-xs text-gray-500 uppercase tracking-wide">Fill Color</label>
        <div className="flex items-center gap-2">
          {/* 预设色块 */}
          {FILL_COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setFillColor(color)}
              className={`
                w-8 h-8 rounded-md border-2 transition-all
                ${fillColor === color
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-200 hover:border-gray-400'
                }
              `}
              style={{
                backgroundColor: color,
                boxShadow: color === '#FFFFFF' ? 'inset 0 0 0 1px #e5e5e5' : undefined,
              }}
              title={color}
            />
          ))}

          {/* 自定义颜色按钮 */}
          <button
            onClick={handleColorPickerClick}
            className={`
              w-8 h-8 rounded-md border-2 transition-all relative overflow-hidden
              ${!FILL_COLOR_PRESETS.includes(fillColor as typeof FILL_COLOR_PRESETS[number])
                ? 'border-blue-500 scale-110'
                : 'border-gray-200 hover:border-gray-400'
              }
            `}
            style={{ backgroundColor: fillColor }}
            title="Custom color"
          >
            {/* 彩虹渐变指示这是自定义色选择器 */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
              }}
            />
          </button>

          {/* 隐藏的颜色输入 */}
          <input
            ref={colorInputRef}
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="sr-only"
          />

          {/* 当前颜色值 */}
          <span className="text-xs text-gray-500 ml-1 font-mono">{fillColor}</span>
        </div>
      </div>

      {/* 错误提示 */}
      {exportError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {exportError}
        </div>
      )}

      {/* 下载按钮 */}
      <button
        onClick={handleExport}
        disabled={!hasResult || isExporting}
        className={`
          w-full py-3 px-4 rounded-xl text-base font-medium
          transition-all duration-200
          ${hasResult && !isExporting
            ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isExporting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Exporting...
          </span>
        ) : (
          `Download ${exportFormat.toUpperCase()}`
        )}
      </button>

      {!hasResult && (
        <p className="text-xs text-gray-500 text-center">
          Process an image to enable export
        </p>
      )}
    </div>
  )
}
