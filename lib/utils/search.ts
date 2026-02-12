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
