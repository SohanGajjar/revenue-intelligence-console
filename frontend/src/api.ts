import axios, { AxiosInstance } from 'axios';
import { Summary, Driver, RiskFactor, Recommendation, RevenueTrendData } from './types';

// Create axios instance with proper configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  async getSummary(): Promise<Summary> {
    try {
      const response = await apiClient.get<Summary>('/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      throw error;
    }
  },

  async getDrivers(): Promise<Driver[]> {
    try {
      const response = await apiClient.get<Driver[]>('/drivers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      throw error;
    }
  },

  async getRiskFactors(): Promise<RiskFactor[]> {
    try {
      const response = await apiClient.get<RiskFactor[]>('/risk-factors');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch risk factors:', error);
      throw error;
    }
  },

  async getRecommendations(): Promise<Recommendation[]> {
    try {
      const response = await apiClient.get<Recommendation[]>('/recommendations');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      throw error;
    }
  },

  async getRevenueTrend(): Promise<RevenueTrendData[]> {
    try {
      const response = await apiClient.get<RevenueTrendData[]>('/revenue-trend');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revenue trend:', error);
      throw error;
    }
  }
};
