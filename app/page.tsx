'use client'

import { useState } from 'react'
import SearchFilters from '@/components/SearchFilters'
import CompanyResults from '@/components/CompanyResults'
import { SearchParams, CompanyResult } from '@/types'

export default function Home() {
  const [results, setResults] = useState<CompanyResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        ...(params.minAge && { minAge: params.minAge.toString() }),
        ...(params.maxAge && { maxAge: params.maxAge.toString() }),
        ...(params.sicCode && { sicCode: params.sicCode }),
        ...(params.companyName && { companyName: params.companyName }),
      })

      const response = await fetch(`/api/search?${queryParams}`)

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-2">
            🎯 BoomerHunter
          </h1>
          <p className="text-xl text-slate-600">
            Find UK companies with directors approaching retirement
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          <SearchFilters onSearch={handleSearch} isLoading={isLoading} />

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <CompanyResults results={results} isLoading={isLoading} />
        </div>
      </div>
    </main>
  )
}
