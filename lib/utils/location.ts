import { LocationFilter } from '@/types'
import { extractPostcodeArea, normalizeLocation } from '@/lib/data/ukLocations'

export interface CompanyAddress {
  locality?: string
  region?: string
  postalCode?: string
  country?: string
}

/**
 * Check if a company's address matches the location filter criteria
 */
export function matchesLocationFilter(
  address: CompanyAddress | undefined,
  locationFilter?: LocationFilter
): boolean {
  // If no location filter specified, all companies match
  if (!locationFilter || Object.keys(locationFilter).length === 0) {
    return true
  }

  // If no address data, cannot match location filter
  if (!address) {
    return false
  }

  const {
    regions = [],
    localities = [],
    postcodeAreas = [],
  } = locationFilter

  // If no criteria specified, match all
  if (regions.length === 0 && localities.length === 0 && postcodeAreas.length === 0) {
    return true
  }

  let matchesRegion = regions.length === 0
  let matchesLocality = localities.length === 0
  let matchesPostcodeArea = postcodeAreas.length === 0

  // Check region match
  if (regions.length > 0 && address.region) {
    const normalizedRegion = normalizeLocation(address.region)
    matchesRegion = regions.some(region =>
      normalizedRegion.includes(normalizeLocation(region)) ||
      normalizeLocation(region).includes(normalizedRegion)
    )
  }

  // Check locality match
  if (localities.length > 0 && address.locality) {
    const normalizedLocality = normalizeLocation(address.locality)
    matchesLocality = localities.some(locality =>
      normalizedLocality.includes(normalizeLocation(locality)) ||
      normalizeLocation(locality).includes(normalizedLocality)
    )
  }

  // Check postcode area match
  if (postcodeAreas.length > 0 && address.postalCode) {
    const companyPostcodeArea = extractPostcodeArea(address.postalCode)
    if (companyPostcodeArea) {
      matchesPostcodeArea = postcodeAreas.some(area =>
        normalizeLocation(area) === normalizeLocation(companyPostcodeArea)
      )
    }
  }

  // Company must match at least one criterion from each specified filter type
  return matchesRegion && matchesLocality && matchesPostcodeArea
}

/**
 * Parse location filter from query parameters
 */
export function parseLocationFilter(searchParams: URLSearchParams): LocationFilter | undefined {
  const regions = searchParams.get('regions')
  const localities = searchParams.get('localities')
  const postcodeAreas = searchParams.get('postcodeAreas')

  if (!regions && !localities && !postcodeAreas) {
    return undefined
  }

  const filter: LocationFilter = {}

  if (regions) {
    filter.regions = regions.split(',').map(r => r.trim()).filter(Boolean)
  }

  if (localities) {
    filter.localities = localities.split(',').map(l => l.trim()).filter(Boolean)
  }

  if (postcodeAreas) {
    filter.postcodeAreas = postcodeAreas.split(',').map(p => p.trim().toUpperCase()).filter(Boolean)
  }

  return filter
}
