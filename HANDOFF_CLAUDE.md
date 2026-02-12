# BoomerHunter Handoff for Claude Code

## Session Summary
- Repository: `https://github.com/jpwoodi/Boomerhunter.git`
- Local path: `C:\Users\j.woodnott\.vscode\Coding\Boomerhunter`
- Active branch: `claude/director-retirement-search-tool-S6DBs`
- Goal completed: refactor search flow to be more search-fund relevant (industry dropdown flow, scoring/ranking, clearer filtering behavior, shortlist/export, tests).

## What Was Implemented

### 1) Search and API logic hardening
- Added shared query utilities:
  - `lib/utils/search.ts`
    - `parseAndValidateAgeRange`
    - `parseBooleanParam`
    - `normalizeCompanyName`
    - `matchesIndustrySic`
    - `buildIndustryQueries`
- API route now uses validated params and returns `400` for validation errors.
- API route is explicitly dynamic:
  - `app/api/search/route.ts`
  - `export const dynamic = 'force-dynamic'`

### 2) Better industry retrieval and processing
- Added industry mapping data file:
  - `lib/data/industries.ts`
- Industry search now builds multiple seed queries and fetches multiple pages per query, then SIC-prefix filters.
- Company processing uses concurrency-limited mapping instead of pure sequential loops:
  - `lib/utils/async.ts`
  - used in `app/api/search/route.ts`

### 3) Search-fund opportunity scoring
- Added scoring model:
  - `lib/utils/scoring.ts`
  - factors: succession pressure, leadership concentration, business maturity, leadership tenure, data confidence
- Added to result model:
  - `types/index.ts`
    - `OpportunityScoreBreakdown`
    - `opportunityScore`
    - `scoreBreakdown`
    - `knownDirectorAges`
- API now ranks by score, then retirement count, then director count.

### 4) Frontend workflow improvements
- Filters upgraded:
  - `components/SearchFilters.tsx`
  - client-side age validation
  - `includeNoRetirementMatches` toggle
  - active and exact toggles preserved
- Results upgraded:
  - `components/CompanyResults.tsx`
  - score badge + score breakdown
  - dynamic age-range highlighting (uses selected min/max)
  - accurate empty states and truncation warnings
  - shortlist add/remove actions
  - export buttons
- Page state and workflow:
  - `app/page.tsx`
  - localStorage shortlist persistence
  - export CSV for results and shortlist
  - richer search metadata state

### 5) Test harness added
- Added Vitest:
  - `package.json` (`"test": "vitest run"`)
  - `vitest.config.ts`
- Added unit tests:
  - `lib/utils/search.test.ts`
  - `lib/utils/scoring.test.ts`
  - `lib/utils/async.test.ts`

## Validation Run Results
- `npm run lint` passed.
- `npm test` passed (8 tests).
- `npm run build` passed.

## Current Working Tree (Uncommitted)
- Modified:
  - `app/api/search/route.ts`
  - `app/page.tsx`
  - `components/CompanyResults.tsx`
  - `components/SearchFilters.tsx`
  - `lib/services/companiesHouse.ts`
  - `package-lock.json`
  - `package.json`
  - `types/index.ts`
- New:
  - `HANDOFF_CLAUDE.md`
  - `lib/data/industries.ts`
  - `lib/utils/async.ts`
  - `lib/utils/scoring.ts`
  - `lib/utils/search.ts`
  - `lib/utils/async.test.ts`
  - `lib/utils/scoring.test.ts`
  - `lib/utils/search.test.ts`
  - `vitest.config.ts`

## Behavior Notes / Limits
- Industry retrieval is improved but still API-sampling-based (not full-market exhaustive).
- Candidate set processing is capped in API:
  - `MAX_CANDIDATE_COMPANIES = 120` in `app/api/search/route.ts`
- `includeNoRetirementMatches` defaults to `false` (classic behavior still default).
- `lib/services/companiesHouse.ts` still contains legacy `searchCompaniesBySIC`/`advancedSearch` branches from earlier versions; some paths are now less central.

## Suggested Next Tasks for Claude Code
1. Decide whether to keep or simplify legacy service methods (`searchCompaniesBySIC`, unused branches) and align service API with new route flow.
2. Add route-level integration tests (mocking Companies House responses) to validate:
   - exact name behavior
   - industry SIC-prefix filtering
   - active-only filter
   - include/no-include retirement matches
3. Add explicit UI display of selected industry name in the top summary if needed.
4. Consider persistence backend for shortlist (currently localStorage only).
5. If scaling beyond sampling, add an indexed local dataset ingestion pipeline for true full-market industry coverage.

## Quick Start for Claude Code
1. `cd C:\Users\j.woodnott\.vscode\Coding\Boomerhunter`
2. `npm install`
3. Ensure `.env.local` has `COMPANIES_HOUSE_API_KEY=...`
4. Validate:
   - `npm run lint`
   - `npm test`
   - `npm run build`
5. Run app:
   - `npm run dev`

