import { IndustryMapping } from '@/types'

export const COMPANIES_HOUSE_INDUSTRIES: IndustryMapping[] = [
  {
    division_code: '01',
    division_name: 'Agriculture',
    includes: ['0111', '0112', '0121', '0141', '0161'],
    keywords: ['farming', 'agriculture', 'livestock', 'crops'],
  },
  {
    division_code: '03',
    division_name: 'Fishing and Aquaculture',
    includes: ['0311', '0321'],
    keywords: ['fishing', 'aquaculture'],
  },
  {
    division_code: '05-09',
    division_name: 'Mining and Quarrying',
    includes: ['0510', '0610', '0620', '0710', '0811', '0899'],
    keywords: ['mining', 'oil', 'gas', 'quarry'],
  },
  {
    division_code: '10-33',
    division_name: 'Manufacturing',
    includes: ['1011', '1101', '1310', '1623', '1812', '2011', '2110', '2120', '2229', '2511', '2611', '2651', '2712', '2910', '3099', '3109', '3299'],
    keywords: ['manufacturing', 'factory', 'production'],
  },
  {
    division_code: '35',
    division_name: 'Electricity and Energy',
    includes: ['3511', '3512', '3513', '3514'],
    keywords: ['energy', 'renewables', 'solar', 'wind', 'battery'],
  },
  {
    division_code: '36-39',
    division_name: 'Water and Waste',
    includes: ['3600', '3700', '3811', '3821', '3900'],
    keywords: ['waste', 'recycling', 'water', 'environment'],
  },
  {
    division_code: '41-43',
    division_name: 'Construction',
    includes: ['4110', '4120', '4211', '4299', '4321', '4399'],
    keywords: ['construction', 'building', 'engineering'],
  },
  {
    division_code: '45-47',
    division_name: 'Retail and Wholesale',
    includes: ['4511', '4619', '4690', '4711', '4791'],
    keywords: ['retail', 'wholesale', 'ecommerce', 'store'],
  },
  {
    division_code: '49-53',
    division_name: 'Transport and Logistics',
    includes: ['4941', '5020', '5110', '5210', '5229', '5310'],
    keywords: ['transport', 'logistics', 'freight', 'delivery'],
  },
  {
    division_code: '55-56',
    division_name: 'Hospitality',
    includes: ['5510', '5520', '5610', '5630'],
    keywords: ['hotel', 'restaurant', 'catering', 'pub'],
  },
  {
    division_code: '58-63',
    division_name: 'Information and Communication',
    includes: ['5811', '5911', '6110', '6190', '6201', '6202', '6203', '6209', '6311', '6312'],
    keywords: ['software', 'saas', 'it', 'tech', 'telecoms', 'data'],
  },
  {
    division_code: '64-66',
    division_name: 'Financial Services',
    includes: ['6419', '6420', '6492', '6499', '6512', '6619'],
    keywords: ['banking', 'fintech', 'insurance', 'credit', 'fund'],
  },
  {
    division_code: '68',
    division_name: 'Real Estate',
    includes: ['6810', '6820', '6831'],
    keywords: ['property', 'real estate', 'letting'],
  },
  {
    division_code: '69-75',
    division_name: 'Professional and Scientific',
    includes: ['6910', '6920', '7010', '7022', '7112', '7211', '7311', '7410', '7490'],
    keywords: ['consulting', 'legal', 'accounting', 'r&d', 'engineering'],
  },
  {
    division_code: '77-82',
    division_name: 'Administrative and Support',
    includes: ['7810', '7820', '8110', '8211', '8299'],
    keywords: ['recruitment', 'outsourcing', 'admin', 'facilities'],
  },
  {
    division_code: '85',
    division_name: 'Education',
    includes: ['8510', '8520', '8532', '8559'],
    keywords: ['education', 'training', 'school'],
  },
  {
    division_code: '86-88',
    division_name: 'Health and Social Care',
    includes: ['8610', '8621', '8623', '8690', '8710', '8730', '8810'],
    keywords: ['healthcare', 'medical', 'dental', 'care'],
  },
  {
    division_code: '90-96',
    division_name: 'Arts and Other Services',
    includes: ['9001', '9312', '9602', '9609'],
    keywords: ['sports', 'creative', 'personal services'],
  },
]
