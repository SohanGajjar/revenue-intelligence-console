# Quick Start Guide

## Fastest Way to Run

### Option 1: Automated Setup (Recommended)

```bash
# From project root
./setup.sh

# Then start backend (Terminal 1)
cd backend && npm start

# Start frontend (Terminal 2)
cd frontend && npm run dev
```

### Option 2: Manual Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Build backend
cd ../backend && npm run build

# Start backend (Terminal 1)
npm start

# Start frontend (Terminal 2)
cd ../frontend && npm run dev
```

### Access the Dashboard

Open your browser to: **http://localhost:3000**

## What You Should See

✅ **Header**: Blue SkyGeni logo with navigation icons  
✅ **Summary Banner**: QTD Revenue, Target, and Gap percentage  
✅ **Revenue Drivers**: 4 cards with mini charts (Pipeline, Win Rate, Avg Deal Size, Sales Cycle)  
✅ **Risk Factors**: List of issues like stale deals and underperforming reps  
✅ **Recommendations**: Actionable suggestions  
✅ **Revenue Trend Chart**: 6-month bar + line chart  

## Troubleshooting

### "Cannot find module" error
```bash
rm -rf backend/node_modules frontend/node_modules
./setup.sh
```

### Port 3001 already in use
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Frontend shows blank page
1. Check backend is running: `curl http://localhost:3001/api/summary`
2. Check browser console for errors (F12)
3. Ensure port 3000 is not blocked

## Sample API Queries

```bash
# Get summary
curl http://localhost:3001/api/summary

# Get revenue drivers
curl http://localhost:3001/api/drivers

# Get risk factors
curl http://localhost:3001/api/risk-factors

# Get recommendations
curl http://localhost:3001/api/recommendations

# Get revenue trend
curl http://localhost:3001/api/revenue-trend
```

## Project Requirements Checklist

- ✅ Backend API with 4 required endpoints
- ✅ TypeScript for both frontend and backend
- ✅ Material-UI components
- ✅ D3.js for custom charts
- ✅ React functional components
- ✅ Revenue summary with QTD, target, gap
- ✅ Revenue drivers analysis
- ✅ Risk factor detection
- ✅ Actionable recommendations
- ✅ Revenue trend visualization
- ✅ THINKING.md reflection document
- ✅ Comprehensive README.md

## Next Steps

1. Review `THINKING.md` for design decisions
2. Check `README.md` for full documentation
3. Explore the codebase structure
4. Test API endpoints with curl or Postman
5. Modify data files in `/data` to see changes
