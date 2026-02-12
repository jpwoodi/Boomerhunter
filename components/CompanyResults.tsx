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
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-slate-600">Searching for opportunities...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-3">
        {hasSearched ? (
          <>
            <p className="text-slate-700 text-base font-medium">{formatSearchContext(searchMeta)}</p>
            <p className="text-slate-600 text-lg">
              {matchedCompaniesCount === 0
                ? 'No companies matched your company/industry filters.'
                : `Matched ${matchedCompaniesCount} companies, but none had directors in the selected age range.`}
            </p>
            {wasCandidateSetTruncated && (
              <p className="text-sm text-amber-700">
                Processed the first {processedCompaniesCount} matches. Narrow filters for deeper coverage.
              </p>
            )}
          </>
        ) : (
          <p className="text-slate-600 text-lg">
            No results yet. Use the filters above to start your search.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4 space-y-2">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-800">
            Found {results.length} {results.length === 1 ? 'Opportunity' : 'Opportunities'}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onExportResults}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Export Results CSV
            </button>
            <button
              type="button"
              onClick={onExportShortlist}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Export Shortlist ({shortlistCount})
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-600">{formatSearchContext(searchMeta)}</p>
        {wasCandidateSetTruncated && (
          <p className="text-sm text-amber-700">
            Processed {processedCompaniesCount} of {matchedCompaniesCount} matched companies. Narrow filters for full depth.
          </p>
        )}
      </div>

      {results.map((company) => {
        const isShortlisted = shortlistedCompanyNumbers.has(company.companyNumber)
        return (
          <div
            key={company.companyNumber}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-slate-800">
                  {company.companyName}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Company No: {company.companyNumber} | Status: {company.companyStatus}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-semibold">
                  Score {company.opportunityScore}/100
                </div>
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold">
                  {company.retiringSoonCount} retiring soon
                </div>
                <button
                  type="button"
                  onClick={() => onToggleShortlist(company)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    isShortlisted
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-md bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
              <p>
                Score breakdown: Succession {company.scoreBreakdown.successionPressure} | Key person {company.scoreBreakdown.leadershipConcentration} | Maturity {company.scoreBreakdown.businessMaturity} | Tenure {company.scoreBreakdown.leadershipTenure} | Confidence {company.scoreBreakdown.dataConfidence}
              </p>
            </div>

            {company.sicCodes && company.sicCodes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-1">Industry (SIC Codes):</p>
                <div className="flex flex-wrap gap-2">
                  {company.sicCodes.map((code) => (
                    <span
                      key={code}
                      className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {company.address && (
              <div className="mb-4 text-sm text-slate-600">
                <p className="font-medium text-slate-700">Address:</p>
                <p>
                  {[
                    company.address.addressLine1,
                    company.address.addressLine2,
                    company.address.locality,
                    company.address.region,
                    company.address.postalCode,
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-lg font-semibold text-slate-800 mb-3">
                Directors ({company.directors.length}, known ages: {company.knownDirectorAges})
              </h4>
              <div className="space-y-3">
                {company.directors.map((director, index) => (
                  <div
                    key={`${company.companyNumber}-${index}`}
                    className={`p-4 rounded-lg ${
                      director.age !== undefined &&
                      director.age >= searchMeta.minAge &&
                      director.age <= searchMeta.maxAge
                        ? 'bg-orange-50 border border-orange-200'
                        : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-800">{director.name}</p>
                        {director.occupation && (
                          <p className="text-sm text-slate-600">{director.occupation}</p>
                        )}
                        {director.nationality && (
                          <p className="text-sm text-slate-600">
                            Nationality: {director.nationality}
                          </p>
                        )}
                        {director.appointedOn && (
                          <p className="text-sm text-slate-600">
                            Appointed: {new Date(director.appointedOn).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {director.age !== undefined ? (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-800">{director.age}</p>
                          <p className="text-sm text-slate-600">years old</p>
                          {director.age >= searchMeta.minAge && director.age <= searchMeta.maxAge && (
                            <span className="inline-block mt-1 bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                              In selected range
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">Age unknown</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <a
                href={`https://find-and-update.company-information.service.gov.uk/company/${company.companyNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View on Companies House
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
