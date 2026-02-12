#!/usr/bin/env tsx

/**
 * Download Companies House bulk data files
 *
 * Usage:
 *   npm run download-bulk-data
 *
 * Downloads:
 *   - BasicCompanyDataAsOneFile (all companies)
 *   - officers_snapshot (all officers)
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import zlib from 'zlib'

const DATA_DIR = path.join(process.cwd(), 'data', 'bulk')
const COMPANIES_HOUSE_BASE_URL = 'http://download.companieshouse.gov.uk'

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

interface DownloadConfig {
  name: string
  url: string
  outputFile: string
}

async function downloadFile(config: DownloadConfig): Promise<void> {
  console.log(`\n📥 Downloading ${config.name}...`)
  console.log(`URL: ${config.url}`)

  const outputPath = path.join(DATA_DIR, config.outputFile)

  return new Promise((resolve, reject) => {
    const protocol = config.url.startsWith('https') ? https : require('http')

    protocol.get(config.url, (response: any) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`))
        return
      }

      const totalBytes = parseInt(response.headers['content-length'] || '0')
      let downloadedBytes = 0

      response.on('data', (chunk: Buffer) => {
        downloadedBytes += chunk.length
        const progress = ((downloadedBytes / totalBytes) * 100).toFixed(1)
        process.stdout.write(`\r   Progress: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(1)} MB)`)
      })

      const fileStream = createWriteStream(outputPath)
      response.pipe(fileStream)

      fileStream.on('finish', () => {
        fileStream.close()
        console.log(`\n✅ Downloaded to: ${outputPath}`)
        resolve()
      })

      fileStream.on('error', reject)
    }).on('error', reject)
  })
}

async function unzipFile(zipPath: string): Promise<void> {
  console.log(`\n📦 Unzipping ${path.basename(zipPath)}...`)

  const outputPath = zipPath.replace('.zip', '.csv')
  const gunzip = zlib.createGunzip()

  await pipeline(
    fs.createReadStream(zipPath),
    gunzip,
    fs.createWriteStream(outputPath)
  )

  console.log(`✅ Unzipped to: ${outputPath}`)
}

async function getLatestSnapshot(): Promise<{ companiesUrl: string; officersUrl: string; date: string }> {
  console.log('🔍 Finding latest Companies House snapshot...\n')

  // Companies House typically updates monthly on the 1st
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = '01'
  const date = `${year}-${month}-${day}`

  // Note: You may need to adjust these URLs based on actual availability
  // Check http://download.companieshouse.gov.uk/en_output.html for latest files

  return {
    companiesUrl: `${COMPANIES_HOUSE_BASE_URL}/BasicCompanyDataAsOneFile-${date}.zip`,
    officersUrl: `${COMPANIES_HOUSE_BASE_URL}/officers_snapshot_${date}.zip`,
    date
  }
}

async function main() {
  console.log('🏢 Companies House Bulk Data Downloader')
  console.log('=' .repeat(50))

  try {
    const { companiesUrl, officersUrl, date } = await getLatestSnapshot()

    console.log(`\n📅 Target date: ${date}`)
    console.log(`\n⚠️  Note: If download fails, check http://download.companieshouse.gov.uk/en_output.html`)
    console.log(`   for the actual latest file names and update this script.\n`)

    // Download companies data (~3GB compressed)
    await downloadFile({
      name: 'Basic Company Data',
      url: companiesUrl,
      outputFile: `BasicCompanyData-${date}.zip`
    })

    // Download officers data (~15GB compressed)
    console.log('\n⚠️  Officers data is very large (~15GB compressed, ~50GB uncompressed)')
    console.log('   You may want to download this separately or process in chunks.')

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise<string>((resolve) => {
      readline.question('\nDownload officers data now? (y/N): ', resolve)
    })
    readline.close()

    if (answer.toLowerCase() === 'y') {
      await downloadFile({
        name: 'Officers Snapshot',
        url: officersUrl,
        outputFile: `Officers-${date}.zip`
      })
    }

    console.log('\n✅ Download complete!')
    console.log(`\n📁 Files saved to: ${DATA_DIR}`)
    console.log('\n📝 Next steps:')
    console.log('   1. Unzip the files if needed')
    console.log('   2. Run: npm run import-companies')
    console.log('   3. Run: npm run import-officers')

  } catch (error) {
    console.error('\n❌ Download failed:', error)
    console.error('\n💡 Manual download instructions:')
    console.error('   1. Visit: http://download.companieshouse.gov.uk/en_output.html')
    console.error('   2. Download "BasicCompanyDataAsOneFile" (latest date)')
    console.error('   3. Download "Persons with Significant Control Snapshot" or "Officers Snapshot"')
    console.error(`   4. Save to: ${DATA_DIR}`)
    process.exit(1)
  }
}

main()
