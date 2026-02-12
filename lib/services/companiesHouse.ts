import axios, { AxiosInstance } from 'axios'
import { CompaniesHouseCompany, CompaniesHouseOfficer } from '@/types'

const COMPANIES_HOUSE_API_BASE = 'https://api.company-information.service.gov.uk'

export class CompaniesHouseService {
  private client: AxiosInstance

  constructor(apiKey: string) {
    // Companies House API uses Basic Auth with the API key as username and empty password
    this.client = axios.create({
      baseURL: COMPANIES_HOUSE_API_BASE,
      auth: {
        username: apiKey,
        password: '',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Search for companies by name
   */
  async searchCompanies(query: string, itemsPerPage: number = 20): Promise<CompaniesHouseCompany[]> {
    try {
      const response = await this.client.get('/search/companies', {
        params: {
          q: query,
          items_per_page: itemsPerPage,
        },
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error searching companies:', error)
      throw new Error('Failed to search companies')
    }
  }

  /**
   * Get detailed company information
   */
  async getCompany(companyNumber: string): Promise<CompaniesHouseCompany> {
    try {
      const response = await this.client.get(`/company/${companyNumber}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching company ${companyNumber}:`, error)
      throw new Error('Failed to fetch company details')
    }
  }

  /**
   * Get company officers (directors)
   */
  async getCompanyOfficers(companyNumber: string): Promise<CompaniesHouseOfficer[]> {
    try {
      const response = await this.client.get(`/company/${companyNumber}/officers`)
      return response.data.items || []
    } catch (error) {
      console.error(`Error fetching officers for ${companyNumber}:`, error)
      throw new Error('Failed to fetch company officers')
    }
  }

  /**
   * Get companies by SIC code
   * Note: Companies House doesn't have a direct SIC code search endpoint
   * This is a workaround using advanced search
   */
  async searchCompaniesBySIC(sicCode: string, itemsPerPage: number = 20): Promise<CompaniesHouseCompany[]> {
    try {
      // This is a limitation of the free Companies House API
      // A more advanced search would require using their bulk download data
      // For now, we'll search for active companies and filter by SIC code
      const response = await this.client.get('/search/companies', {
        params: {
          q: '*', // Wildcard search
          items_per_page: itemsPerPage,
        },
      })

      const companies = response.data.items || []

      // Filter by SIC code
      if (sicCode) {
        return companies.filter((company: CompaniesHouseCompany) =>
          company.sic_codes?.some(code => code.startsWith(sicCode))
        )
      }

      return companies
    } catch (error) {
      console.error('Error searching companies by SIC:', error)
      throw new Error('Failed to search companies by SIC code')
    }
  }

  /**
   * Advanced search with multiple parameters
   */
  async advancedSearch(params: {
    companyName?: string
    sicCode?: string
    itemsPerPage?: number
  }): Promise<CompaniesHouseCompany[]> {
    const { companyName, sicCode, itemsPerPage = 20 } = params

    if (companyName) {
      return this.searchCompanies(companyName, itemsPerPage)
    } else if (sicCode) {
      return this.searchCompaniesBySIC(sicCode, itemsPerPage)
    } else {
      // Default search for active companies
      return this.searchCompanies('limited', itemsPerPage)
    }
  }
}
