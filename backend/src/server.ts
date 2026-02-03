import express from 'express';
import cors from 'cors';
import { DataService } from './dataService';
import { AnalyticsService } from './analyticsService';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dataService = new DataService();
const analyticsService = new AnalyticsService(dataService);

// API Routes
app.get('/api/summary', (req, res) => {
  try {
    const summary = analyticsService.getSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

app.get('/api/drivers', (req, res) => {
  try {
    const drivers = analyticsService.getDrivers();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get drivers' });
  }
});

app.get('/api/risk-factors', (req, res) => {
  try {
    const riskFactors = analyticsService.getRiskFactors();
    res.json(riskFactors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get risk factors' });
  }
});

app.get('/api/recommendations', (req, res) => {
  try {
    const recommendations = analyticsService.getRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

app.get('/api/revenue-trend', (req, res) => {
  try {
    const trend = analyticsService.getRevenueTrend();
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get revenue trend' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
