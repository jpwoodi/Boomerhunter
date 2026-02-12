import { NextRequest, NextResponse } from 'next/server'
import { CompaniesHouseService } from '@/lib/services/companiesHouse'
import { calculateAge, isRetirementAge } from '@/lib/utils/age'
import { CompanyResult, Director } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const minAge = parseInt(searchParams.get('minAge') || '60')
    const maxAge = parseInt(searchParams.get('maxAge') || '75')
    const sicCode = searchParams.get('sicCode') || ''
    const companyName = searchParams.get('companyName') || ''

    const apiKey = process.env.COMPANIES_HOUSE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Companies House API key not configured' },
        { status: 500 }
      )
    }

    const companiesHouse = new CompaniesHouseService(apiKey)

    // Search for companies
    const companies = await companiesHouse.advancedSearch({
      companyName,
      sicCode,
      itemsPerPage: 30,
    })

    // Process each company to get directors and filter by age
    const results: CompanyResult[] = []

    for (const company of companies) {
      try {
        // Fetch officers for this company
        const officers = await companiesHouse.getCompanyOfficers(company.company_number)

        // Filter for active directors only (not resigned)
        const activeOfficers = officers.filter(
          officer => !officer.resigned_on && officer.officer_role?.toLowerCase().includes('director')
        )

        if (activeOfficers.length === 0) {
          continue
        }

        // Calculate ages and create director objects
        const directors: Director[] = activeOfficers.map(officer => {
          const director: Director = {
            name: officer.name,
            dateOfBirth: officer.date_of_birth,
            appointedOn: officer.appointed_on,
            occupation: officer.occupation,
            nationality: officer.nationality,
          }

          // Calculate age if DOB is available
          if (officer.date_of_birth) {
            director.age = calculateAge(officer.date_of_birth)
          }

          return director
        })

        // Count directors in retirement age range
        const retiringSoonCount = directors.filter(
          director => director.age !== undefined && isRetirementAge(director.age, minAge, maxAge)
        ).length

        // Only include companies with at least one director in retirement age
        if (retiringSoonCount > 0) {
          results.push({
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
          })
        }

        // Prevent rate limiting - add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error processing company ${company.company_number}:`, error)
        // Continue with next company
      }
    }

    // Sort by number of retiring directors (descending)
    results.sort((a, b) => b.retiringSoonCount - a.retiringSoonCount)

    return NextResponse.json({
      results,
      count: results.length,
      searchParams: {
        minAge,
        maxAge,
        sicCode,
        companyName,
      },
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    )
  }
}
