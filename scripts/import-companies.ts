#!/usr/bin/env tsx

/**
 * Import Companies House basic company data into PostgreSQL
 *
 * Usage:
 *   npm run import-companies -- <path-to-csv>
 *
 * Example:
 *   npm run import-companies -- data/bulk/BasicCompanyData-2024-01-01.csv
 *
 * This script imports ~5 million companies in batches of 1000.
 * Expected time: 30-60 minutes depending on hardware.
 */

import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { prisma } from '../lib/db'

const BATCH_SIZE = 1000
const PROGRESS_INTERVAL = 10000

interface CompanyRow {
  ' CompanyName': string
  'CompanyNumber': string
  'RegAddress.CareOf': string
  'RegAddress.POBox': string
  'RegAddress.AddressLine1': string
  'RegAddress.AddressLine2': string
  'RegAddress.PostTown': string
  'RegAddress.County': string
  'RegAddress.Country': string
  'RegAddress.PostCode': string
  'CompanyCategory': string
  'CompanyStatus': string
  'CountryOfOrigin': string
  'DissolutionDate': string
  'IncorporationDate': string
  'Accounts.AccountRefDay': string
  'Accounts.AccountRefMonth': string
  'Accounts.NextDueDate': string
  'Accounts.LastMadeUpDate': string
  'Accounts.AccountCategory': string
  'Returns.NextDueDate': string
  'Returns.LastMadeUpDate': string
  'Mortgages.NumMortCharges': string
  'Mortgages.NumMortOutstanding': string
  'Mortgages.NumMortPartSatisfied': string
  'Mortgages.NumMortSatisfied': string
  'SICCode.SicText_1': string
  'SICCode.SicText_2': string
  'SICCode.SicText_3': string
  'SICCode.SicText_4': string
  'LimitedPartnerships.NumGenPartners': string
  'LimitedPartnerships.NumLimPartners': string
  'URI': string
  'PreviousName_1.CONDATE': string
  'PreviousName_1.CompanyName': string
  // ... there are more fields but we only need these
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null

  try {
    // Companies House dates are in DD/MM/YYYY format
    const parts = dateStr.split('/')
    if (parts.length !== 3) return null

    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1 // JS months are 0-indexed
    const year = parseInt(parts[2])

    const date = new Date(year, month, day)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

function extractSicCode(sicText: string): string | null {
  if (!sicText || sicText.trim() === '') return null

  // SIC text format is typically: "12345 - Description"
  const match = sicText.match(/^(\d{5})/)
  return match ? match[1] : null
}

async function importCompanies(filePath: string) {
  console.log('🏢 Importing Companies House Company Data')
  console.log('=' .repeat(60))
  console.log(`\n📁 Reading from: ${filePath}\n`)

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  // Create data import record
  const importRecord = await prisma.dataImport.create({
    data: {
      importType: 'companies',
      fileName: path.basename(filePath),
      recordsImported: 0,
      startedAt: new Date(),
      status: 'in_progress'
    }
  })

  let batch: any[] = []
  let totalImported = 0
  let totalSkipped = 0
  const startTime = Date.now()

  async function processBatch() {
    if (batch.length === 0) return

    try {
      await prisma.company.createMany({
        data: batch,
        skipDuplicates: true
      })

      totalImported += batch.length

      if (totalImported % PROGRESS_INTERVAL === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
        const rate = (totalImported / parseInt(elapsed)).toFixed(0)
        console.log(`   ✓ Imported ${totalImported.toLocaleString()} companies (${rate}/sec)`)
      }

      batch = []
    } catch (error) {
      console.error('❌ Batch import failed:', error)
      totalSkipped += batch.length
      batch = []
    }
  }

  return new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
      .pipe(csv())

    stream.on('data', (row: CompanyRow) => {
      // Skip if essential fields are missing
      if (!row.CompanyNumber || !row[' CompanyName']) {
        totalSkipped++
        return
      }

      const company = {
        companyNumber: row.CompanyNumber.trim(),
        companyName: row[' CompanyName'].trim(),
        companyStatus: row.CompanyStatus || 'unknown',
        dateOfCreation: parseDate(row.IncorporationDate),

        sicCode1: extractSicCode(row['SICCode.SicText_1']),
        sicCode2: extractSicCode(row['SICCode.SicText_2']),
        sicCode3: extractSicCode(row['SICCode.SicText_3']),
        sicCode4: extractSicCode(row['SICCode.SicText_4']),

        addressLine1: row['RegAddress.AddressLine1'] || null,
        addressLine2: row['RegAddress.AddressLine2'] || null,
        locality: row['RegAddress.PostTown'] || null,
        region: row['RegAddress.County'] || null,
        postalCode: row['RegAddress.PostCode'] || null,
        country: row['RegAddress.Country'] || 'United Kingdom',
      }

      batch.push(company)

      if (batch.length >= BATCH_SIZE) {
        // Pause stream while processing batch
        stream.pause()
        processBatch().then(() => stream.resume())
      }
    })

    stream.on('end', async () => {
      // Process final batch
      await processBatch()

      // Update import record
      await prisma.dataImport.update({
        where: { id: importRecord.id },
        data: {
          recordsImported: totalImported,
          completedAt: new Date(),
          status: 'completed'
        }
      })

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
      const minutes = (parseInt(elapsed) / 60).toFixed(1)

      console.log('\n' + '=' .repeat(60))
      console.log('✅ Import Complete!')
      console.log(`   Total imported: ${totalImported.toLocaleString()} companies`)
      console.log(`   Total skipped:  ${totalSkipped.toLocaleString()} records`)
      console.log(`   Time elapsed:   ${minutes} minutes`)
      console.log(`   Average rate:   ${(totalImported / parseInt(elapsed)).toFixed(0)} records/sec`)
      console.log('\n📝 Next steps:')
      console.log('   Run: npm run import-officers')

      resolve()
    })

    stream.on('error', (error) => {
      console.error('❌ Stream error:', error)
      prisma.dataImport.update({
        where: { id: importRecord.id },
        data: {
          status: 'failed',
          errorMessage: error.message
        }
      }).finally(() => reject(error))
    })
  })
}

async function main() {
  const filePath = process.argv[2]

  if (!filePath) {
    console.error('❌ Usage: npm run import-companies -- <path-to-csv>')
    console.error('   Example: npm run import-companies -- data/bulk/BasicCompanyData-2024-01-01.csv')
    process.exit(1)
  }

  try {
    await importCompanies(filePath)
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Import failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
