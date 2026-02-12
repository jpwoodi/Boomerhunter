/**
 * UK Location Reference Data
 *
 * For filtering companies by geographic location based on
 * registered_office_address data from Companies House.
 */

export interface UKRegion {
  name: string
  code: string
}

export interface PostcodeArea {
  code: string
  name: string
  region: string
}

/**
 * Main UK regions/countries
 */
export const UK_REGIONS: UKRegion[] = [
  { name: 'England', code: 'england' },
  { name: 'Scotland', code: 'scotland' },
  { name: 'Wales', code: 'wales' },
  { name: 'Northern Ireland', code: 'northern-ireland' },
]

/**
 * Major UK localities/counties
 * This is a curated list of major cities and counties
 */
export const UK_LOCALITIES: string[] = [
  // Major Cities
  'London',
  'Birmingham',
  'Manchester',
  'Glasgow',
  'Edinburgh',
  'Liverpool',
  'Leeds',
  'Bristol',
  'Sheffield',
  'Newcastle upon Tyne',
  'Cardiff',
  'Belfast',
  'Nottingham',
  'Leicester',
  'Southampton',
  'Brighton',
  'Cambridge',
  'Oxford',
  'Reading',
  'Milton Keynes',

  // English Counties
  'Greater London',
  'Greater Manchester',
  'West Midlands',
  'West Yorkshire',
  'South Yorkshire',
  'Merseyside',
  'Tyne and Wear',
  'Kent',
  'Essex',
  'Surrey',
  'Hampshire',
  'Hertfordshire',
  'Berkshire',
  'Buckinghamshire',
  'Oxfordshire',
  'Cambridgeshire',
  'Suffolk',
  'Norfolk',
  'Devon',
  'Cornwall',
  'Somerset',
  'Dorset',
  'Wiltshire',
  'Gloucestershire',
  'Worcestershire',
  'Warwickshire',
  'Leicestershire',
  'Northamptonshire',
  'Lincolnshire',
  'Nottinghamshire',
  'Derbyshire',
  'Staffordshire',
  'Shropshire',
  'Cheshire',
  'Lancashire',
  'Cumbria',
  'Durham',
  'Northumberland',

  // Welsh Counties
  'Cardiff',
  'Swansea',
  'Newport',
  'Wrexham',
  'Carmarthenshire',
  'Pembrokeshire',
  'Ceredigion',
  'Powys',
  'Gwynedd',
  'Anglesey',

  // Scottish Councils
  'City of Edinburgh',
  'Glasgow City',
  'Aberdeen City',
  'Dundee City',
  'Highland',
  'Aberdeenshire',
  'Fife',
  'South Lanarkshire',
  'North Lanarkshire',
  'Renfrewshire',
  'East Ayrshire',
  'Stirling',
  'Perth and Kinross',

  // Northern Ireland
  'Belfast',
  'Derry',
  'Lisburn',
  'Newry',
  'Armagh',
  'Antrim',
  'Down',
  'Tyrone',
  'Fermanagh',
].sort()

/**
 * UK Postcode Areas
 * Based on the first 1-2 letters of UK postcodes
 */
export const POSTCODE_AREAS: PostcodeArea[] = [
  // London
  { code: 'E', name: 'East London', region: 'London' },
  { code: 'EC', name: 'East Central London', region: 'London' },
  { code: 'N', name: 'North London', region: 'London' },
  { code: 'NW', name: 'North West London', region: 'London' },
  { code: 'SE', name: 'South East London', region: 'London' },
  { code: 'SW', name: 'South West London', region: 'London' },
  { code: 'W', name: 'West London', region: 'London' },
  { code: 'WC', name: 'West Central London', region: 'London' },

  // South East England
  { code: 'BR', name: 'Bromley', region: 'South East' },
  { code: 'CR', name: 'Croydon', region: 'South East' },
  { code: 'DA', name: 'Dartford', region: 'South East' },
  { code: 'GU', name: 'Guildford', region: 'South East' },
  { code: 'KT', name: 'Kingston upon Thames', region: 'South East' },
  { code: 'ME', name: 'Medway', region: 'South East' },
  { code: 'RH', name: 'Redhill', region: 'South East' },
  { code: 'SM', name: 'Sutton', region: 'South East' },
  { code: 'TN', name: 'Tonbridge', region: 'South East' },
  { code: 'TW', name: 'Twickenham', region: 'South East' },
  { code: 'BN', name: 'Brighton', region: 'South East' },
  { code: 'PO', name: 'Portsmouth', region: 'South East' },
  { code: 'SO', name: 'Southampton', region: 'South East' },
  { code: 'RG', name: 'Reading', region: 'South East' },
  { code: 'SL', name: 'Slough', region: 'South East' },
  { code: 'OX', name: 'Oxford', region: 'South East' },
  { code: 'HP', name: 'Hemel Hempstead', region: 'South East' },
  { code: 'MK', name: 'Milton Keynes', region: 'South East' },

  // South West England
  { code: 'BA', name: 'Bath', region: 'South West' },
  { code: 'BS', name: 'Bristol', region: 'South West' },
  { code: 'EX', name: 'Exeter', region: 'South West' },
  { code: 'GL', name: 'Gloucester', region: 'South West' },
  { code: 'PL', name: 'Plymouth', region: 'South West' },
  { code: 'SN', name: 'Swindon', region: 'South West' },
  { code: 'TA', name: 'Taunton', region: 'South West' },
  { code: 'TQ', name: 'Torquay', region: 'South West' },
  { code: 'TR', name: 'Truro', region: 'South West' },

  // East of England
  { code: 'AL', name: 'St Albans', region: 'East of England' },
  { code: 'CB', name: 'Cambridge', region: 'East of England' },
  { code: 'CM', name: 'Chelmsford', region: 'East of England' },
  { code: 'CO', name: 'Colchester', region: 'East of England' },
  { code: 'EN', name: 'Enfield', region: 'East of England' },
  { code: 'IG', name: 'Ilford', region: 'East of England' },
  { code: 'IP', name: 'Ipswich', region: 'East of England' },
  { code: 'LU', name: 'Luton', region: 'East of England' },
  { code: 'NR', name: 'Norwich', region: 'East of England' },
  { code: 'PE', name: 'Peterborough', region: 'East of England' },
  { code: 'RM', name: 'Romford', region: 'East of England' },
  { code: 'SG', name: 'Stevenage', region: 'East of England' },
  { code: 'SS', name: 'Southend-on-Sea', region: 'East of England' },
  { code: 'WD', name: 'Watford', region: 'East of England' },

  // East Midlands
  { code: 'DE', name: 'Derby', region: 'East Midlands' },
  { code: 'DN', name: 'Doncaster', region: 'East Midlands' },
  { code: 'LE', name: 'Leicester', region: 'East Midlands' },
  { code: 'LN', name: 'Lincoln', region: 'East Midlands' },
  { code: 'NG', name: 'Nottingham', region: 'East Midlands' },
  { code: 'NN', name: 'Northampton', region: 'East Midlands' },

  // West Midlands
  { code: 'B', name: 'Birmingham', region: 'West Midlands' },
  { code: 'CV', name: 'Coventry', region: 'West Midlands' },
  { code: 'DY', name: 'Dudley', region: 'West Midlands' },
  { code: 'HR', name: 'Hereford', region: 'West Midlands' },
  { code: 'ST', name: 'Stoke-on-Trent', region: 'West Midlands' },
  { code: 'TF', name: 'Telford', region: 'West Midlands' },
  { code: 'WR', name: 'Worcester', region: 'West Midlands' },
  { code: 'WS', name: 'Walsall', region: 'West Midlands' },
  { code: 'WV', name: 'Wolverhampton', region: 'West Midlands' },

  // North West England
  { code: 'BB', name: 'Blackburn', region: 'North West' },
  { code: 'BL', name: 'Bolton', region: 'North West' },
  { code: 'CA', name: 'Carlisle', region: 'North West' },
  { code: 'CH', name: 'Chester', region: 'North West' },
  { code: 'CW', name: 'Crewe', region: 'North West' },
  { code: 'FY', name: 'Blackpool', region: 'North West' },
  { code: 'L', name: 'Liverpool', region: 'North West' },
  { code: 'LA', name: 'Lancaster', region: 'North West' },
  { code: 'M', name: 'Manchester', region: 'North West' },
  { code: 'OL', name: 'Oldham', region: 'North West' },
  { code: 'PR', name: 'Preston', region: 'North West' },
  { code: 'SK', name: 'Stockport', region: 'North West' },
  { code: 'WA', name: 'Warrington', region: 'North West' },
  { code: 'WN', name: 'Wigan', region: 'North West' },

  // Yorkshire and the Humber
  { code: 'BD', name: 'Bradford', region: 'Yorkshire' },
  { code: 'HD', name: 'Huddersfield', region: 'Yorkshire' },
  { code: 'HG', name: 'Harrogate', region: 'Yorkshire' },
  { code: 'HU', name: 'Hull', region: 'Yorkshire' },
  { code: 'HX', name: 'Halifax', region: 'Yorkshire' },
  { code: 'LS', name: 'Leeds', region: 'Yorkshire' },
  { code: 'S', name: 'Sheffield', region: 'Yorkshire' },
  { code: 'WF', name: 'Wakefield', region: 'Yorkshire' },
  { code: 'YO', name: 'York', region: 'Yorkshire' },

  // North East England
  { code: 'DH', name: 'Durham', region: 'North East' },
  { code: 'DL', name: 'Darlington', region: 'North East' },
  { code: 'NE', name: 'Newcastle', region: 'North East' },
  { code: 'SR', name: 'Sunderland', region: 'North East' },
  { code: 'TS', name: 'Middlesbrough', region: 'North East' },

  // Scotland
  { code: 'AB', name: 'Aberdeen', region: 'Scotland' },
  { code: 'DD', name: 'Dundee', region: 'Scotland' },
  { code: 'DG', name: 'Dumfries', region: 'Scotland' },
  { code: 'EH', name: 'Edinburgh', region: 'Scotland' },
  { code: 'FK', name: 'Falkirk', region: 'Scotland' },
  { code: 'G', name: 'Glasgow', region: 'Scotland' },
  { code: 'HS', name: 'Outer Hebrides', region: 'Scotland' },
  { code: 'IV', name: 'Inverness', region: 'Scotland' },
  { code: 'KA', name: 'Kilmarnock', region: 'Scotland' },
  { code: 'KW', name: 'Kirkwall', region: 'Scotland' },
  { code: 'KY', name: 'Kirkcaldy', region: 'Scotland' },
  { code: 'ML', name: 'Motherwell', region: 'Scotland' },
  { code: 'PA', name: 'Paisley', region: 'Scotland' },
  { code: 'PH', name: 'Perth', region: 'Scotland' },
  { code: 'TD', name: 'Galashiels', region: 'Scotland' },
  { code: 'ZE', name: 'Lerwick', region: 'Scotland' },

  // Wales
  { code: 'CF', name: 'Cardiff', region: 'Wales' },
  { code: 'LL', name: 'Llandudno', region: 'Wales' },
  { code: 'LD', name: 'Llandrindod Wells', region: 'Wales' },
  { code: 'NP', name: 'Newport', region: 'Wales' },
  { code: 'SA', name: 'Swansea', region: 'Wales' },
  { code: 'SY', name: 'Shrewsbury', region: 'Wales' },

  // Northern Ireland
  { code: 'BT', name: 'Belfast', region: 'Northern Ireland' },
]

/**
 * Extract postcode area from a full postcode
 * E.g., "SW1A 1AA" -> "SW"
 */
export function extractPostcodeArea(postcode?: string): string | undefined {
  if (!postcode) {
    return undefined
  }

  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '')
  const match = cleaned.match(/^([A-Z]{1,2})/)
  return match ? match[1] : undefined
}

/**
 * Normalize location string for comparison
 */
export function normalizeLocation(location?: string): string {
  if (!location) {
    return ''
  }

  return location.trim().toLowerCase()
}
