import express from 'express';
import cors from 'cors';
import { DataService } from './dataService';
import { AnalyticsService } from './analyticsService';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize services
let dataService: DataService;
let analyticsService: AnalyticsService;

try {
  dataService = new DataService();
  analyticsService = new AnalyticsService(dataService);
  console.log('Services initialized successfully');
} catch (error) {
  console.error('Failed to initialize services:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.get('/api/summary', (req, res) => {
  try {
    const summary = analyticsService.getSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error in /api/summary:', error);
    res.status(500).json({ error: 'Failed to get summary', details: String(error) });
  }
});

app.get('/api/drivers', (req, res) => {
  try {
    const drivers = analyticsService.getDrivers();
    res.json(drivers);
  } catch (error) {
    console.error('Error in /api/drivers:', error);
    res.status(500).json({ error: 'Failed to get drivers', details: String(error) });
  }
});

app.get('/api/risk-factors', (req, res) => {
  try {
    const riskFactors = analyticsService.getRiskFactors();
    res.json(riskFactors);
  } catch (error) {
    console.error('Error in /api/risk-factors:', error);
    res.status(500).json({ error: 'Failed to get risk factors', details: String(error) });
  }
});

app.get('/api/recommendations', (req, res) => {
  try {
    const recommendations = analyticsService.getRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Error in /api/recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations', details: String(error) });
  }
});

app.get('/api/revenue-trend', (req, res) => {
  try {
    const trend = analyticsService.getRevenueTrend();
    res.json(trend);
  } catch (error) {
    console.error('Error in /api/revenue-trend:', error);
    res.status(500).json({ error: 'Failed to get revenue trend', details: String(error) });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
