'use client'

import { CompanyResult } from '@/types'

interface SearchMeta {
  companyName: string
  industryName: string
  minAge: number
  maxAge: number
}

interface CompanyResultsProps {
  results: CompanyResult[]
  isLoading: boolean
  hasSearched: boolean
  searchMeta: SearchMeta
  matchedCompaniesCount: number
  processedCompaniesCount: number
  wasCandidateSetTruncated: boolean
  shortlistedCompanyNumbers: Set<string>
  shortlistCount: number
  onToggleShortlist: (company: CompanyResult) => void
  onExportResults: () => void
  onExportShortlist: () => void
}

function formatSearchContext(searchMeta: SearchMeta): string {
  const parts = [
    searchMeta.companyName ? `Company: ${searchMeta.companyName}` : '',
    searchMeta.industryName ? `Industry: ${searchMeta.industryName}` : '',
    `Age range: ${searchMeta.minAge}-${searchMeta.maxAge}`,
  ].filter(Boolean)

  return parts.join(' | ')
}

export default function CompanyResults({
  results,
  isLoading,
  hasSearched,
  searchMeta,
  matchedCompaniesCount,
  processedCompaniesCount,
  wasCandidateSetTruncated,
  shortlistedCompanyNumbers,
  shortlistCount,
  onToggleShortlist,
  onExportResults,
  onExportShortlist,
}: CompanyResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-sm text-slate-600">Searching...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded p-12 text-center">
        {hasSearched ? (
          <>
            <p className="text-sm text-slate-600 mb-2">{formatSearchContext(searchMeta)}</p>
            <p className="text-base text-slate-900">
              {matchedCompaniesCount === 0
                ? 'No companies matched your search criteria.'
                : `Found ${matchedCompaniesCount} companies, but none had directors in the target age range.`}
            </p>
            {wasCandidateSetTruncated && (
              <p className="mt-3 text-xs text-amber-700">
                Only processed {processedCompaniesCount} companies. Try narrowing your filters.
              </p>
            )}
          </>
        ) : (
          <p className="text-slate-600">
            Use the search criteria above to find succession opportunities.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="bg-white border border-slate-200 rounded p-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {results.length} {results.length === 1 ? 'Opportunity' : 'Opportunities'} Found
            </h2>
            <p className="text-xs text-slate-600 mt-1">{formatSearchContext(searchMeta)}</p>
            {wasCandidateSetTruncated && (
              <p className="mt-2 text-xs text-amber-700">
                Processed {processedCompaniesCount} of {matchedCompaniesCount} matches. Narrow filters for complete coverage.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onExportResults}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Export Results
            </button>
            <button
              type="button"
              onClick={onExportShortlist}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Shortlist ({shortlistCount})
            </button>
          </div>
        </div>
      </div>

      {/* Company Cards */}
      {results.map((company) => {
        const isShortlisted = shortlistedCompanyNumbers.has(company.companyNumber)
        const retirementRate = company.directors.length > 0
          ? (company.retiringSoonCount / company.directors.length) * 100
          : 0

        return (
          <div
            key={company.companyNumber}
            className="bg-white border border-slate-200 rounded overflow-hidden hover:border-slate-300 transition-colors"
          >
            {/* Company Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {company.companyName}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span>#{company.companyNumber}</span>
                    <span>{company.companyStatus}</span>
                    {company.dateOfCreation && (
                      <span>Est. {new Date(company.dateOfCreation).getFullYear()}</span>
                    )}
                    {company.address && (
                      <span>{[company.address.locality, company.address.region].filter(Boolean).join(', ')}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleShortlist(company)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    isShortlisted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-4 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Retiring Soon</div>
                  <div className="text-2xl font-semibold text-orange-600">{company.retiringSoonCount}</div>
                  <div className="text-xs text-slate-600">directors</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Retirement Rate</div>
                  <div className="text-2xl font-semibold text-slate-900">{retirementRate.toFixed(0)}%</div>
                  <div className="text-xs text-slate-600">of board</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Total Directors</div>
                  <div className="text-2xl font-semibold text-slate-900">{company.directors.length}</div>
                  <div className="text-xs text-slate-600">{company.knownDirectorAges} known ages</div>
                </div>
              </div>
            </div>

            {/* Directors Table */}
            <div className="p-4">
              <div className="text-xs font-medium text-slate-700 mb-3">DIRECTORS</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 font-medium text-slate-700">Name</th>
                      <th className="text-left py-2 px-4 font-medium text-slate-700">Role</th>
                      <th className="text-left py-2 px-4 font-medium text-slate-700">Appointed</th>
                      <th className="text-right py-2 pl-4 font-medium text-slate-700">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.directors.map((director, index) => {
                      const inRange = director.age !== undefined &&
                        director.age >= searchMeta.minAge &&
                        director.age <= searchMeta.maxAge

                      return (
                        <tr
                          key={`${company.companyNumber}-${index}`}
                          className={`border-b border-slate-100 ${inRange ? 'bg-orange-50' : ''}`}
                        >
                          <td className="py-2 pr-4">
                            <div className="font-medium text-slate-900">{director.name}</div>
                            {director.nationality && (
                              <div className="text-slate-500 text-[11px]">{director.nationality}</div>
                            )}
                          </td>
                          <td className="py-2 px-4 text-slate-600">
                            {director.occupation || '-'}
                          </td>
                          <td className="py-2 px-4 text-slate-600">
                            {director.appointedOn ? new Date(director.appointedOn).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short'
                            }) : '-'}
                          </td>
                          <td className="py-2 pl-4 text-right">
                            {director.age !== undefined ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className={`font-semibold ${inRange ? 'text-orange-600' : 'text-slate-900'}`}>
                                  {director.age}
                                </span>
                                {inRange && (
                                  <span className="inline-block px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-medium rounded">
                                    TARGET
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">Unknown</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
              <div className="flex flex-wrap justify-between items-center gap-3 text-xs">
                {company.sicCodes && company.sicCodes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">SIC:</span>
                    <div className="flex gap-1">
                      {company.sicCodes.slice(0, 3).map((code) => (
                        <span key={code} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px]">
                          {code}
                        </span>
                      ))}
                      {company.sicCodes.length > 3 && (
                        <span className="text-slate-500">+{company.sicCodes.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
                <a
                  href={`https://find-and-update.company-information.service.gov.uk/company/${company.companyNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View on Companies House →
                </a>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
