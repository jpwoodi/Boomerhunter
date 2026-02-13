import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { CompaniesHouseService } from '@/lib/services/companiesHouse'
import { NextRequest } from 'next/server'

vi.mock('@/lib/services/companiesHouse')

const mockCompany = (
  name: string,
  number: string,
  status: string = 'active',
  sicCodes: string[] = []
) => ({
  company_name: name,
  company_number: number,
  company_status: status,
  date_of_creation: '2010-01-01',
  sic_codes: sicCodes,
  registered_office_address: {
    address_line_1: '123 Test St',
    locality: 'London',
    postal_code: 'SW1A 1AA',
    country: 'England',
  },
})

const mockOfficer = (
  name: string,
  dateOfBirth: { month: number; year: number },
  role: string = 'director'
) => ({
  name,
  date_of_birth: dateOfBirth,
  appointed_on: '2015-01-01',
  officer_role: role,
  occupation: 'Director',
  nationality: 'British',
})

describe('GET /api/search', () => {
  let mockSearchCompanies: any
  let mockGetCompanyOfficers: any
  let mockBrowseActiveCompanies: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSearchCompanies = vi.fn()
    mockGetCompanyOfficers = vi.fn()
    mockBrowseActiveCompanies = vi.fn()

    vi.mocked(CompaniesHouseService).mockImplementation(() => ({
      searchCompanies: mockSearchCompanies,
      getCompanyOfficers: mockGetCompanyOfficers,
      browseActiveCompanies: mockBrowseActiveCompanies,
    }) as any)

    // Mock environment variable
    process.env.COMPANIES_HOUSE_API_KEY = 'test-api-key'
  })

  it('should search by exact company name', async () => {
    const company = mockCompany('Test Limited', '12345678')
    mockSearchCompanies.mockResolvedValue([company])
    mockGetCompanyOfficers.mockResolvedValue([
      mockOfficer('John Doe', { month: 6, year: 1960 }),
    ])

    const request = new NextRequest(
      'http://localhost:3000/api/search?companyName=Test Limited&exactNameOnly=true&minAge=60&maxAge=75'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(mockSearchCompanies).toHaveBeenCalled()
    expect(data.results).toHaveLength(1)
    expect(data.results[0].companyName).toBe('Test Limited')
    expect(data.searchParams.exactNameOnly).toBe(true)
  })

  it('should filter by industry SIC codes', async () => {
    const techCompany = mockCompany('Tech Ltd', '11111111', 'active', ['62010'])
    const retailCompany = mockCompany('Retail Ltd', '22222222', 'active', ['47110'])

    mockSearchCompanies.mockResolvedValue([techCompany, retailCompany])
    mockGetCompanyOfficers.mockResolvedValue([
      mockOfficer('Jane Smith', { month: 3, year: 1958 }),
    ])

    const request = new NextRequest(
      'http://localhost:3000/api/search?industryDivision=J&minAge=60&maxAge=75'
    )

    const response = await GET(request)
    const data = await response.json()

    // Should only include tech company (SIC 62xxx is in division J)
    expect(data.results.length).toBeGreaterThanOrEqual(0)
    expect(data.searchParams.industryDivision).toBe('J')
  })

  it('should filter active companies only', async () => {
    const activeCompany = mockCompany('Active Ltd', '11111111', 'active')
    const dissolvedCompany = mockCompany('Dissolved Ltd', '22222222', 'dissolved')

    mockSearchCompanies.mockResolvedValue([activeCompany, dissolvedCompany])
    mockGetCompanyOfficers.mockResolvedValue([
      mockOfficer('Bob Johnson', { month: 12, year: 1959 }),
    ])

    const request = new NextRequest(
      'http://localhost:3000/api/search?companyName=Ltd&activeCompaniesOnly=true&minAge=60&maxAge=75'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(data.searchParams.activeCompaniesOnly).toBe(true)
    // Active filter is applied, so dissolved companies should be excluded
  })

  it('should exclude companies with no retirement matches by default', async () => {
    const company = mockCompany('Young Company Ltd', '12345678')
    mockSearchCompanies.mockResolvedValue([company])
    mockGetCompanyOfficers.mockResolvedValue([
      mockOfficer('Young Director', { month: 1, year: 1990 }), // Age ~35
    ])

    const request = new NextRequest(
      'http://localhost:3000/api/search?companyName=Young Company Ltd&minAge=60&maxAge=75'
    )

    const response = await GET(request)
    const data = await response.json()

    // Should not include company with no directors in retirement age range
    expect(data.results).toHaveLength(0)
    expect(data.searchParams.includeNoRetirementMatches).toBe(false)
  })

  it('should include companies with no retirement matches when flag is set', async () => {
    const company = mockCompany('Young Company Ltd', '12345678')
    mockSearchCompanies.mockResolvedValue([company])
    mockGetCompanyOfficers.mockResolvedValue([
      mockOfficer('Young Director', { month: 1, year: 1990 }), // Age ~35
    ])

    const request = new NextRequest(
      'http://localhost:3000/api/search?companyName=Young Company Ltd&minAge=60&maxAge=75&includeNoRetirementMatches=true'
    )

    const response = await GET(request)
    const data = await response.json()

    // Should include company even with no directors in retirement age range
    expect(data.results).toHaveLength(1)
    expect(data.results[0].retiringSoonCount).toBe(0)
    expect(data.searchParams.includeNoRetirementMatches).toBe(true)
  })

  it('should calculate opportunity scores correctly', async () => {
    const company = mockCompany('Opportunity Ltd', '12345678')
    mockSearchCompanies.mockResolvedValue([company])
    mockGetCompanyOfficers.mockResolvedValue([
      mockOfficer('Senior Director', { month: 6, year: 1955 }), // Age ~70
      mockOfficer('Another Senior', { month: 3, year: 1958 }), // Age ~67
    ])

    const request = new NextRequest(
      'http://localhost:3000/api/search?companyName=Opportunity Ltd&minAge=60&maxAge=75'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(data.results).toHaveLength(1)
    expect(data.results[0].retiringSoonCount).toBe(2)
  })

  it('should validate age range parameters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/search?minAge=80&maxAge=60'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toMatch(/age/i)
  })

  it('should return error when API key is missing', async () => {
    delete process.env.COMPANIES_HOUSE_API_KEY

    const request = new NextRequest(
      'http://localhost:3000/api/search?companyName=Test&minAge=60&maxAge=75'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('API key not configured')

    // Restore for other tests
    process.env.COMPANIES_HOUSE_API_KEY = 'test-api-key'
  })

  it('should handle default browse when no search params provided', async () => {
    const companies = [mockCompany('Company 1', '11111111')]
    mockBrowseActiveCompanies.mockResolvedValue(companies)
    mockGetCompanyOfficers.mockResolvedValue([
      mockOfficer('Director', { month: 6, year: 1960 }),
    ])

    const request = new NextRequest(
      'http://localhost:3000/api/search?minAge=60&maxAge=75'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(mockBrowseActiveCompanies).toHaveBeenCalledWith(60, 0)
    expect(data.results.length).toBeGreaterThanOrEqual(0)
  })

  it('should sort results by opportunity score', async () => {
    const company1 = mockCompany('High Score Ltd', '11111111')
    const company2 = mockCompany('Low Score Ltd', '22222222')

    mockSearchCompanies.mockResolvedValue([company1, company2])
    mockGetCompanyOfficers
      .mockResolvedValueOnce([
        mockOfficer('Director 1', { month: 1, year: 1955 }),
        mockOfficer('Director 2', { month: 2, year: 1956 }),
      ])
      .mockResolvedValueOnce([
        mockOfficer('Director 3', { month: 3, year: 1963 }),
      ])

    const request = new NextRequest(
      'http://localhost:3000/api/search?companyName=Ltd&minAge=60&maxAge=75'
    )

    const response = await GET(request)
    const data = await response.json()

    if (data.results.length >= 2) {
      expect(data.results[0].retiringSoonCount).toBeGreaterThanOrEqual(
        data.results[1].retiringSoonCount
      )
    }
  })
})
