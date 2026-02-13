import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateAge, isRetirementAge } from '@/lib/utils/age'
import { parseAndValidateAgeRange, parseBooleanParam, parseAndValidateCompanyAgeRange } from '@/lib/utils/search'
import { parseLocationFilter } from '@/lib/utils/location'
import { extractPostcodeArea } from '@/lib/data/ukLocations'
import { CompanyResult, Director } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for large queries

/**
 * Bulk Search API - queries local database
 *
 * Much faster than API-based search, can handle entire industries
 * Searches 5M+ companies in seconds
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now()

  try {
    const searchParams = request.nextUrl.searchParams

    // Parse all search parameters
    const { minAge, maxAge } = parseAndValidateAgeRange(
      searchParams.get('minAge'),
      searchParams.get('maxAge')
    )
    const { minCompanyAge, maxCompanyAge } = parseAndValidateCompanyAgeRange(
      searchParams.get('minCompanyAge'),
      searchParams.get('maxCompanyAge')
    )
    const locationFilter = parseLocationFilter(searchParams)
    const companyName = searchParams.get('companyName') || ''
    const industryDivision = searchParams.get('industryDivision') || ''
    const activeCompaniesOnly = parseBooleanParam(searchParams.get('activeCompaniesOnly'), true)
    const includeNoRetirementMatches = parseBooleanParam(
      searchParams.get('includeNoRetirementMatches'),
      false
    )
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 5000)

    // Calculate birth year range from age range
    const currentYear = new Date().getFullYear()
    const maxBirthYear = currentYear - minAge
    const minBirthYear = currentYear - maxAge

    // Build where clause for companies
    const companyWhere: any = {}

    if (activeCompaniesOnly) {
      companyWhere.companyStatus = 'active'
    }

    if (companyName) {
      companyWhere.companyName = {
        contains: companyName,
        mode: 'insensitive'
      }
    }

    if (industryDivision) {
      // Match any of the 4 SIC code fields
      companyWhere.OR = [
        { sicCode1: { startsWith: industryDivision } },
        { sicCode2: { startsWith: industryDivision } },
        { sicCode3: { startsWith: industryDivision } },
        { sicCode4: { startsWith: industryDivision } },
      ]
    }

    // Company age filter
    if (minCompanyAge !== undefined || maxCompanyAge !== undefined) {
      const now = new Date()
      if (maxCompanyAge !== undefined) {
        const minDate = new Date(now.getFullYear() - maxCompanyAge, now.getMonth(), now.getDate())
        companyWhere.dateOfCreation = { gte: minDate }
      }
      if (minCompanyAge !== undefined) {
        const maxDate = new Date(now.getFullYear() - minCompanyAge, now.getMonth(), now.getDate())
        if (companyWhere.dateOfCreation) {
          companyWhere.dateOfCreation.lte = maxDate
        } else {
          companyWhere.dateOfCreation = { lte: maxDate }
        }
      }
    }

    // Location filters
    if (locationFilter) {
      if (locationFilter.regions && locationFilter.regions.length > 0) {
        companyWhere.region = {
          in: locationFilter.regions,
          mode: 'insensitive'
        }
      }
      if (locationFilter.localities && locationFilter.localities.length > 0) {
        companyWhere.locality = {
          in: locationFilter.localities,
          mode: 'insensitive'
        }
      }
      if (locationFilter.postcodeAreas && locationFilter.postcodeAreas.length > 0) {
        // For postcode areas, we need to do a prefix match
        companyWhere.postalCode = {
          startsWith: {
            in: locationFilter.postcodeAreas
          }
        }
      }
    }

    // Execute query with aggregations
    const companies = await prisma.company.findMany({
      where: companyWhere,
      include: {
        officers: {
          where: {
            resignedOn: null, // Only active officers
          }
        }
      },
      take: limit * 2, // Fetch extra since we'll filter after
    })

    // Process results to calculate retirement metrics
    const results: CompanyResult[] = []

    for (const company of companies) {
      const directors: Director[] = company.officers.map((officer: (typeof company.officers)[number]) => {
        const director: Director = {
          name: officer.name,
          dateOfBirth: officer.dateOfBirthYear && officer.dateOfBirthMonth
            ? {
                year: officer.dateOfBirthYear,
                month: officer.dateOfBirthMonth
              }
            : undefined,
          appointedOn: officer.appointedOn?.toISOString().split('T')[0],
          resignedOn: officer.resignedOn?.toISOString().split('T')[0],
          occupation: officer.occupation || undefined,
          nationality: officer.nationality || undefined,
        }

        if (director.dateOfBirth) {
          director.age = calculateAge(director.dateOfBirth)
        }

        return director
      })

      const knownDirectorAges = directors.filter(d => d.age !== undefined).length
      const retiringSoonCount = directors.filter(
        d => d.age !== undefined && isRetirementAge(d.age, minAge, maxAge)
      ).length

      // Skip if no retirement matches (unless explicitly included)
      if (!includeNoRetirementMatches && retiringSoonCount === 0) {
        continue
      }

      results.push({
        companyNumber: company.companyNumber,
        companyName: company.companyName,
        companyStatus: company.companyStatus,
        dateOfCreation: company.dateOfCreation?.toISOString().split('T')[0],
        sicCodes: [
          company.sicCode1,
          company.sicCode2,
          company.sicCode3,
          company.sicCode4,
        ].filter((code): code is string => code !== null),
        address: {
          addressLine1: company.addressLine1 || undefined,
          addressLine2: company.addressLine2 || undefined,
          locality: company.locality || undefined,
          region: company.region || undefined,
          postalCode: company.postalCode || undefined,
          country: company.country || undefined,
        },
        directors,
        retiringSoonCount,
        knownDirectorAges,
      })

      // Stop if we've reached the limit
      if (results.length >= limit) {
        break
      }
    }

    // Sort by retiring director count, then by total directors
    results.sort((a, b) =>
      b.retiringSoonCount - a.retiringSoonCount ||
      b.directors.length - a.directors.length
    )

    const elapsedMs = Date.now() - startedAt

    return NextResponse.json({
      results,
      count: results.length,
      matchedCompaniesCount: companies.length,
      elapsedMs,
      searchParams: {
        minAge,
        maxAge,
        companyName,
        industryDivision,
        industryName: '', // TODO: lookup from COMPANIES_HOUSE_INDUSTRIES
        exactNameOnly: false,
        activeCompaniesOnly,
        includeNoRetirementMatches,
        minCompanyAge,
        maxCompanyAge,
      },
      dataSource: 'bulk', // Indicator that this came from bulk database
    })

  } catch (error) {
    console.error('Bulk search error:', error)
    const message = error instanceof Error ? error.message : 'Search failed'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
