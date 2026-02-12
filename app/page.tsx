'use client'

import { useEffect, useMemo, useState } from 'react'
import SearchFilters from '@/components/SearchFilters'
import CompanyResults from '@/components/CompanyResults'
import { CompanyResult, SearchParams, SearchResponse, ShortlistEntry } from '@/types'

const SHORTLIST_STORAGE_KEY = 'boomerhunter-shortlist'

interface SearchMetaState {
  companyName: string
  industryName: string
  minAge: number
  maxAge: number
}

interface ApiSearchResponse extends SearchResponse {
  processedCompaniesCount?: number
  wasCandidateSetTruncated?: boolean
}

function toCsvRow(values: Array<string | number | undefined>): string {
  return values.map((value) => {
    const stringValue = value === undefined ? '' : String(value)
    const escapedValue = stringValue.replace(/"/g, '""')
    return `"${escapedValue}"`
  }).join(',')
}

function downloadCsv(filename: string, rows: string[]) {
  const csvContent = rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function Home() {
  const [results, setResults] = useState<CompanyResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [matchedCompaniesCount, setMatchedCompaniesCount] = useState<number>(0)
  const [processedCompaniesCount, setProcessedCompaniesCount] = useState<number>(0)
  const [wasCandidateSetTruncated, setWasCandidateSetTruncated] = useState(false)
  const [searchMeta, setSearchMeta] = useState<SearchMetaState>({
    companyName: '',
    industryName: '',
    minAge: 60,
    maxAge: 75,
  })
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([])

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(SHORTLIST_STORAGE_KEY)
      if (!storedValue) {
        return
      }
      const parsed = JSON.parse(storedValue)
      if (Array.isArray(parsed)) {
        setShortlist(parsed as ShortlistEntry[])
      }
    } catch {
      // Ignore invalid localStorage data
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlist))
  }, [shortlist])

  const shortlistedCompanyNumbers = useMemo(
    () => new Set(shortlist.map(item => item.companyNumber)),
    [shortlist]
  )

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const queryParams = new URLSearchParams({
        ...(params.minAge !== undefined && { minAge: params.minAge.toString() }),
        ...(params.maxAge !== undefined && { maxAge: params.maxAge.toString() }),
        ...(params.companyName && { companyName: params.companyName }),
        ...(params.industryDivision && { industryDivision: params.industryDivision }),
        ...(params.exactNameOnly !== undefined && { exactNameOnly: String(params.exactNameOnly) }),
        ...(params.activeCompaniesOnly !== undefined && { activeCompaniesOnly: String(params.activeCompaniesOnly) }),
        ...(params.includeNoRetirementMatches !== undefined && { includeNoRetirementMatches: String(params.includeNoRetirementMatches) }),
      })

      const response = await fetch(`/api/search?${queryParams}`)
      const data = await response.json() as ApiSearchResponse

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || 'Search failed')
      }

      setResults(data.results || [])
      setMatchedCompaniesCount(data.matchedCompaniesCount || 0)
      setProcessedCompaniesCount(data.processedCompaniesCount || 0)
      setWasCandidateSetTruncated(Boolean(data.wasCandidateSetTruncated))
      setSearchMeta({
        companyName: data.searchParams?.companyName || '',
        industryName: data.searchParams?.industryName || '',
        minAge: data.searchParams?.minAge ?? 60,
        maxAge: data.searchParams?.maxAge ?? 75,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResults([])
      setMatchedCompaniesCount(0)
      setProcessedCompaniesCount(0)
      setWasCandidateSetTruncated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShortlist = (company: CompanyResult) => {
    setShortlist((current) => {
      const exists = current.some(item => item.companyNumber === company.companyNumber)
      if (exists) {
        return current.filter(item => item.companyNumber !== company.companyNumber)
      }

      return [
        ...current,
        {
          companyNumber: company.companyNumber,
          companyName: company.companyName,
          companyStatus: company.companyStatus,
          addedAt: new Date().toISOString(),
        },
      ]
    })
  }

  const exportResults = () => {
    if (results.length === 0) {
      return
    }

    const rows = [
      toCsvRow([
        'Company Number',
        'Company Name',
        'Status',
        'Opportunity Score',
        'Retiring Directors',
        'Known Director Ages',
        'Total Directors',
      ]),
      ...results.map(result => toCsvRow([
        result.companyNumber,
        result.companyName,
        result.companyStatus,
        result.opportunityScore,
        result.retiringSoonCount,
        result.knownDirectorAges,
        result.directors.length,
      ])),
    ]

    downloadCsv('boomerhunter-results.csv', rows)
  }

  const exportShortlist = () => {
    if (shortlist.length === 0) {
      return
    }

    const rows = [
      toCsvRow(['Company Number', 'Company Name', 'Status', 'Added At']),
      ...shortlist.map(item => toCsvRow([
        item.companyNumber,
        item.companyName,
        item.companyStatus,
        item.addedAt,
      ])),
    ]

    downloadCsv('boomerhunter-shortlist.csv', rows)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-2">
            BoomerHunter
          </h1>
          <p className="text-xl text-slate-600">
            Find UK companies with succession opportunities
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

          <CompanyResults
            results={results}
            isLoading={isLoading}
            hasSearched={hasSearched}
            searchMeta={searchMeta}
            matchedCompaniesCount={matchedCompaniesCount}
            processedCompaniesCount={processedCompaniesCount}
            wasCandidateSetTruncated={wasCandidateSetTruncated}
            shortlistedCompanyNumbers={shortlistedCompanyNumbers}
            shortlistCount={shortlist.length}
            onToggleShortlist={toggleShortlist}
            onExportResults={exportResults}
            onExportShortlist={exportShortlist}
          />
        </div>
      </div>
    </main>
  )
}
