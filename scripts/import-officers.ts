#!/usr/bin/env tsx

/**
 * Import Companies House officers data into PostgreSQL
 *
 * Usage:
 *   npm run import-officers -- <path-to-csv>
 *
 * Example:
 *   npm run import-officers -- data/bulk/Officers-2024-01-01.csv
 *
 * This script imports ~10+ million officers in batches.
 * Expected time: 2-4 hours depending on hardware.
 *
 * Note: Only imports directors (filters out other officer roles)
 */

import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { prisma } from '../lib/db'

const BATCH_SIZE = 1000
const PROGRESS_INTERVAL = 50000

interface OfficerRow {
  'CompanyNumber': string
  'CompanyName': string
  'Forenames': string
  'Surname': string
  'DateOfBirth': string
  'AppointmentDate': string
  'ResignationDate': string
  'Nationality': string
  'Occupation': string
  'Role': string
  'Address': string
  // ... more fields exist
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null

  try {
    // Officers dates are typically DD/MM/YYYY
    const parts = dateStr.split('/')
    if (parts.length !== 3) return null

    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2])

    const date = new Date(year, month, day)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

function parseDateOfBirth(dobStr: string): { year: number | null, month: number | null } {
  if (!dobStr || dobStr.trim() === '') {
    return { year: null, month: null }
  }

  try {
    // DOB is typically in format "MM/YYYY" or "YYYY-MM"
    if (dobStr.includes('/')) {
      const parts = dobStr.split('/')
      if (parts.length === 2) {
        return {
          month: parseInt(parts[0]),
          year: parseInt(parts[1])
        }
      }
    } else if (dobStr.includes('-')) {
      const parts = dobStr.split('-')
      if (parts.length === 2) {
        return {
          year: parseInt(parts[0]),
          month: parseInt(parts[1])
        }
      }
    }
  } catch {
    // Fall through
  }

  return { year: null, month: null }
}

function isDirectorRole(role: string): boolean {
  if (!role) return false
  const r = role.toLowerCase()
  return r.includes('director') || r.includes('secretary')
}

async function importOfficers(filePath: string) {
  console.log('👔 Importing Companies House Officers Data')
  console.log('=' .repeat(60))
  console.log(`\n📁 Reading from: ${filePath}\n`)

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  // Create data import record
  const importRecord = await prisma.dataImport.create({
    data: {
      importType: 'officers',
      fileName: path.basename(filePath),
      recordsImported: 0,
      startedAt: new Date(),
      status: 'in_progress'
    }
  })

  let batch: any[] = []
  let totalImported = 0
  let totalSkipped = 0
  let totalNonDirectors = 0
  const startTime = Date.now()

  async function processBatch() {
    if (batch.length === 0) return

    try {
      await prisma.officer.createMany({
        data: batch,
        skipDuplicates: false
      })

      totalImported += batch.length

      if (totalImported % PROGRESS_INTERVAL === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
        const rate = (totalImported / parseInt(elapsed)).toFixed(0)
        console.log(`   ✓ Imported ${totalImported.toLocaleString()} officers (${rate}/sec)`)
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

    stream.on('data', (row: OfficerRow) => {
      // Skip if essential fields are missing
      if (!row.CompanyNumber || !row.Surname) {
        totalSkipped++
        return
      }

      // Only import directors and secretaries
      if (!isDirectorRole(row.Role)) {
        totalNonDirectors++
        return
      }

      const dob = parseDateOfBirth(row.DateOfBirth)
      const name = [row.Forenames, row.Surname].filter(Boolean).join(' ').trim()

      const officer = {
        companyNumber: row.CompanyNumber.trim(),
        name,
        officerRole: row.Role || null,
        appointedOn: parseDate(row.AppointmentDate),
        resignedOn: parseDate(row.ResignationDate),
        dateOfBirthYear: dob.year,
        dateOfBirthMonth: dob.month,
        nationality: row.Nationality || null,
        occupation: row.Occupation || null,
      }

      batch.push(officer)

      if (batch.length >= BATCH_SIZE) {
        stream.pause()
        processBatch().then(() => stream.resume())
      }
    })

    stream.on('end', async () => {
      await processBatch()

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
      console.log(`   Total imported:     ${totalImported.toLocaleString()} directors/secretaries`)
      console.log(`   Filtered out:       ${totalNonDirectors.toLocaleString()} non-director roles`)
      console.log(`   Total skipped:      ${totalSkipped.toLocaleString()} records`)
      console.log(`   Time elapsed:       ${minutes} minutes`)
      console.log(`   Average rate:       ${(totalImported / parseInt(elapsed)).toFixed(0)} records/sec`)
      console.log('\n📝 Next steps:')
      console.log('   1. Test the bulk search API: npm run dev')
      console.log('   2. Query: http://localhost:3000/api/search-bulk?industryCode=41&minAge=60&maxAge=75')

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
    console.error('❌ Usage: npm run import-officers -- <path-to-csv>')
    console.error('   Example: npm run import-officers -- data/bulk/Officers-2024-01-01.csv')
    process.exit(1)
  }

  try {
    await importOfficers(filePath)
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Import failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
