# Companies House Bulk Data Setup Guide

This guide will help you set up the local database to search **all 5+ million UK companies** in seconds.

---

## 🎯 **What This Enables**

- ✅ Search **entire UK company database** (5M+ companies)
- ✅ No API rate limits
- ✅ Sub-second query times
- ✅ Complex filtering (industry + location + age + director age)
- ✅ Return 1000s of companies per search

---

## 📋 **Prerequisites**

1. **PostgreSQL** installed (v14+ recommended)
   - Mac: `brew install postgresql@16`
   - Ubuntu: `sudo apt install postgresql-16`
   - Windows: [Download installer](https://www.postgresql.org/download/windows/)

2. **Node.js** v18+ (already installed)

3. **Disk Space**: ~100GB free
   - Companies data: ~3GB compressed, ~10GB uncompressed
   - Officers data: ~15GB compressed, ~50GB uncompressed
   - Database: ~40GB after import

---

## 🚀 **Quick Start (30 minutes)**

### **Step 1: Install Dependencies**

```bash
npm install
```

This installs:
- `@prisma/client` - Database ORM
- `csv-parser` - For reading Companies House CSV files
- `tsx` - TypeScript execution for scripts

### **Step 2: Set Up Database**

**Option A: Local PostgreSQL**

```bash
# Start PostgreSQL
brew services start postgresql@16  # Mac
sudo service postgresql start       # Linux

# Create database
createdb boomerhunter

# Update .env
cp .env.example .env
# Edit DATABASE_URL=postgresql://postgres:password@localhost:5432/boomerhunter
```

**Option B: Supabase (Free Tier)**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy database URL from Settings → Database
4. Update `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

### **Step 3: Run Database Migrations**

```bash
npm run db:generate
npm run db:migrate
```

This creates the `companies`, `officers`, and `data_imports` tables with proper indexes.

### **Step 4: Download Companies House Data**

**Option A: Manual Download (Recommended)**

1. Visit: http://download.companieshouse.gov.uk/en_output.html
2. Download **"BasicCompanyDataAsOneFile"** (latest date)
3. Save to `data/bulk/` folder
4. Unzip the file

**Option B: Automatic Download (May fail if URLs change)**

```bash
npm run download-bulk-data
```

### **Step 5: Import Companies Data**

```bash
npm run import-companies -- data/bulk/BasicCompanyData-YYYY-MM-DD.csv
```

**Expected time**: 30-60 minutes
**Progress**: Shows records/second

Example output:
```
🏢 Importing Companies House Company Data
============================================================

📁 Reading from: data/bulk/BasicCompanyData-2024-01-01.csv

   ✓ Imported 1,000,000 companies (500/sec)
   ✓ Imported 2,000,000 companies (510/sec)
   ...

✅ Import Complete!
   Total imported: 5,234,567 companies
   Time elapsed:   45.2 minutes
```

### **Step 6: Import Officers Data** (Optional but Recommended)

```bash
npm run import-officers -- data/bulk/Officers-YYYY-MM-DD.csv
```

**Expected time**: 2-4 hours
**Why it takes longer**: ~10M+ officer records

**Note**: Only imports directors and secretaries (filters out shareholders/PSCs)

### **Step 7: Test the Bulk Search**

```bash
npm run dev

# Open browser:
http://localhost:3000/api/search-bulk?industryDivision=41&minAge=60&maxAge=75
```

---

## 📊 **Database Schema**

```sql
-- companies table
company_number VARCHAR(8) PRIMARY KEY
company_name TEXT
company_status VARCHAR(50)
date_of_creation DATE
sic_code_1 VARCHAR(5)  -- Primary industry
sic_code_2 VARCHAR(5)
sic_code_3 VARCHAR(5)
sic_code_4 VARCHAR(5)
address_line_1 TEXT
locality TEXT
region TEXT
postal_code VARCHAR(20)
country VARCHAR(50)

-- officers table
id SERIAL PRIMARY KEY
company_number VARCHAR(8) FK → companies
name TEXT
officer_role VARCHAR(100)
appointed_on DATE
resigned_on DATE
date_of_birth_year INT
date_of_birth_month INT
nationality VARCHAR(50)
occupation TEXT
```

**Indexes** (for fast querying):
- `company_status`, `sic_codes`, `region`, `postal_code`, `date_of_creation`
- `officer.date_of_birth_year`, `officer.resigned_on`

---

## 🔍 **Using the Bulk Search API**

### **API Endpoint**

```
GET /api/search-bulk
```

### **Parameters**

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `industryDivision` | string | `41` | SIC code prefix (Construction = 41-43) |
| `minAge` | number | `60` | Minimum director age |
| `maxAge` | number | `75` | Maximum director age |
| `minCompanyAge` | number | `10` | Min years in business |
| `maxCompanyAge` | number | `50` | Max years in business |
| `region` | string | `London` | Company region |
| `activeCompaniesOnly` | boolean | `true` | Only active companies |
| `limit` | number | `1000` | Max results (max: 5000) |

### **Example Queries**

**All Construction companies in London with retiring directors:**
```
/api/search-bulk?industryDivision=41&minAge=60&maxAge=75&region=London&limit=1000
```

**Manufacturing companies, 15+ years old:**
```
/api/search-bulk?industryDivision=10&minAge=60&maxAge=75&minCompanyAge=15&limit=2000
```

**All active companies (nationwide scan):**
```
/api/search-bulk?minAge=60&maxAge=75&activeCompaniesOnly=true&limit=5000
```

### **Response Format**

```json
{
  "results": [
    {
      "companyNumber": "12345678",
      "companyName": "ABC Construction Ltd",
      "companyStatus": "active",
      "dateOfCreation": "2005-03-15",
      "sicCodes": ["41201"],
      "address": {
        "addressLine1": "123 High Street",
        "locality": "London",
        "region": "Greater London",
        "postalCode": "SW1A 1AA"
      },
      "directors": [
        {
          "name": "John Smith",
          "dateOfBirth": { "year": 1955, "month": 6 },
          "age": 69,
          "appointedOn": "2005-03-15",
          "occupation": "Director",
          "nationality": "British"
        }
      ],
      "retiringSoonCount": 2,
      "knownDirectorAges": 3
    }
  ],
  "count": 847,
  "matchedCompaniesCount": 1203,
  "elapsedMs": 1543,
  "dataSource": "bulk"
}
```

---

## 🔄 **Updating Data**

Companies House updates bulk data **monthly** (usually on the 1st).

### **Monthly Update Process**

```bash
# 1. Download latest snapshot
npm run download-bulk-data

# 2. Re-import companies (overwrites existing)
npm run import-companies -- data/bulk/BasicCompanyData-YYYY-MM-DD.csv

# 3. Re-import officers
npm run import-officers -- data/bulk/Officers-YYYY-MM-DD.csv
```

### **Automated Updates** (Optional)

Create a cron job:

```bash
# Edit crontab
crontab -e

# Add monthly update (runs 2nd of each month at 2am)
0 2 2 * * cd /path/to/Boomerhunter && npm run download-bulk-data && npm run import-companies -- data/bulk/BasicCompanyData-*.csv
```

---

## 🎛️ **Database Management**

### **View Database**

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555` for browsing data.

### **Database Size**

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **Vacuum Database** (recommended monthly)

```sql
VACUUM ANALYZE companies;
VACUUM ANALYZE officers;
```

---

## ⚡ **Performance Tips**

### **Query Optimization**

1. **Always filter by industry** - uses `sic_code` index
2. **Filter by region** - uses `region` index
3. **Use `activeCompaniesOnly=true`** - significantly reduces results
4. **Set reasonable limits** - default 1000, max 5000

### **Database Optimization**

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT c.*, COUNT(o.id)
FROM companies c
JOIN officers o ON c.company_number = o.company_number
WHERE c.company_status = 'active'
  AND c.sic_code_1 LIKE '41%'
  AND o.resigned_on IS NULL
  AND o.date_of_birth_year BETWEEN 1949 AND 1964
GROUP BY c.company_number;

-- Add additional indexes if needed
CREATE INDEX idx_custom ON companies(region, postal_code)
  WHERE company_status = 'active';
```

### **Connection Pooling** (for production)

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_timeout = 30
  connection_limit = 10
}
```

---

## 🐛 **Troubleshooting**

### **Import is slow**

- Check disk I/O (use SSD not HDD)
- Increase batch size in import scripts
- Disable indexes during import, rebuild after

### **Out of memory**

- Reduce `BATCH_SIZE` in import scripts
- Close other applications
- Use swap space (Linux)

### **"Connection refused" error**

- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Test connection: `psql $DATABASE_URL`

### **CSV parsing errors**

- Companies House format may change
- Check field names in CSV vs. import script
- Update mapping in `import-companies.ts`

---

## 💰 **Cost Comparison**

| Approach | Setup Time | Monthly Cost | Query Speed | Max Results |
|----------|------------|--------------|-------------|-------------|
| **API Only** | 0 hours | $0 | 2-3 minutes | 500 |
| **Bulk Database** | 4-8 hours | $20-50 | <1 second | 5,000,000 |

---

## 📚 **Next Steps**

1. ✅ Set up database (this guide)
2. 🔲 Import data
3. 🔲 Test bulk search API
4. 🔲 Update UI to use bulk search
5. 🔲 Add CSV export functionality
6. 🔲 Set up monthly data refresh

---

## 🆘 **Support**

- **Companies House Data**: http://download.companieshouse.gov.uk/en_output.html
- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## 📝 **File Structure**

```
Boomerhunter/
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/
│   ├── download-bulk-data.ts  # Download CH data
│   ├── import-companies.ts    # Import companies
│   └── import-officers.ts     # Import officers
├── app/api/
│   ├── search/                # Original API search
│   └── search-bulk/           # New bulk search
├── lib/
│   └── db.ts                  # Prisma client
└── data/bulk/                 # Downloaded CSV files
```

---

**Ready to import data?** Start with **Step 4** above! 🚀
