export interface Summary {
  qtdRevenue: number;
  target: number;
  gap: number;
  gapPercentage: number;
}

export interface Driver {
  name: string;
  value: string | number;
  change: string;
  trend: number[];
}

export interface RiskFactor {
  type: string;
  description: string;
  count?: number;
}

export interface Recommendation {
  priority: string;
  action: string;
}

export interface RevenueTrendData {
  month: string;
  revenue: number;
  target: number;
}
