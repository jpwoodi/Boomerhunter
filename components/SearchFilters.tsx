'use client'

import { useState } from 'react'
import { COMPANIES_HOUSE_INDUSTRIES } from '@/lib/data/industries'
import { SearchParams, LocationFilter as LocationFilterType } from '@/types'
import LocationFilter from './LocationFilter'

interface SearchFiltersProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

const MIN_ALLOWED_AGE = 40
const MAX_ALLOWED_AGE = 100

export default function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [minAge, setMinAge] = useState<string>('60')
  const [maxAge, setMaxAge] = useState<string>('75')
  const [companyName, setCompanyName] = useState<string>('')
  const [industryDivision, setIndustryDivision] = useState<string>('')
  const [minCompanyAge, setMinCompanyAge] = useState<string>('')
  const [maxCompanyAge, setMaxCompanyAge] = useState<string>('')
  const [locationFilter, setLocationFilter] = useState<LocationFilterType>({})
  const [exactNameOnly, setExactNameOnly] = useState(true)
  const [activeCompaniesOnly, setActiveCompaniesOnly] = useState(true)
  const [includeNoRetirementMatches, setIncludeNoRetirementMatches] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsedMinAge = Number(minAge)
    const parsedMaxAge = Number(maxAge)

    if (!Number.isFinite(parsedMinAge) || !Number.isFinite(parsedMaxAge)) {
      setFormError('Age filters must be valid numbers.')
      return
    }

    if (parsedMinAge < MIN_ALLOWED_AGE || parsedMaxAge > MAX_ALLOWED_AGE) {
      setFormError(`Age filters must be between ${MIN_ALLOWED_AGE} and ${MAX_ALLOWED_AGE}.`)
      return
    }

    if (parsedMinAge > parsedMaxAge) {
      setFormError('Minimum age cannot be greater than maximum age.')
      return
    }

    // Validate company age if provided
    if (minCompanyAge && (!Number.isFinite(Number(minCompanyAge)) || Number(minCompanyAge) < 0)) {
      setFormError('Minimum company age must be a non-negative number.')
      return
    }

    if (maxCompanyAge && (!Number.isFinite(Number(maxCompanyAge)) || Number(maxCompanyAge) < 0)) {
      setFormError('Maximum company age must be a non-negative number.')
      return
    }

    if (minCompanyAge && maxCompanyAge && Number(minCompanyAge) > Number(maxCompanyAge)) {
      setFormError('Minimum company age cannot be greater than maximum company age.')
      return
    }

    setFormError(null)

    const hasLocationFilter = (locationFilter.regions && locationFilter.regions.length > 0) ||
      (locationFilter.localities && locationFilter.localities.length > 0) ||
      (locationFilter.postcodeAreas && locationFilter.postcodeAreas.length > 0)

    const params: SearchParams = {
      minAge: Math.round(parsedMinAge),
      maxAge: Math.round(parsedMaxAge),
      ...(companyName && { companyName }),
      ...(industryDivision && { industryDivision }),
      ...(minCompanyAge && { minCompanyAge: Math.round(Number(minCompanyAge)) }),
      ...(maxCompanyAge && { maxCompanyAge: Math.round(Number(maxCompanyAge)) }),
      ...(hasLocationFilter && { locationFilter }),
      exactNameOnly,
      activeCompaniesOnly,
      includeNoRetirementMatches,
    }

    onSearch(params)
  }

  return (
    <div className="bg-white border border-slate-200 rounded p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Search Criteria
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="block text-xs font-medium text-slate-700 mb-1.5">
              COMPANY NAME
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="industryDivision" className="block text-xs font-medium text-slate-700 mb-1.5">
              INDUSTRY
            </label>
            <select
              id="industryDivision"
              value={industryDivision}
              onChange={(e) => setIndustryDivision(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All industries</option>
              {COMPANIES_HOUSE_INDUSTRIES.map((industry) => (
                <option key={industry.division_code} value={industry.division_code}>
                  {industry.division_name} ({industry.division_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="minCompanyAge" className="block text-xs font-medium text-slate-700 mb-1.5">
              MIN COMPANY AGE (YEARS)
            </label>
            <input
              type="number"
              id="minCompanyAge"
              value={minCompanyAge}
              onChange={(e) => setMinCompanyAge(e.target.value)}
              placeholder="e.g., 10"
              min={0}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="maxCompanyAge" className="block text-xs font-medium text-slate-700 mb-1.5">
              MAX COMPANY AGE (YEARS)
            </label>
            <input
              type="number"
              id="maxCompanyAge"
              value={maxCompanyAge}
              onChange={(e) => setMaxCompanyAge(e.target.value)}
              placeholder="e.g., 50"
              min={0}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setMinCompanyAge('10'); setMaxCompanyAge('') }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            10+ years
          </button>
          <button
            type="button"
            onClick={() => { setMinCompanyAge('15'); setMaxCompanyAge('') }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            15+ years
          </button>
          <button
            type="button"
            onClick={() => { setMinCompanyAge('20'); setMaxCompanyAge('') }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            20+ years
          </button>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <LocationFilter value={locationFilter} onChange={setLocationFilter} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="minAge" className="block text-xs font-medium text-slate-700 mb-1.5">
              MIN DIRECTOR AGE
            </label>
            <input
              type="number"
              id="minAge"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              min={MIN_ALLOWED_AGE}
              max={MAX_ALLOWED_AGE}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="maxAge" className="block text-xs font-medium text-slate-700 mb-1.5">
              MAX DIRECTOR AGE
            </label>
            <input
              type="number"
              id="maxAge"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              min={MIN_ALLOWED_AGE}
              max={MAX_ALLOWED_AGE}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {formError && (
          <div className="rounded border-l-4 border-red-500 bg-red-50 p-3 text-xs text-red-700">
            {formError}
          </div>
        )}

        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-700 mb-3">FILTERS</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                id="exactNameOnly"
                checked={exactNameOnly}
                onChange={(e) => setExactNameOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs">Exact name match only</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                id="activeCompaniesOnly"
                checked={activeCompaniesOnly}
                onChange={(e) => setActiveCompaniesOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs">Active companies only</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                id="includeNoRetirementMatches"
                checked={includeNoRetirementMatches}
                onChange={(e) => setIncludeNoRetirementMatches(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs">Include companies with no directors in target age range</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded p-3">
          <p className="text-xs text-slate-600">
            <span className="font-medium">Note:</span> Results are ranked by number of directors in target age range, then by total director count.
          </p>
        </div>
      </form>
    </div>
  )
}
