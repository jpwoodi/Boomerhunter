import { describe, expect, it } from 'vitest'
import { calculateOpportunityScore } from '@/lib/utils/scoring'
import { CompaniesHouseCompany, Director } from '@/types'

describe('opportunity scoring', () => {
  const matureCompany: CompaniesHouseCompany = {
    company_number: '12345678',
    company_name: 'Test Engineering Limited',
    company_status: 'active',
    date_of_creation: '2000-01-01',
    sic_codes: ['71120'],
  }

  it('gives higher score to stronger succession opportunities', () => {
    const concentratedLeadership: Director[] = [
      { name: 'Director A', age: 71, appointedOn: '2005-01-01' },
    ]
    const diversifiedLeadership: Director[] = [
      { name: 'Director A', age: 52, appointedOn: '2020-01-01' },
      { name: 'Director B', age: 49, appointedOn: '2021-01-01' },
      { name: 'Director C', age: 47, appointedOn: '2022-01-01' },
      { name: 'Director D', age: 45, appointedOn: '2023-01-01' },
    ]

    const concentratedScore = calculateOpportunityScore({
      company: matureCompany,
      directors: concentratedLeadership,
      retiringSoonCount: 1,
    })
    const diversifiedScore = calculateOpportunityScore({
      company: matureCompany,
      directors: diversifiedLeadership,
      retiringSoonCount: 0,
    })

    expect(concentratedScore.total).toBeGreaterThan(diversifiedScore.total)
  })

  it('keeps score and factors inside expected ranges', () => {
    const score = calculateOpportunityScore({
      company: matureCompany,
      directors: [
        { name: 'Director A', age: 63, appointedOn: '2010-01-01' },
        { name: 'Director B', age: 61, appointedOn: '2012-01-01' },
      ],
      retiringSoonCount: 2,
    })

    expect(score.total).toBeGreaterThanOrEqual(0)
    expect(score.total).toBeLessThanOrEqual(100)
    expect(score.breakdown.successionPressure).toBeLessThanOrEqual(40)
    expect(score.breakdown.leadershipConcentration).toBeLessThanOrEqual(25)
    expect(score.breakdown.businessMaturity).toBeLessThanOrEqual(20)
    expect(score.breakdown.leadershipTenure).toBeLessThanOrEqual(10)
    expect(score.breakdown.dataConfidence).toBeLessThanOrEqual(5)
  })
})
