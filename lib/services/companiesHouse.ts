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
  async searchCompanies(
    query: string,
    itemsPerPage: number = 20,
    startIndex: number = 0
  ): Promise<CompaniesHouseCompany[]> {
    try {
      const response = await this.client.get('/search/companies', {
        params: {
          q: query,
          items_per_page: itemsPerPage,
          start_index: startIndex,
        },
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error searching companies:', error)
      throw new Error('Failed to search companies')
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
   * Search for active companies (default browsing)
   * Uses "limited" as a common search term to find active companies
   */
  async browseActiveCompanies(itemsPerPage: number = 20, startIndex: number = 0): Promise<CompaniesHouseCompany[]> {
    return this.searchCompanies('limited', itemsPerPage, startIndex)
  }
}
