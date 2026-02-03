import axios from 'axios';
import { Summary, Driver, RiskFactor, Recommendation, RevenueTrendData } from './types';

const API_BASE = '/api';

export const apiService = {
  async getSummary(): Promise<Summary> {
    const response = await axios.get(`${API_BASE}/summary`);
    return response.data;
  },

  async getDrivers(): Promise<Driver[]> {
    const response = await axios.get(`${API_BASE}/drivers`);
    return response.data;
  },

  async getRiskFactors(): Promise<RiskFactor[]> {
    const response = await axios.get(`${API_BASE}/risk-factors`);
    return response.data;
  },

  async getRecommendations(): Promise<Recommendation[]> {
    const response = await axios.get(`${API_BASE}/recommendations`);
    return response.data;
  },

  async getRevenueTrend(): Promise<RevenueTrendData[]> {
    const response = await axios.get(`${API_BASE}/revenue-trend`);
    return response.data;
  }
};
