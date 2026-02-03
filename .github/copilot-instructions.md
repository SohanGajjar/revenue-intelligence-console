# AI Coding Agent Instructions for Revenue Intelligence Console

## Project Overview
**Revenue Intelligence Console** is a React + Express dashboard helping sales leaders identify revenue gaps and take action. It answers: "Why are we behind on revenue and what should we focus on?"

**Key Tech**: React 18 + TypeScript (frontend), Express + TypeScript (backend), in-memory JSON data, Material-UI + D3.js for visualizations, Vite bundler.

---

## Architecture & Data Flow

### Two-Service Architecture
- **Backend** (port 3001): Express server exposes 5 REST endpoints; loads JSON data once at startup via `DataService`
- **Frontend** (port 3000): React SPA fetches all data via `apiService` (axios wrapper) on mount, renders dashboard

### Key Data Pipeline
```
data/*.json → DataService (loads into memory) 
           → AnalyticsService (calculates metrics)
           → Express endpoints (/api/summary, /api/drivers, etc.)
           → Frontend fetches all 5 endpoints in parallel
           → Components render summary, drivers, risk factors, recommendations, trend
```

### Critical Business Logic in AnalyticsService
- **Summary**: Filters Won deals by Q1 2026 (Jan-Mar), sums revenue vs. monthly targets
- **Drivers**: Calculates 4 metrics (pipeline value, win rate, avg deal size, sales cycle) from deal data
- **Risk Factors**: Detects stale Enterprise deals (30+ days open), underperforming reps (Ankit <15% win rate), inactive accounts (no activities last 30 days)
- **Recommendations**: Generated from detected risk types; maps each risk to an actionable suggestion
- **Revenue Trend**: Returns 6-month historical data; **note: trend data is currently hardcoded**, not calculated from actual deal history

---

## Developer Workflows

### Build & Run
```bash
# From root directory
cd backend && npm install && npm run build
cd ../frontend && npm install

# Terminal 1: Start backend (port 3001)
cd backend && npm start

# Terminal 2: Start frontend (port 3000)  
cd frontend && npm run dev
```

### Adding a New API Endpoint
1. Add method to `AnalyticsService` in [backend/src/analyticsService.ts](backend/src/analyticsService.ts)
2. Add route in [backend/src/server.ts](backend/src/server.ts) with try-catch wrapper
3. Add TypeScript interface in [backend/src/types.ts](backend/src/types.ts) if new data structure
4. Add fetch method to `apiService` in [frontend/src/api.ts](frontend/src/api.ts)
5. Update frontend component to use new data; use `Promise.all()` to fetch in parallel

### Modifying Analytics Logic
- All calculations live in [backend/src/analyticsService.ts](backend/src/analyticsService.ts) — changes propagate to frontend automatically
- For date filtering: dates are ISO strings (YYYY-MM-DD); parse carefully (e.g., `new Date(d.createdAt)`)
- For null-safety: won deals always have `closedAt`, open deals have `closedAt: null` — check before use
- Helper methods like `getPipelineTrend()` return hardcoded arrays; see **Known Limitations** below

---

## Code Patterns & Conventions

### Data Service Pattern (Backend)
```typescript
// Singleton instance in server.ts, injected into AnalyticsService
const dataService = new DataService();
const analyticsService = new AnalyticsService(dataService);

// AnalyticsService uses methods: getDeals(), getReps(), getAccounts(), getActivities(), getTargets()
// Caller responsible for filtering — no built-in query methods
```

### React Components (Frontend)
- Use functional components with hooks; `useEffect()` fetches all data once on mount
- Component tree: `<App>` → `<Summary>`, `<DriverCard>` + `<MiniChart>`, `<RiskFactors>`, `<Recommendations>`, `<RevenueTrendChart>`
- Material-UI with inline sx props for styling; no external CSS files
- D3 charts (`<MiniChart>`, `<RevenueTrendChart>`) use inline `useEffect` and `useRef` to mount DOM

### Error Handling
- Backend: simple try-catch returning `{ error: 'message' }`; no custom error codes
- Frontend: silently catches errors in Promise.all(), displays loading spinner or fallback values
- **Avoid**: Detailed error messages to end users — log to console instead

---

## Known Limitations & Assumptions

### Data Assumptions (from THINKING.md)
- **Quarter**: Q1 2026 = Jan-Mar (hardcoded in filters)
- **Today**: February 3, 2026 (for stale deal detection)
- **Deal Statuses**: Only "Won", "Lost", "Open" (no custom stages)
- **Stale Deal Threshold**: Enterprise deals open 30+ days
- **Inactive Account Threshold**: No activities in last 30 days
- **Rep Underperformance**: Ankit <15% win rate triggers recommendation

### Hardcoded Data
- **Trend Arrays**: `getPipelineTrend()`, `getWinRateTrend()`, `getDealSizeTrend()`, `getCycleTrend()` return static data — do NOT use for calculations
- **Rep Name Mapping**: "Ankit" is hardcoded in risk detection — if rep name changes, update string literal

### Missing Features (won't scale at 10×)
- **No Database**: In-memory JSON reload on restart → will cause timeout/OOM at 100K+ deals
- **No Caching**: All calculations on-demand → response times degrade
- **No Pagination**: Frontend loads all data at once → memory pressure
- **No Filtering**: Users can't drill down; must redesign data fetching if filtering needed
- **Missing Validation**: No referential integrity (accountId → accounts.json, etc.)

---

## Integration Points & Data Types

### Shared Type Definitions
- Backend types in [backend/src/types.ts](backend/src/types.ts); Frontend mirrors in [frontend/src/types.ts](frontend/src/types.ts)
- **Keep in sync**: Changes to Summary, Driver, RiskFactor, Recommendation require updates in both files

### API Contract
| Endpoint | Returns | Key Logic |
|----------|---------|-----------|
| `/api/summary` | `Summary` | Q1 revenue vs target, gap % |
| `/api/drivers` | `Driver[]` (4 items) | Pipeline, win rate, avg deal, cycle |
| `/api/risk-factors` | `RiskFactor[]` (0-3 items) | Stale deals, low win rate, inactive accounts |
| `/api/recommendations` | `Recommendation[]` | Actionable suggestions mapped from risks |
| `/api/revenue-trend` | `RevenueTrendData[]` (6 items) | 6-month bar chart + trend line data |

### Frontend-Backend Communication
- Base URL: `/api` (proxied by Vite dev server to `http://localhost:3001`)
- All requests via `axios.get()`; no POST/PUT/DELETE currently
- Parallel fetching: `Promise.all([...])` on mount reduces initial load time

---

## When Extending This Codebase

### Adding a Metric (e.g., "Revenue per Rep")
1. Calculate in `AnalyticsService.getMetric()` — iterate deals by rep, aggregate
2. Create response type in `types.ts` (both backends)
3. Add `/api/metric` endpoint in `server.ts`
4. Add `getMetric()` to `apiService` in `frontend/src/api.ts`
5. Add component in `App.tsx` and fetch in useEffect

### Changing Business Logic (e.g., stale deal = 60 days instead of 30)
- Edit constant in `AnalyticsService.getRiskFactors()` — search for `30` in the method
- No config file; constants are inline comments document the "why"

### Deploying
- Backend compiles to `backend/dist/` via `npm run build`
- Frontend builds to `frontend/dist/` via Vite
- Ensure backend runs before frontend (port 3001 must be up when frontend fetches)
- Environment variables: **Not currently used** — hardcoded Q1 2026 and port 3001

---

## Rapid Onboarding Checklist

- [ ] Run `./setup.sh` or `cd backend && npm install && npm run build; cd ../frontend && npm install`
- [ ] Start backend: `cd backend && npm start` (verify "Server running on http://localhost:3001")
- [ ] Start frontend: `cd frontend && npm run dev` (verify http://localhost:3000 loads dashboard)
- [ ] Test API: `curl http://localhost:3001/api/summary` returns JSON with `qtdRevenue`, `target`, `gap`, `gapPercentage`
- [ ] Read [THINKING.md](THINKING.md) for architectural decisions and data assumptions
- [ ] For new metrics: follow "Adding a Metric" pattern above; copy existing endpoint structure
