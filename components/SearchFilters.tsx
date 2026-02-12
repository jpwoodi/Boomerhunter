'use client'

import { useState } from 'react'
import { COMPANIES_HOUSE_INDUSTRIES } from '@/lib/data/industries'
import { SearchParams } from '@/types'

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

    setFormError(null)

    const params: SearchParams = {
      minAge: Math.round(parsedMinAge),
      maxAge: Math.round(parsedMaxAge),
      ...(companyName && { companyName }),
      ...(industryDivision && { industryDivision }),
      exactNameOnly,
      activeCompaniesOnly,
      includeNoRetirementMatches,
    }

    onSearch(params)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">
        Search Filters
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
              Company Name (optional)
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Acme Ltd"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="industryDivision" className="block text-sm font-medium text-slate-700 mb-1">
              Industry (optional)
            </label>
            <select
              id="industryDivision"
              value={industryDivision}
              onChange={(e) => setIndustryDivision(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            <label htmlFor="minAge" className="block text-sm font-medium text-slate-700 mb-1">
              Minimum Director Age
            </label>
            <input
              type="number"
              id="minAge"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              min={MIN_ALLOWED_AGE}
              max={MAX_ALLOWED_AGE}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="maxAge" className="block text-sm font-medium text-slate-700 mb-1">
              Maximum Director Age
            </label>
            <input
              type="number"
              id="maxAge"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              min={MIN_ALLOWED_AGE}
              max={MAX_ALLOWED_AGE}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {formError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="exactNameOnly"
            checked={exactNameOnly}
            onChange={(e) => setExactNameOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="exactNameOnly" className="text-sm font-medium text-slate-700">
            Exact name only
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="activeCompaniesOnly"
            checked={activeCompaniesOnly}
            onChange={(e) => setActiveCompaniesOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="activeCompaniesOnly" className="text-sm font-medium text-slate-700">
            Active companies only
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeNoRetirementMatches"
            checked={includeNoRetirementMatches}
            onChange={(e) => setIncludeNoRetirementMatches(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="includeNoRetirementMatches" className="text-sm font-medium text-slate-700">
            Include companies with no directors in age range
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-slate-700">
            <strong>Note:</strong> Results are ranked by a search-fund opportunity score built from
            succession pressure, leadership concentration, company maturity, tenure, and data confidence.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
        >
          {isLoading ? 'Searching...' : 'Search Companies'}
        </button>
      </form>
    </div>
  )
}
