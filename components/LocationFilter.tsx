'use client'

import { useState } from 'react'
import { LocationFilter as LocationFilterType } from '@/types'
import { UK_REGIONS, UK_LOCALITIES, POSTCODE_AREAS } from '@/lib/data/ukLocations'

interface LocationFilterProps {
  value: LocationFilterType
  onChange: (filter: LocationFilterType) => void
}

export default function LocationFilter({ value, onChange }: LocationFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleRegionChange = (region: string, checked: boolean) => {
    const currentRegions = value.regions || []
    const newRegions = checked
      ? [...currentRegions, region]
      : currentRegions.filter(r => r !== region)

    onChange({
      ...value,
      regions: newRegions.length > 0 ? newRegions : undefined,
    })
  }

  const handleLocalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value)
    onChange({
      ...value,
      localities: selectedOptions.length > 0 ? selectedOptions : undefined,
    })
  }

  const handlePostcodeAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim().toUpperCase()
    const areas = input.split(',').map(a => a.trim()).filter(Boolean)
    onChange({
      ...value,
      postcodeAreas: areas.length > 0 ? areas : undefined,
    })
  }

  const clearFilters = () => {
    onChange({})
  }

  const hasFilters = (value.regions && value.regions.length > 0) ||
    (value.localities && value.localities.length > 0) ||
    (value.postcodeAreas && value.postcodeAreas.length > 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-slate-700">
          UK LOCATION
        </label>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Region Selection */}
      <div>
        <p className="text-xs text-slate-600 mb-2">Region/Country</p>
        <div className="grid grid-cols-2 gap-2">
          {UK_REGIONS.map(region => (
            <label
              key={region.code}
              className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(value.regions || []).includes(region.name)}
                onChange={(e) => handleRegionChange(region.name, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs">{region.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        {showAdvanced ? '▼' : '▶'} Advanced location filters
      </button>

      {showAdvanced && (
        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          {/* Locality Selection */}
          <div>
            <label htmlFor="localities" className="block text-xs font-medium text-slate-700 mb-1.5">
              CITY/COUNTY
            </label>
            <select
              id="localities"
              multiple
              value={value.localities || []}
              onChange={handleLocalityChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              size={5}
            >
              {UK_LOCALITIES.map(locality => (
                <option key={locality} value={locality}>
                  {locality}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Hold Ctrl/Cmd to select multiple
            </p>
          </div>

          {/* Postcode Area Input */}
          <div>
            <label htmlFor="postcodeAreas" className="block text-xs font-medium text-slate-700 mb-1.5">
              POSTCODE AREAS
            </label>
            <input
              type="text"
              id="postcodeAreas"
              value={(value.postcodeAreas || []).join(', ')}
              onChange={handlePostcodeAreaChange}
              placeholder="e.g., SW, M, EH"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter postcode areas separated by commas (e.g., SW, M, EH for London SW, Manchester, Edinburgh)
            </p>
          </div>

          {/* Popular Postcode Areas */}
          <div>
            <p className="text-xs text-slate-600 mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-1">
              {[
                { code: 'SW', name: 'SW London' },
                { code: 'M', name: 'Manchester' },
                { code: 'B', name: 'Birmingham' },
                { code: 'G', name: 'Glasgow' },
                { code: 'EH', name: 'Edinburgh' },
                { code: 'LS', name: 'Leeds' },
                { code: 'BS', name: 'Bristol' },
              ].map(area => {
                const isSelected = (value.postcodeAreas || []).includes(area.code)
                return (
                  <button
                    key={area.code}
                    type="button"
                    onClick={() => {
                      const current = value.postcodeAreas || []
                      const newAreas = isSelected
                        ? current.filter(a => a !== area.code)
                        : [...current, area.code]
                      onChange({
                        ...value,
                        postcodeAreas: newAreas.length > 0 ? newAreas : undefined,
                      })
                    }}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {area.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
