import { CompaniesHouseCompany, Director, OpportunityScoreBreakdown } from '@/types'

interface ScoreInput {
  company: CompaniesHouseCompany
  directors: Director[]
  retiringSoonCount: number
}

interface ScoreOutput {
  total: number
  breakdown: OpportunityScoreBreakdown
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function yearsSince(dateString?: string): number {
  if (!dateString) {
    return 0
  }

  const parsedDate = new Date(dateString)
  if (Number.isNaN(parsedDate.getTime())) {
    return 0
  }

  const now = new Date()
  const years = now.getFullYear() - parsedDate.getFullYear()
  return clamp(years, 0, 200)
}

export function calculateOpportunityScore(input: ScoreInput): ScoreOutput {
  const { company, directors, retiringSoonCount } = input

  const knownAgeDirectors = directors.filter(director => director.age !== undefined)
  const knownAgeCount = knownAgeDirectors.length
  const directorCount = directors.length || 1

  const retiringRatio = knownAgeCount > 0 ? retiringSoonCount / knownAgeCount : 0
  const successionPressure = Math.round(clamp(retiringRatio * 40, 0, 40))

  const leadershipConcentration = directorCount <= 1
    ? 25
    : directorCount === 2
      ? 18
      : directorCount === 3
        ? 12
        : 7

  const companyAgeYears = yearsSince(company.date_of_creation)
  const businessMaturity = companyAgeYears >= 25
    ? 20
    : companyAgeYears >= 15
      ? 16
      : companyAgeYears >= 8
        ? 11
        : companyAgeYears >= 4
          ? 7
          : 3

  const averageTenureYears = directors.length > 0
    ? directors.reduce((sum, director) => sum + yearsSince(director.appointedOn), 0) / directors.length
    : 0
  const leadershipTenure = averageTenureYears >= 15
    ? 10
    : averageTenureYears >= 10
      ? 8
      : averageTenureYears >= 5
        ? 5
        : 2

  const dataConfidence = Math.round(clamp((knownAgeCount / directorCount) * 5, 0, 5))

  const breakdown: OpportunityScoreBreakdown = {
    successionPressure,
    leadershipConcentration,
    businessMaturity,
    leadershipTenure,
    dataConfidence,
  }

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0)

  return {
    total,
    breakdown,
  }
}
