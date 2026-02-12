export interface LocationFilter {
  regions?: string[]        // England, Scotland, Wales, Northern Ireland
  localities?: string[]     // Counties/cities
  postcodeAreas?: string[]  // e.g., "M", "SW", "EH"
}

export interface SearchParams {
  minAge?: number
  maxAge?: number
  companyName?: string
  industryDivision?: string
  exactNameOnly?: boolean
  activeCompaniesOnly?: boolean
  includeNoRetirementMatches?: boolean
  minCompanyAge?: number
  maxCompanyAge?: number
  locationFilter?: LocationFilter
}

export interface Director {
  name: string
  dateOfBirth?: {
    month: number
    year: number
  }
  age?: number
  appointedOn?: string
  resignedOn?: string
  occupation?: string
  nationality?: string
}

export interface OpportunityScoreBreakdown {
  successionPressure: number
  leadershipConcentration: number
  businessMaturity: number
  leadershipTenure: number
  dataConfidence: number
}

export interface CompanyResult {
  companyNumber: string
  companyName: string
  companyStatus: string
  dateOfCreation?: string
  sicCodes?: string[]
  address?: {
    addressLine1?: string
    addressLine2?: string
    locality?: string
    region?: string
    postalCode?: string
    country?: string
  }
  directors: Director[]
  retiringSoonCount: number
  knownDirectorAges: number
  opportunityScore: number
  scoreBreakdown: OpportunityScoreBreakdown
}

export interface CompaniesHouseCompany {
  company_number: string
  company_name: string
  company_status: string
  date_of_creation?: string
  sic_codes?: string[]
  registered_office_address?: {
    address_line_1?: string
    address_line_2?: string
    locality?: string
    region?: string
    postal_code?: string
    country?: string
  }
}

export interface CompaniesHouseOfficer {
  name: string
  date_of_birth?: {
    month: number
    year: number
  }
  appointed_on?: string
  resigned_on?: string
  occupation?: string
  nationality?: string
  officer_role?: string
}

export interface IndustryMapping {
  division_code: string
  division_name: string
  includes: string[]
  keywords: string[]
}

export interface SearchResponseParams {
  minAge: number
  maxAge: number
  companyName: string
  industryDivision: string
  industryName: string
  exactNameOnly: boolean
  activeCompaniesOnly: boolean
  includeNoRetirementMatches: boolean
  minCompanyAge?: number
  maxCompanyAge?: number
}

export interface SearchResponse {
  results: CompanyResult[]
  count: number
  matchedCompaniesCount: number
  searchParams: SearchResponseParams
}

export interface ShortlistEntry {
  companyNumber: string
  companyName: string
  companyStatus: string
  addedAt: string
}
