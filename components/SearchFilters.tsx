'use client'

import { useState } from 'react'
import { SearchParams } from '@/types'

interface SearchFiltersProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

export default function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [minAge, setMinAge] = useState<string>('60')
  const [maxAge, setMaxAge] = useState<string>('75')
  const [sicCode, setSicCode] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params: SearchParams = {
      ...(minAge && { minAge: parseInt(minAge) }),
      ...(maxAge && { maxAge: parseInt(maxAge) }),
      ...(sicCode && { sicCode }),
      ...(companyName && { companyName }),
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
            <label htmlFor="sicCode" className="block text-sm font-medium text-slate-700 mb-1">
              SIC Code (optional)
            </label>
            <input
              type="text"
              id="sicCode"
              value={sicCode}
              onChange={(e) => setSicCode(e.target.value)}
              placeholder="e.g., 62012"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
              min="50"
              max="100"
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
              min="50"
              max="100"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-slate-700">
            <strong>💡 Note:</strong> The Companies House API has rate limits.
            For best results, narrow your search using company name or SIC code.
            This initial version searches a sample of companies.
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
