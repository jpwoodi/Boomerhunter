import { IndustryMapping } from '@/types'

const DEFAULT_MIN_AGE = 60
const DEFAULT_MAX_AGE = 75
const MIN_ALLOWED_AGE = 40
const MAX_ALLOWED_AGE = 100

export interface AgeRange {
  minAge: number
  maxAge: number
}

function parseAgeValue(rawValue: string | null, fallback: number): number {
  if (!rawValue || rawValue.trim() === '') {
    return fallback
  }

  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed)) {
    throw new Error('Age filters must be valid numbers')
  }

  return Math.round(parsed)
}

export function parseAndValidateAgeRange(
  minAgeRaw: string | null,
  maxAgeRaw: string | null
): AgeRange {
  const minAge = parseAgeValue(minAgeRaw, DEFAULT_MIN_AGE)
  const maxAge = parseAgeValue(maxAgeRaw, DEFAULT_MAX_AGE)

  if (minAge < MIN_ALLOWED_AGE || maxAge > MAX_ALLOWED_AGE) {
    throw new Error(`Age filters must be between ${MIN_ALLOWED_AGE} and ${MAX_ALLOWED_AGE}`)
  }

  if (minAge > maxAge) {
    throw new Error('Minimum age cannot be greater than maximum age')
  }

  return { minAge, maxAge }
}

export function parseBooleanParam(value: string | null, defaultValue: boolean): boolean {
  if (value === null || value === '') {
    return defaultValue
  }
  return value.toLowerCase() !== 'false'
}

export function normalizeCompanyName(name?: string): string {
  if (!name) {
    return ''
  }

  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function matchesIndustrySic(companySicCodes: string[] | undefined, industryPrefixes: string[]): boolean {
  if (!companySicCodes || companySicCodes.length === 0 || industryPrefixes.length === 0) {
    return false
  }

  return companySicCodes.some(companySic =>
    industryPrefixes.some(prefix => companySic.startsWith(prefix))
  )
}

export function buildIndustryQueries(industry: IndustryMapping): string[] {
  const divisionTokens = industry.division_name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 4)

  const seedQueries = [
    industry.division_name.toLowerCase(),
    ...industry.keywords.map(keyword => keyword.toLowerCase()),
    ...divisionTokens,
  ]

  return Array.from(new Set(seedQueries)).filter(query => query.trim().length > 0)
}

export function calculateCompanyAge(dateOfCreation?: string): number | undefined {
  if (!dateOfCreation) {
    return undefined
  }

  const creationDate = new Date(dateOfCreation)
  const now = new Date()
  const ageInMilliseconds = now.getTime() - creationDate.getTime()
  const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25)

  return Math.floor(ageInYears)
}

export interface CompanyAgeRange {
  minCompanyAge?: number
  maxCompanyAge?: number
}

export function parseAndValidateCompanyAgeRange(
  minCompanyAgeRaw: string | null,
  maxCompanyAgeRaw: string | null
): CompanyAgeRange {
  const result: CompanyAgeRange = {}

  if (minCompanyAgeRaw && minCompanyAgeRaw.trim() !== '') {
    const minCompanyAge = Number(minCompanyAgeRaw)
    if (!Number.isFinite(minCompanyAge) || minCompanyAge < 0) {
      throw new Error('Minimum company age must be a non-negative number')
    }
    result.minCompanyAge = Math.round(minCompanyAge)
  }

  if (maxCompanyAgeRaw && maxCompanyAgeRaw.trim() !== '') {
    const maxCompanyAge = Number(maxCompanyAgeRaw)
    if (!Number.isFinite(maxCompanyAge) || maxCompanyAge < 0) {
      throw new Error('Maximum company age must be a non-negative number')
    }
    result.maxCompanyAge = Math.round(maxCompanyAge)
  }

  if (result.minCompanyAge !== undefined && result.maxCompanyAge !== undefined) {
    if (result.minCompanyAge > result.maxCompanyAge) {
      throw new Error('Minimum company age cannot be greater than maximum company age')
    }
  }

  return result
}

export function matchesCompanyAge(
  dateOfCreation: string | undefined,
  minCompanyAge?: number,
  maxCompanyAge?: number
): boolean {
  if (minCompanyAge === undefined && maxCompanyAge === undefined) {
    return true
  }

  const companyAge = calculateCompanyAge(dateOfCreation)
  if (companyAge === undefined) {
    return false
  }

  if (minCompanyAge !== undefined && companyAge < minCompanyAge) {
    return false
  }

  if (maxCompanyAge !== undefined && companyAge > maxCompanyAge) {
    return false
  }

  return true
}
