import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { apiService } from './api';
import { MiniChart } from './MiniChart';
import { RevenueTrendChart } from './RevenueTrendChart';
import { Summary, Driver, RiskFactor, Recommendation, RevenueTrendData } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [summaryData, driversData, riskData, recData, trendData] = await Promise.all([
          apiService.getSummary(),
          apiService.getDrivers(),
          apiService.getRiskFactors(),
          apiService.getRecommendations(),
          apiService.getRevenueTrend()
        ]);

        setSummary(summaryData);
        setDrivers(driversData);
        setRiskFactors(riskData);
        setRecommendations(recData);
        setRevenueTrend(trendData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ bgcolor: '#1565c0' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Revenue Intelligence Console
            </Typography>
          </Toolbar>
        </AppBar>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
          <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center', bgcolor: '#fff3cd', borderLeft: '4px solid #ff9800' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#856404', mb: 2 }}>
              Error Loading Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#856404', mb: 3 }}>
              {error}
            </Typography>
            <Typography variant="caption" sx={{ color: '#856404' }}>
              Make sure the backend server is running on http://localhost:3001
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#1565c0' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#42a5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#fff'
                }}
              />
            </Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              SkyGeni
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit">
            <MessageIcon />
          </IconButton>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <ChatIcon />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Summary Banner */}
      <Box sx={{ bgcolor: '#1565c0', color: 'white', py: 3, px: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            QTD Revenue: {formatCurrency(summary?.qtdRevenue || 0)}
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9 }}>
            Target: {formatCurrency(summary?.target || 0)}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              opacity: 0.9,
              color: (summary?.gapPercentage || 0) >= 0 ? '#4caf50' : '#ef5350'
            }}
          >
            {summary?.gapPercentage || 0}% to Goal
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 4, py: 3 }}>
        <Grid container spacing={3}>
          {/* Revenue Drivers */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#333' }}>
                Revenue Drivers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {drivers.map((driver, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {driver.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {driver.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: driver.change.startsWith('+') ? '#4caf50' : '#ef5350',
                            fontWeight: 600
                          }}
                        >
                          {driver.change}
                        </Typography>
                      </Box>
                    </Box>
                    <MiniChart
                      data={driver.trend}
                      color={driver.name === 'Win Rate' ? '#1976d2' : '#64b5f6'}
                      type={driver.name === 'Win Rate' ? 'bar' : 'line'}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Risk Factors & Recommendations */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Risk Factors */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 250 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                    Top Risk Factors
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {riskFactors.map((risk, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#ff9800',
                            mt: 0.75,
                            flexShrink: 0
                          }}
                        />
                        <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                          {risk.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              {/* Recommendations */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 250 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                    Recommended Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recommendations.map((rec, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#ff9800',
                            mt: 0.75,
                            flexShrink: 0
                          }}
                        />
                        <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                          {rec.action}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              {/* Revenue Trend */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                    Revenue Trend (Last 6 Months)
                  </Typography>
                  <RevenueTrendChart data={revenueTrend} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default App;
