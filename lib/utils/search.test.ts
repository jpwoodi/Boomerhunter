import { describe, expect, it } from 'vitest'
import {
  buildIndustryQueries,
  matchesIndustrySic,
  normalizeCompanyName,
  parseAndValidateAgeRange,
} from '@/lib/utils/search'
import { IndustryMapping } from '@/types'

describe('search utils', () => {
  it('normalizes company names for exact matching', () => {
    expect(normalizeCompanyName('  PSJT-Ltd.  ')).toBe('PSJT LTD')
  })

  it('parses default age range when values are missing', () => {
    expect(parseAndValidateAgeRange(null, null)).toEqual({ minAge: 60, maxAge: 75 })
  })

  it('throws on invalid age range', () => {
    expect(() => parseAndValidateAgeRange('80', '60')).toThrow(
      'Minimum age cannot be greater than maximum age'
    )
  })

  it('matches SIC prefixes against company SICs', () => {
    expect(matchesIndustrySic(['62012', '70229'], ['6201'])).toBe(true)
    expect(matchesIndustrySic(['70229'], ['6201'])).toBe(false)
  })

  it('builds deduplicated industry query list', () => {
    const industry: IndustryMapping = {
      division_code: '58-63',
      division_name: 'Information and Communication',
      includes: ['6201'],
      keywords: ['software', 'data', 'software'],
    }

    const queries = buildIndustryQueries(industry)
    expect(queries).toContain('information and communication')
    expect(queries).toContain('software')
    expect(new Set(queries).size).toBe(queries.length)
  })
})
