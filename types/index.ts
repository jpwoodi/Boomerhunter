export interface SearchParams {
  minAge?: number
  maxAge?: number
  sicCode?: string
  companyName?: string
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
