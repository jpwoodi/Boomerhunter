import { NextRequest, NextResponse } from 'next/server'
import { CompaniesHouseService } from '@/lib/services/companiesHouse'
import { COMPANIES_HOUSE_INDUSTRIES } from '@/lib/data/industries'
import { mapWithConcurrency } from '@/lib/utils/async'
import { calculateOpportunityScore } from '@/lib/utils/scoring'
import { calculateAge, isRetirementAge } from '@/lib/utils/age'
import {
  buildIndustryQueries,
  matchesIndustrySic,
  normalizeCompanyName,
  parseAndValidateAgeRange,
  parseBooleanParam,
} from '@/lib/utils/search'
import { CompanyResult, CompaniesHouseCompany, Director } from '@/types'

export const dynamic = 'force-dynamic'

const EXACT_NAME_ITEMS_PER_PAGE = 100
const EXACT_NAME_MAX_PAGES = 8
const INDUSTRY_ITEMS_PER_PAGE = 100
const INDUSTRY_PAGES_PER_QUERY = 2
const INDUSTRY_MAX_QUERIES = 6
const MAX_CANDIDATE_COMPANIES = 120
const OFFICER_FETCH_CONCURRENCY = 4

async function fetchCompaniesByExactName(
  companiesHouse: CompaniesHouseService,
  companyName: string
): Promise<CompaniesHouseCompany[]> {
  const normalizedQuery = normalizeCompanyName(companyName)
  const matchesByNumber = new Map<string, CompaniesHouseCompany>()

  for (let page = 0; page < EXACT_NAME_MAX_PAGES; page++) {
    const companies = await companiesHouse.searchCompanies(
      companyName,
      EXACT_NAME_ITEMS_PER_PAGE,
      page * EXACT_NAME_ITEMS_PER_PAGE
    )

    if (companies.length === 0) {
      break
    }

    for (const company of companies) {
      if (
        normalizeCompanyName(company.company_name) !== '' &&
        normalizeCompanyName(company.company_name) === normalizedQuery
      ) {
        matchesByNumber.set(company.company_number, company)
      }
    }

    if (matchesByNumber.size > 0) {
      break
    }
  }

  return Array.from(matchesByNumber.values())
}

async function fetchIndustryCandidates(
  companiesHouse: CompaniesHouseService,
  industryDivision: string
): Promise<CompaniesHouseCompany[]> {
  const selectedIndustry = COMPANIES_HOUSE_INDUSTRIES.find(
    industry => industry.division_code === industryDivision
  )

  if (!selectedIndustry) {
    return []
  }

  const queries = buildIndustryQueries(selectedIndustry).slice(0, INDUSTRY_MAX_QUERIES)
  const candidatesByNumber = new Map<string, CompaniesHouseCompany>()

  for (const query of queries) {
    for (let page = 0; page < INDUSTRY_PAGES_PER_QUERY; page++) {
      const candidates = await companiesHouse.searchCompanies(
        query,
        INDUSTRY_ITEMS_PER_PAGE,
        page * INDUSTRY_ITEMS_PER_PAGE
      )

      if (candidates.length === 0) {
        break
      }

      for (const company of candidates) {
        candidatesByNumber.set(company.company_number, company)
      }

      if (candidates.length < INDUSTRY_ITEMS_PER_PAGE) {
        break
      }
    }
  }

  return Array.from(candidatesByNumber.values())
}

function isValidationErrorMessage(message: string): boolean {
  const normalized = message.toLowerCase()
  return normalized.includes('age') || normalized.includes('minimum')
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()

  try {
    const searchParams = request.nextUrl.searchParams
    const { minAge, maxAge } = parseAndValidateAgeRange(
      searchParams.get('minAge'),
      searchParams.get('maxAge')
    )
    const companyName = searchParams.get('companyName') || ''
    const industryDivision = searchParams.get('industryDivision') || ''
    const exactNameOnly = parseBooleanParam(searchParams.get('exactNameOnly'), true)
    const activeCompaniesOnly = parseBooleanParam(searchParams.get('activeCompaniesOnly'), true)
    const includeNoRetirementMatches = parseBooleanParam(
      searchParams.get('includeNoRetirementMatches'),
      false
    )

    const apiKey = process.env.COMPANIES_HOUSE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Companies House API key not configured' },
        { status: 500 }
      )
    }

    const companiesHouse = new CompaniesHouseService(apiKey)
    const selectedIndustry = COMPANIES_HOUSE_INDUSTRIES.find(
      industry => industry.division_code === industryDivision
    )

    let matchedCompanies: CompaniesHouseCompany[]

    if (companyName && exactNameOnly) {
      matchedCompanies = await fetchCompaniesByExactName(companiesHouse, companyName)
    } else if (companyName) {
      matchedCompanies = await companiesHouse.searchCompanies(companyName, 100, 0)
    } else if (industryDivision) {
      matchedCompanies = await fetchIndustryCandidates(companiesHouse, industryDivision)
    } else {
      matchedCompanies = await companiesHouse.advancedSearch({
        itemsPerPage: 60,
      })
    }

    if (selectedIndustry) {
      matchedCompanies = matchedCompanies.filter(company =>
        matchesIndustrySic(company.sic_codes, selectedIndustry.includes)
      )
    }

    if (activeCompaniesOnly) {
      matchedCompanies = matchedCompanies.filter(
        company => (company.company_status || '').toLowerCase() === 'active'
      )
    }

    const matchedCompaniesCount = matchedCompanies.length
    const companiesToProcess = matchedCompanies.slice(0, MAX_CANDIDATE_COMPANIES)
    const wasCandidateSetTruncated = matchedCompaniesCount > companiesToProcess.length

    const rawResults = await mapWithConcurrency(
      companiesToProcess,
      OFFICER_FETCH_CONCURRENCY,
      async (company): Promise<CompanyResult | null> => {
        try {
          const officers = await companiesHouse.getCompanyOfficers(company.company_number)
          const activeDirectors = officers.filter(
            officer => !officer.resigned_on && officer.officer_role?.toLowerCase().includes('director')
          )

          if (activeDirectors.length === 0) {
            return null
          }

          const directors: Director[] = activeDirectors.map(officer => {
            const director: Director = {
              name: officer.name,
              dateOfBirth: officer.date_of_birth,
              appointedOn: officer.appointed_on,
              occupation: officer.occupation,
              nationality: officer.nationality,
            }

            if (officer.date_of_birth) {
              director.age = calculateAge(officer.date_of_birth)
            }

            return director
          })

          const knownDirectorAges = directors.filter(director => director.age !== undefined).length
          const retiringSoonCount = directors.filter(
            director => director.age !== undefined && isRetirementAge(director.age, minAge, maxAge)
          ).length

          if (!includeNoRetirementMatches && retiringSoonCount === 0) {
            return null
          }

          const score = calculateOpportunityScore({
            company,
            directors,
            retiringSoonCount,
          })

          return {
            companyNumber: company.company_number,
            companyName: company.company_name,
            companyStatus: company.company_status,
            dateOfCreation: company.date_of_creation,
            sicCodes: company.sic_codes,
            address: company.registered_office_address ? {
              addressLine1: company.registered_office_address.address_line_1,
              addressLine2: company.registered_office_address.address_line_2,
              locality: company.registered_office_address.locality,
              region: company.registered_office_address.region,
              postalCode: company.registered_office_address.postal_code,
              country: company.registered_office_address.country,
            } : undefined,
            directors,
            retiringSoonCount,
            knownDirectorAges,
            opportunityScore: score.total,
            scoreBreakdown: score.breakdown,
          }
        } catch (error) {
          console.error(`Error processing company ${company.company_number}:`, error)
          return null
        }
      }
    )

    const results = rawResults.filter((result): result is CompanyResult => result !== null)
    results.sort((a, b) =>
      b.opportunityScore - a.opportunityScore ||
      b.retiringSoonCount - a.retiringSoonCount ||
      b.directors.length - a.directors.length
    )

    return NextResponse.json({
      results,
      count: results.length,
      matchedCompaniesCount,
      processedCompaniesCount: companiesToProcess.length,
      wasCandidateSetTruncated,
      elapsedMs: Date.now() - startedAt,
      searchParams: {
        minAge,
        maxAge,
        companyName,
        industryDivision,
        industryName: selectedIndustry?.division_name || '',
        exactNameOnly,
        activeCompaniesOnly,
        includeNoRetirementMatches,
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    const message = error instanceof Error ? error.message : 'Search failed'
    const statusCode = isValidationErrorMessage(message) ? 400 : 500

    return NextResponse.json(
      { error: message },
      { status: statusCode }
    )
  }
}
