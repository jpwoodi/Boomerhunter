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
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-slate-600 font-medium">🔍 Searching for opportunities...</p>
        <p className="mt-2 text-sm text-slate-500">This may take a few moments</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center space-y-3">
        {hasSearched ? (
          <>
            <div className="text-4xl mb-2">🤷</div>
            <p className="text-slate-700 text-base font-medium">{formatSearchContext(searchMeta)}</p>
            <p className="text-slate-600">
              {matchedCompaniesCount === 0
                ? 'No companies matched your search criteria.'
                : `Found ${matchedCompaniesCount} companies, but none had directors in the target age range.`}
            </p>
            {wasCandidateSetTruncated && (
              <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 p-2 text-sm text-amber-800">
                ⚠️ Only processed {processedCompaniesCount} companies. Try narrowing your filters.
              </div>
            )}
            <p className="text-sm text-slate-500 mt-4">Try adjusting your filters or broadening your search.</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-2">👋</div>
            <p className="text-slate-600 text-lg font-medium">
              Ready to find your next opportunity?
            </p>
            <p className="text-sm text-slate-500">
              Use the search filters above to get started.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              ✅ {results.length} {results.length === 1 ? 'Opportunity' : 'Opportunities'} Found
            </h2>
            <p className="text-sm text-slate-600 mt-1">{formatSearchContext(searchMeta)}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onExportResults}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Export search results to CSV"
            >
              📊 Export Results
            </button>
            <button
              type="button"
              onClick={onExportShortlist}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Export your shortlist to CSV"
            >
              ⭐ Shortlist ({shortlistCount})
            </button>
          </div>
        </div>
        {wasCandidateSetTruncated && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-sm text-amber-800">
            ⚠️ Processed {processedCompaniesCount} of {matchedCompaniesCount} matched companies. Narrow your filters for complete coverage.
          </div>
        )}
      </div>

      {results.map((company) => {
        const isShortlisted = shortlistedCompanyNumbers.has(company.companyNumber)
        return (
          <div
            key={company.companyNumber}
            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-800">
                  {company.companyName}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  #{company.companyNumber} • {company.companyStatus}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                  🎯 {company.opportunityScore}/100
                </div>
                <div className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                  👴 {company.retiringSoonCount} retiring
                </div>
                <button
                  type="button"
                  onClick={() => onToggleShortlist(company)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isShortlisted
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isShortlisted ? '⭐ Shortlisted' : '+ Shortlist'}
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-md bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">Score Breakdown</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-slate-800">{company.scoreBreakdown.successionPressure}</div>
                  <div className="text-slate-600">Succession</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800">{company.scoreBreakdown.leadershipConcentration}</div>
                  <div className="text-slate-600">Leadership</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800">{company.scoreBreakdown.businessMaturity}</div>
                  <div className="text-slate-600">Maturity</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800">{company.scoreBreakdown.leadershipTenure}</div>
                  <div className="text-slate-600">Tenure</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800">{company.scoreBreakdown.dataConfidence}</div>
                  <div className="text-slate-600">Confidence</div>
                </div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {company.sicCodes && company.sicCodes.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-700 mb-1.5">🏢 Industry (SIC)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {company.sicCodes.slice(0, 3).map((code) => (
                      <span
                        key={code}
                        className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs"
                      >
                        {code}
                      </span>
                    ))}
                    {company.sicCodes.length > 3 && (
                      <span className="text-slate-500 text-xs">+{company.sicCodes.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              {company.address && (
                <div>
                  <p className="font-semibold text-slate-700 mb-1.5">📍 Location</p>
                  <p className="text-slate-600 text-xs">
                    {[
                      company.address.locality,
                      company.address.region,
                      company.address.postalCode,
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span>👥 Directors</span>
                <span className="text-sm font-normal text-slate-600">
                  ({company.directors.length} total, {company.knownDirectorAges} with known age)
                </span>
              </h4>
              <div className="space-y-2">
                {company.directors.map((director, index) => {
                  const inRange = director.age !== undefined &&
                    director.age >= searchMeta.minAge &&
                    director.age <= searchMeta.maxAge

                  return (
                    <div
                      key={`${company.companyNumber}-${index}`}
                      className={`p-3 rounded-lg border transition-colors ${
                        inRange
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{director.name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
                            {director.occupation && <span>💼 {director.occupation}</span>}
                            {director.nationality && <span>🌍 {director.nationality}</span>}
                            {director.appointedOn && (
                              <span>📅 Since {new Date(director.appointedOn).getFullYear()}</span>
                            )}
                          </div>
                        </div>
                        {director.age !== undefined ? (
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-bold text-slate-800">{director.age}</p>
                            <p className="text-xs text-slate-600">years</p>
                            {inRange && (
                              <span className="inline-block mt-1 bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                                Target age
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400">Unknown age</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <a
                href={`https://find-and-update.company-information.service.gov.uk/company/${company.companyNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm hover:underline"
              >
                🔗 View full details on Companies House →
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
