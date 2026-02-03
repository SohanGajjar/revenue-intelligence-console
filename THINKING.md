# THINKING.md

## What assumptions did I make?

### Data Assumptions:
- **Quarter Definition**: Assumed Q1 2026 runs from January 1 to March 31, 2026
- **Current Date**: Treated February 3, 2026 as "today" for calculating aging deals
- **Data Completeness**: Assumed the provided JSON files represent a complete year of data (2025-2026)
- **Date Formats**: Assumed all dates follow ISO 8601 format (YYYY-MM-DD)
- **Deal Status**: Assumed only three statuses exist: "Won", "Lost", and "Open"
- **Closed Deals**: Assumed deals are considered "closed" when status is "Won" or "Lost"

### Business Logic Assumptions:
- **Stale Deals**: Defined as Enterprise segment deals open for more than 30 days
- **Inactive Accounts**: Defined as accounts with no activities in the last 30 days
- **Win Rate Threshold**: Assumed 15% win rate is concerning and triggers recommendations
- **Revenue Attribution**: Revenue is attributed to the month when a deal closes (closedAt date)
- **Pipeline Value**: Calculated as the sum of all open deals regardless of probability
- **Sales Cycle**: Calculated as days between createdAt and closedAt for won deals only

### Technical Assumptions:
- **Single User**: No authentication or multi-tenancy requirements
- **Read-Only**: API provides read-only access to pre-loaded data
- **No Persistence**: In-memory data loaded once at startup, no database needed
- **No Real-Time Updates**: Dashboard doesn't need WebSocket or polling for live data
- **CORS**: Frontend and backend run on different ports (3000 and 3001)

## 2. What data issues did you find?

### Inconsistencies Discovered:
- **Missing closedAt Dates**: Open deals have null closedAt, which is expected, but required null checks throughout the code
- **Date Range Mismatches**: Some deals created in 2025 but closed in 2026, crossing fiscal year boundaries
- **Account-Deal Relationships**: No validation that accountId references exist in accounts.json
- **Rep-Deal Relationships**: No validation that repId references exist in reps.json
- **Activity-Deal Disconnection**: Activities reference accounts but not specific deals, making deal-level activity tracking impossible

### Data Quality Issues:
- **No Deal Probabilities**: Open deals lack probability percentages, making weighted pipeline calculations impossible
- **Limited Activity Data**: Only 15 activities for 10 accounts over a year seems unrealistically low
- **No Deal Stages Progression**: Cannot track if deals move backward through stages
- **Missing Timestamps**: Activities have dates but no times, losing granularity
- **Segment Consistency**: No validation that account segments align with rep teams

### Workarounds Implemented:
- Added null checks for all optional date fields
- Used try-catch blocks in all API endpoints to gracefully handle data issues
- Provided default values (0, empty arrays) when calculations fail
- Filtered out invalid records during calculations rather than failing

## 3. What tradeoffs did you choose?

### Architecture Tradeoffs:
- **In-Memory vs Database**: Chose in-memory JSON loading for simplicity over SQLite/Postgres
  - **Pro**: Zero setup, no migrations, easy to understand
  - **Con**: Data reloads on restart, no concurrent user support at scale
  
- **Monolithic Backend vs Microservices**: Single Express server with service classes
  - **Pro**: Simple deployment, no inter-service communication overhead
  - **Con**: Harder to scale individual components independently

### Frontend Tradeoffs:
- **D3 vs Chart Library**: Used D3 directly instead of recharts/chart.js
  - **Pro**: Complete control over chart rendering, matches exact UI requirements
  - **Con**: More verbose code, steeper learning curve
  
- **Material-UI Theme**: Used default MUI theme with inline styling
  - **Pro**: Quick development, consistent components
  - **Con**: Harder to maintain custom design system at scale

### Data Processing Tradeoffs:
- **Precomputed vs On-Demand**: Calculate all metrics on-demand per request
  - **Pro**: Always fresh, simple logic, no cache invalidation
  - **Con**: Slower response times, repeated calculations
  
- **Exact Calculations vs Approximations**: Used exact calculations for all metrics
  - **Pro**: Accurate insights, reliable for business decisions
  - **Con**: More processing time as data grows

### Feature Scope Tradeoffs:
- **Static Trends**: Hardcoded trend data instead of calculating from historical data
  - **Pro**: Matches UI design exactly, predictable output
  - **Con**: Doesn't reflect actual data changes, misleading at times
  
- **Basic Error Handling**: Simple try-catch without detailed error messages
  - **Pro**: Clean code, user doesn't see technical errors
  - **Con**: Harder to debug issues in production

## 4. What would break at 10× scale?

### Performance Bottlenecks (at 10,000 accounts, 100,000 deals):

1. **In-Memory Data Loading**:
   - Current: ~20 deals, loads instantly
   - At 10×: 200,000+ deals, could take 10+ seconds to load, consume GBs of RAM
   - **Fix**: Use a real database (PostgreSQL) with indexes on accountId, repId, closedAt, status

2. **Full Table Scans**:
   - Current: Array.filter() iterates all records every request
   - At 10×: O(n) operations become painfully slow
   - **Fix**: Database indexes, materialized views, query optimization

3. **No Caching**:
   - Current: Every API call recalculates everything from scratch
   - At 10×: Identical requests waste CPU cycles
   - **Fix**: Redis cache for frequent queries, TTL-based invalidation

4. **Single Process**:
   - Current: One Node.js process handles all requests
   - At 10×: CPU bottleneck, one crash kills everything
   - **Fix**: Horizontal scaling with load balancer, PM2 cluster mode

5. **Synchronous Calculations**:
   - Current: API blocks while computing metrics
   - At 10×: Timeouts on complex calculations
   - **Fix**: Background jobs (Bull/BullMQ), pre-aggregate metrics

### Data Management Issues:

1. **JSON File Loading**:
   - Current: Reads entire files into memory once at startup
   - At 10×: Files too large to fit in memory, startup fails
   - **Fix**: Stream processing, database with pagination

2. **No Data Pagination**:
   - Current: Returns all results in single response
   - At 10×: API responses become megabytes, frontend crashes
   - **Fix**: Implement cursor-based pagination, limit to 100 records per request

3. **Unoptimized Joins**:
   - Current: O(n²) lookups for account/rep details
   - At 10×: Nested loops become extremely slow
   - **Fix**: Database JOIN operations, denormalized views

### Frontend Limitations:

1. **D3 Rendering**:
   - Current: Renders 6 data points per chart
   - At 10×: 1000+ points cause browser lag
   - **Fix**: Data downsampling, virtualization, canvas rendering

2. **No Data Streaming**:
   - Current: Waits for all API calls to complete before render
   - At 10×: 30+ second load times
   - **Fix**: Progressive rendering, skeleton screens, lazy loading

3. **Client-Side Filtering**:
   - Current: All data sent to client for client-side processing
   - At 10×: Browser runs out of memory
   - **Fix**: Server-side filtering, search, and aggregation

### Infrastructure Gaps:

1. **No Monitoring**: Can't detect slowdowns or failures
   - **Fix**: APM (New Relic, Datadog), logging (ELK stack)

2. **No Rate Limiting**: Single user can overwhelm server
   - **Fix**: Rate limiter middleware (express-rate-limit)

3. **No Authentication**: Anyone can access all data
   - **Fix**: JWT tokens, role-based access control

4. **No API Versioning**: Breaking changes impact all clients
   - **Fix**: /api/v1/, /api/v2/ namespacing

## 5. What did AI help with vs what you decided?

### AI-Generated:
- **Boilerplate Code**: TypeScript interfaces, Express route structure, package.json dependencies
- **D3 Chart Implementation**: Initial line/bar chart rendering logic, scales, axes
- **Material-UI Components**: Standard component usage patterns, Grid layouts
- **Date Calculations**: Logic for calculating days between dates, filtering by date ranges
- **Sample Data Generation**: Realistic deal values, dates, and activity records

### Human Decisions:
- **API Endpoint Design**: Chose specific endpoint names (/api/summary, /api/drivers, etc.) to match requirements
- **Business Logic**: Defined what constitutes a "stale deal" (30 days, Enterprise only)
- **Metric Definitions**: Decided win rate = won / (won + lost), excluding open deals
- **Chart Type Selection**: Line charts for trends, bars for win rate, combined chart for revenue
- **Error Handling Strategy**: Simple try-catch vs detailed error reporting
- **Data Attribution**: Revenue credited to closing month, not creation month
- **UI Layout Decisions**: 4-column revenue drivers, 2-column risk/recommendations
- **Color Scheme**: Blue theme (#1565c0) matching SkyGeni branding

### Iterative Collaboration:
- **Type Safety**: AI suggested interfaces, human refined with nullability and optional fields
- **Performance**: AI used .filter().map(), human decided it's acceptable for this scale
- **Code Organization**: AI proposed service classes, human decided file structure
- **Trend Calculation**: AI attempted historical calculation, human simplified to hardcoded for demo

### Critical Thinking Applied:
1. **Identified data inconsistencies** (closed dates, missing activities) that AI didn't flag
2. **Questioned assumptions** like "why Enterprise deals only?" for stale deal definition
3. **Prioritized simplicity** over features (in-memory vs database) based on 3-4 hour timebox
4. **Recognized scale limitations** that AI's generated code wouldn't handle
5. **Made explicit tradeoffs** between accuracy and development speed

---

**Overall Assessment**: AI accelerated implementation but required human judgment for architecture decisions, business logic correctness, and understanding real-world constraints. The combination was effective for rapid prototyping within the timebox.