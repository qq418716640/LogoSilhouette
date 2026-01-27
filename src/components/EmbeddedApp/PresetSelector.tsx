/**
 * 预设选择器
 */

import { useAppStore } from '@/store'
import { getPresetList, DEFAULT_PRESET_ID } from '@/presets/presets'
import type { PresetId } from '@/presets/types'

export function PresetSelector() {
  const { activePreset, setActivePreset } = useAppStore()
  const presets = getPresetList()

  return (
    <div className="space-y-2 md:space-y-3">
      <h3 className="text-xs md:text-sm font-medium text-gray-700">Preset</h3>
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setActivePreset(preset.id as PresetId)}
            className={`
              px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium
              transition-all duration-200
              ${activePreset === preset.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {preset.name}
            {preset.id === DEFAULT_PRESET_ID && (
              <span className="ml-1 text-xs opacity-70 hidden md:inline">(Default)</span>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {presets.find(p => p.id === activePreset)?.description}
      </p>
    </div>
  )
}
