export interface Account {
  id: string;
  name: string;
  segment: string;
  status: string;
  createdAt: string;
}

export interface Rep {
  id: string;
  name: string;
  email: string;
  team: string;
  hireDate: string;
}

export interface Deal {
  id: string;
  accountId: string;
  repId: string;
  value: number;
  status: string;
  stage: string;
  createdAt: string;
  closedAt: string | null;
}

export interface Activity {
  id: string;
  accountId: string;
  repId: string;
  type: string;
  date: string;
  notes: string;
}

export interface Target {
  month: string;
  target: number;
}

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
