'use client'

import { CompanyResult } from '@/types'

interface CompanyResultsProps {
  results: CompanyResult[]
  isLoading: boolean
}

export default function CompanyResults({ results, isLoading }: CompanyResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-slate-600">Searching for companies...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-slate-600 text-lg">
          No results yet. Use the filters above to start your search.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-2xl font-semibold text-slate-800">
          Found {results.length} {results.length === 1 ? 'Company' : 'Companies'}
        </h2>
      </div>

      {results.map((company) => (
        <div
          key={company.companyNumber}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-800">
                {company.companyName}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Company No: {company.companyNumber} | Status: {company.companyStatus}
              </p>
            </div>
            <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold">
              {company.retiringSoonCount} retiring soon
            </div>
          </div>

          {company.sicCodes && company.sicCodes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-1">Industry (SIC Codes):</p>
              <div className="flex flex-wrap gap-2">
                {company.sicCodes.map((code, index) => (
                  <span
                    key={index}
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
              Directors ({company.directors.length})
            </h4>
            <div className="space-y-3">
              {company.directors.map((director, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    director.age && director.age >= 60 && director.age <= 75
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
                        {director.age >= 60 && director.age <= 75 && (
                          <span className="inline-block mt-1 bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                            Retirement age
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
              View on Companies House →
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
