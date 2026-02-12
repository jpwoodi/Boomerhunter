# BoomerHunter Development Plan
**Professional Succession Opportunity Intelligence Platform**

---

## Executive Summary

This plan outlines the transformation of BoomerHunter from a functional tool into a premium succession opportunity intelligence platform. Based on comprehensive analysis of the current codebase, this roadmap includes 11 major features across 3 development phases.

**Current State**: BoomerHunter successfully identifies succession opportunities using Companies House data, director age analysis, and intelligent opportunity scoring.

**Target State**: A premium B2B SaaS tool for private equity firms, M&A advisors, and strategic acquirers to systematically identify and track UK succession opportunities.

---

## Current Capabilities Summary

✅ **Search & Discovery**
- Industry search via 18 SIC code divisions
- Company name search (exact and fuzzy matching)
- Director age filtering (40-100 years)
- Active/inactive company filtering

✅ **Intelligence & Scoring**
- 100-point opportunity scoring system
- 5-factor analysis: succession pressure, leadership concentration, business maturity, tenure, data confidence
- Director age and retirement analysis
- Company profile enrichment

✅ **Data Management**
- Shortlist functionality (localStorage)
- CSV export (results and shortlist)
- Professional Pitchbook-style UI

---

## Phase 1: Core Feature Additions (Weeks 1-3)

### 1. Company Age Filter ⭐ PRIORITY 1
**Timeline**: Week 1
**Complexity**: Easy
**User Value**: Target established businesses, align with investment criteria

**Implementation**:
- Add `minCompanyAge` and `maxCompanyAge` to SearchParams
- Filter based on `date_of_creation` field
- Add age range inputs to SearchFilters UI
- Preset buttons: "10+ years", "15+ years", "20+ years"

**Files to Modify**:
- `/types/index.ts` - Extend SearchParams
- `/app/api/search/route.ts` - Add age filtering logic
- `/components/SearchFilters.tsx` - Add UI controls
- `/lib/utils/search.ts` - Add validation

---

### 2. UK Location Filtering ⭐ PRIORITY 2
**Timeline**: Week 1-2
**Complexity**: Medium
**User Value**: Regional targeting, local market focus, geographic deal sourcing

**Implementation**:
- Add location filters: regions, localities (counties/cities), postcode areas
- Filter on `registered_office_address` data from Companies House
- Hierarchical location selector (Region → Locality → Postcode)
- Create UK location reference data

**Data Structure**:
```typescript
interface LocationFilter {
  regions?: string[]        // England, Scotland, Wales, NI
  localities?: string[]     // Counties/cities
  postcodeAreas?: string[]  // e.g., "M", "SW", "EH"
}
```

**Files to Create/Modify**:
- `/lib/data/ukLocations.ts` - NEW: UK regions and localities reference
- `/lib/utils/location.ts` - NEW: Location parsing utilities
- `/components/LocationFilter.tsx` - NEW: Location filter component
- `/app/api/search/route.ts` - Add location filtering
- `/components/SearchFilters.tsx` - Integrate location filter
- `/types/index.ts` - Add LocationFilter interface

---

### 3. Company Drill-Down Page ⭐ PRIORITY 3
**Timeline**: Week 2-3
**Complexity**: Hard
**User Value**: Deep due diligence, historical accounts, filing documents, financial analysis

**Implementation**:
- Create dynamic route `/company/[companyNumber]`
- Fetch additional data from Companies House API:
  - Company profile (detailed)
  - Filing history (all documents)
  - Financial accounts data
  - Charge information
- Display sections: Overview, Financials, Filing History, Officers, Documents

**New Companies House API Endpoints**:
```
GET /company/{companyNumber}                    - Full company profile
GET /company/{companyNumber}/filing-history     - Filing history
GET /company/{companyNumber}/charges            - Charges (if any)
```

**Data Structures**:
```typescript
interface CompanyProfile {
  companyNumber: string
  companyName: string
  companyStatus: string
  dateOfCreation: string
  type: string
  jurisdiction: string
  accounts?: {
    nextDue?: string
    lastMadeUpTo?: string
  }
  hasInsolvencyHistory?: boolean
  hasCharges?: boolean
  // ... full profile data
}

interface FilingHistoryItem {
  transactionId: string
  category: string        // accounts, confirmation-statement, etc.
  date: string
  type: string
  description: string
  links?: {
    documentMetadata?: string  // For document download
  }
}
```

**Files to Create/Modify**:
- `/lib/services/companiesHouse.ts` - Add getCompanyProfile(), getFilingHistory()
- `/app/api/company/[companyNumber]/route.ts` - NEW: Company detail API
- `/app/api/company/[companyNumber]/filing-history/route.ts` - NEW: Filing history API
- `/app/company/[companyNumber]/page.tsx` - NEW: Company detail page
- `/components/CompanyHeader.tsx` - NEW: Company header section
- `/components/CompanyFinancials.tsx` - NEW: Financial summary
- `/components/FilingHistory.tsx` - NEW: Filing history table
- `/components/CompanyOfficers.tsx` - NEW: Enhanced officers display
- `/components/CompanyResults.tsx` - Add click navigation to detail page
- `/types/index.ts` - Add new interfaces

**UI Sections**:
1. **Header**: Company name, status, establishment year, location
2. **Key Metrics**: Opportunity score, directors, age, financials
3. **Financials Tab**: Latest accounts summary, trends, filing dates
4. **Filing History Tab**: Sortable table with document links
5. **Officers Tab**: Full director list with appointment history
6. **Documents Tab**: Direct links to Companies House PDFs

---

## Phase 2: Enhanced Features (Weeks 4-6)

### 4. Industry Longlist Generation
**Timeline**: Week 4
**Complexity**: Medium
**User Value**: Systematic market mapping, deal sourcing, batch processing

**Implementation**:
- Create dedicated "Longlist Mode" for comprehensive industry searches
- Increase company processing limits (200-500 companies)
- Save longlists with filters for later refinement
- Multi-industry combination support

**Data Structure**:
```typescript
interface IndustryLonglist {
  id: string
  name: string
  industries: string[]      // Division codes
  createdAt: string
  companyCount: number
  filters: SearchParams
}
```

**Files to Create/Modify**:
- `/components/IndustryLonglists.tsx` - NEW: Longlist management UI
- `/app/api/search/route.ts` - Add longlist mode parameter
- `/app/page.tsx` - Add longlist tab and state
- `/types/index.ts` - Add IndustryLonglist interface

---

### 5. Saved Searches
**Timeline**: Week 4
**Complexity**: Easy
**User Value**: Save complex search criteria, track market segments, quick reload

**Implementation**:
- Save search configurations with custom names
- Store in localStorage
- Quick-load functionality
- Track result counts over time

**Data Structure**:
```typescript
interface SavedSearch {
  id: string
  name: string
  description?: string
  searchParams: SearchParams
  createdAt: string
  lastRun?: string
  resultCount?: number
}
```

**Files to Create/Modify**:
- `/components/SavedSearches.tsx` - NEW: Saved search management
- `/components/SearchFilters.tsx` - Add "Save Search" button
- `/app/page.tsx` - Implement "Saved Searches" tab functionality
- `/types/index.ts` - Add SavedSearch interface

---

### 6. Enhanced Export & Reporting
**Timeline**: Week 5-6
**Complexity**: Medium
**User Value**: Professional reports, detailed analysis, stakeholder presentations

**Implementation**:
- Multiple export formats: CSV (enhanced), Excel, PDF
- Include all data: score breakdowns, director details, financials
- Custom export configuration dialog
- Professional PDF reports with charts

**Export Options**:
```typescript
interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  includeDirectors: boolean
  includeScoreBreakdown: boolean
  includeFinancials: boolean
  includeNotes: boolean
}
```

**New Dependencies**:
```bash
npm install xlsx jspdf jspdf-autotable
```

**Files to Create/Modify**:
- `/lib/utils/export.ts` - NEW: Comprehensive export utilities
- `/components/ExportDialog.tsx` - NEW: Export configuration modal
- `/components/CompanyResults.tsx` - Replace simple export with dialog

---

## Phase 3: Advanced Features (Weeks 7-10)

### 7. Company Comparison Tool
**Timeline**: Week 7
**Complexity**: Medium
**User Value**: Side-by-side analysis, shortlist prioritization, decision support

**Implementation**:
- Multi-select companies from results
- Side-by-side comparison view
- Compare: scores, directors, financials, key metrics
- Export comparison report

**Files to Create/Modify**:
- `/components/CompanyComparison.tsx` - NEW: Comparison view
- `/components/CompanyResults.tsx` - Add selection checkboxes
- `/app/page.tsx` - Add comparison state

---

### 8. Notes & Collaboration
**Timeline**: Week 8
**Complexity**: Easy-Medium
**User Value**: Due diligence tracking, team insights, institutional knowledge

**Implementation**:
- Add notes to companies
- Tag companies with custom labels
- Priority/status tracking (researching, contacted, in diligence, etc.)
- Export notes with company data

**Data Structures**:
```typescript
interface CompanyNote {
  id: string
  companyNumber: string
  note: string
  createdAt: string
  tags?: string[]
}

interface CompanyRating {
  companyNumber: string
  priority: 'high' | 'medium' | 'low'
  status: 'researching' | 'contacted' | 'meeting_scheduled' | 'in_diligence' | 'passed'
}
```

**Files to Create/Modify**:
- `/components/CompanyNotes.tsx` - NEW: Notes component
- `/components/CompanyTags.tsx` - NEW: Tags management
- `/lib/utils/notes.ts` - NEW: Notes storage
- `/app/company/[companyNumber]/page.tsx` - Add notes section

---

### 9. Market Intelligence Dashboard
**Timeline**: Week 9-10
**Complexity**: Medium
**User Value**: Portfolio overview, industry trends, strategic insights

**Implementation**:
- Aggregate analytics from searches, shortlist, watch list
- Visualizations: score distribution, industry breakdown, geography
- Key metrics: total opportunities, average score, distribution
- Export dashboard as PDF

**Charts**:
- Score distribution histogram
- Industry breakdown (pie/bar)
- Geographic distribution (UK map or list)
- Company age distribution
- Director age trends

**New Dependency**:
```bash
npm install recharts
```

**Files to Create/Modify**:
- `/components/Dashboard.tsx` - NEW: Main dashboard
- `/components/charts/ScoreDistribution.tsx` - NEW
- `/components/charts/IndustryBreakdown.tsx` - NEW
- `/components/charts/GeographicMap.tsx` - NEW
- `/lib/utils/analytics.ts` - NEW: Analytics calculations
- `/app/page.tsx` - Add dashboard tab

---

## Phase 4: Future Enhancements (Weeks 11+)

### 10. Director Network Analysis
**Timeline**: Week 11-12
**Complexity**: Hard
**User Value**: Discover connected companies, serial entrepreneurs, co-director networks

**Implementation**:
- Search directors across all companies
- Director profile with all appointments
- Company network visualization
- Identify common connections

**New API Endpoints**:
```
GET /search/officers                           - Search officers by name
GET /officers/{officerId}/appointments         - All appointments
```

**Files to Create/Modify**:
- `/app/api/director/search/route.ts` - NEW: Director search
- `/app/director/[name]/page.tsx` - NEW: Director profile page
- `/components/DirectorProfile.tsx` - NEW
- `/components/CompanyNetwork.tsx` - NEW: Network viz
- `/lib/services/companiesHouse.ts` - Add director search methods

---

### 11. Alerts & Monitoring
**Timeline**: Week 13+
**Complexity**: Medium-Hard (requires backend)
**User Value**: Automated tracking, event notifications, systematic monitoring

**Implementation**:
- Watch list for specific companies
- Alert triggers: new filings, director changes, status changes
- In-app notifications
- Manual "Check for Updates" (automatic requires backend)

**Data Structures**:
```typescript
interface WatchedCompany {
  companyNumber: string
  addedAt: string
  lastChecked?: string
  alerts: CompanyAlert[]
  watchSettings: WatchSettings
}

interface CompanyAlert {
  id: string
  type: 'filing' | 'director_change' | 'status_change'
  message: string
  timestamp: string
  read: boolean
}
```

**Files to Create/Modify**:
- `/components/WatchList.tsx` - NEW: Watch list management
- `/components/AlertsList.tsx` - NEW: Alerts display
- `/lib/utils/monitoring.ts` - NEW: Change detection
- `/app/page.tsx` - Add watch list tab

---

## Technical Architecture

### State Management
- **Current**: React useState
- **Recommendation**: React Context for cross-component state (shortlist, notes, watch list)
- **Future**: Consider Zustand/Redux for complex state

### Data Persistence
- **Phase 1-3**: localStorage for client-side data
- **Phase 4**: Backend API with database (PostgreSQL/MongoDB)
  - User authentication
  - Team collaboration
  - Historical tracking
  - Automated monitoring

### API Rate Limiting
- Companies House: 600 requests per 5 minutes
- Current: Concurrency limit of 4
- Future: Request queue with rate limiting, caching

### File Organization
```
/app
  /api
    /search - Search companies
    /company/[companyNumber] - Company details
    /director/[name] - Director profiles
  /company/[companyNumber] - Company detail page
  /director/[name] - Director profile page
  page.tsx - Main search interface

/components
  SearchFilters.tsx
  CompanyResults.tsx
  LocationFilter.tsx
  SavedSearches.tsx
  Dashboard.tsx
  CompanyDetail/
    CompanyHeader.tsx
    CompanyFinancials.tsx
    FilingHistory.tsx

/lib
  /services
    companiesHouse.ts - API client
  /utils
    scoring.ts, search.ts, location.ts
    export.ts, analytics.ts, notes.ts
  /data
    industries.ts, ukLocations.ts
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "xlsx": "^0.18.5",          // Excel export
    "recharts": "^2.5.0",        // Dashboard charts
    "date-fns": "^2.30.0",       // Date utilities
    "jspdf": "^2.5.1",           // PDF generation
    "jspdf-autotable": "^3.8.0"  // PDF tables
  }
}
```

---

## Testing Strategy

### Unit Tests (Vitest)
- All utility functions
- Scoring algorithms
- Data transformations
- Location parsing
- Export formatting

### Integration Tests
- API route handlers
- Companies House service methods
- Search filtering logic

### E2E Tests (Future)
- Critical user flows: Search → Detail → Shortlist → Export

---

## Success Metrics

### User Engagement
- Average searches per session
- Shortlist size and conversion
- Export usage
- Return user rate

### Feature Adoption
- Location filter usage
- Company detail page views
- Saved searches created
- Comparison tool usage

### Data Quality
- Coverage of director ages
- Company profile completeness
- Scoring accuracy validation

---

## Pricing Implications

With these features, BoomerHunter becomes a premium tool justifying subscription pricing:

**Tier 1 - Professional** (£99-199/month)
- Full search and filtering
- Unlimited exports
- Saved searches
- Company detail pages

**Tier 2 - Enterprise** (£299-499/month)
- All Professional features
- Alerts and monitoring
- Team collaboration
- Director network analysis
- Priority support

**Tier 3 - API Access** (Custom pricing)
- API access for integration
- Bulk data access
- Custom reporting

---

## Next Steps

1. **Review & Approve Plan** - Stakeholder review
2. **Set Up Development Environment** - Ensure all tools ready
3. **Begin Phase 1** - Start with Company Age Filter (easiest, immediate value)
4. **Weekly Sprints** - Ship features incrementally
5. **User Feedback Loop** - Test with target users after Phase 1

---

## Questions for Consideration

1. **Authentication**: When to add user accounts? (Recommended: Before Phase 3)
2. **Pricing Model**: Freemium vs. paid-only?
3. **Target Market**: Focus on PE firms, M&A advisors, or corporate development?
4. **Branding**: Professional financial tool vs. approachable platform?
5. **Compliance**: Data usage policies, GDPR considerations

---

**Document Version**: 1.0
**Last Updated**: 2026-02-12
**Status**: Ready for Implementation
