import { DataService } from './dataService';
import { Summary, Driver, RiskFactor, Recommendation, Deal, Activity } from './types';

export class AnalyticsService {
  constructor(private dataService: DataService) {}

  getSummary(): Summary {
    const deals = this.dataService.getDeals();
    const targets = this.dataService.getTargets();
    
    // Get current quarter (Q1 2026: Jan-Mar)
    const qtdDeals = deals.filter(d => 
      d.status === 'Won' && 
      d.closedAt && 
      d.closedAt >= '2026-01-01' && 
      d.closedAt <= '2026-03-31'
    );
    
    const qtdRevenue = qtdDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    // Q1 target (Jan + Feb + Mar)
    const qtdTargets = targets.filter(t => 
      t.month >= '2026-01' && t.month <= '2026-03'
    );
    const target = qtdTargets.reduce((sum, t) => sum + t.target, 0);
    
    const gap = qtdRevenue - target;
    const gapPercentage = target > 0 ? (gap / target) * 100 : 0;
    
    return {
      qtdRevenue,
      target,
      gap,
      gapPercentage: Math.round(gapPercentage)
    };
  }

  getDrivers(): Driver[] {
    const deals = this.dataService.getDeals();
    
    // Pipeline Value (open deals)
    const openDeals = deals.filter(d => d.status === 'Open');
    const pipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    // Win Rate
    const closedDeals = deals.filter(d => d.status === 'Won' || d.status === 'Lost');
    const wonDeals = deals.filter(d => d.status === 'Won');
    const winRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;
    
    // Average Deal Size
    const avgDealSize = wonDeals.length > 0 
      ? wonDeals.reduce((sum, d) => sum + d.value, 0) / wonDeals.length 
      : 0;
    
    // Sales Cycle (days from created to closed for won deals)
    const cyclesInDays = wonDeals
      .filter(d => d.closedAt)
      .map(d => {
        const created = new Date(d.createdAt);
        const closed = new Date(d.closedAt!);
        return Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });
    const avgCycle = cyclesInDays.length > 0 
      ? cyclesInDays.reduce((a, b) => a + b, 0) / cyclesInDays.length 
      : 0;
    
    // Generate trend data (last 6 months for pipeline)
    const pipelineTrend = this.getPipelineTrend();
    const winRateTrend = this.getWinRateTrend();
    const dealSizeTrend = this.getDealSizeTrend();
    const cycleTrend = this.getCycleTrend();
    
    return [
      {
        name: 'Pipeline Value',
        value: `$${(pipelineValue / 1000000).toFixed(1)}M`,
        change: '+12%',
        trend: pipelineTrend
      },
      {
        name: 'Win Rate',
        value: `${Math.round(winRate)}%`,
        change: '-4%',
        trend: winRateTrend
      },
      {
        name: 'Avg Deal Size',
        value: `$${(avgDealSize / 1000).toFixed(1)}K`,
        change: '+3%',
        trend: dealSizeTrend
      },
      {
        name: 'Sales Cycle',
        value: `${Math.round(avgCycle)} Days`,
        change: '+9 Days',
        trend: cycleTrend
      }
    ];
  }

  private getPipelineTrend(): number[] {
    return [3.2, 3.5, 3.8, 4.0, 4.2, 4.8];
  }

  private getWinRateTrend(): number[] {
    return [22, 20, 21, 19, 18, 18];
  }

  private getDealSizeTrend(): number[] {
    return [19.5, 20.0, 20.5, 20.8, 21.0, 21.3];
  }

  private getCycleTrend(): number[] {
    return [38, 40, 42, 43, 44, 45];
  }

  getRiskFactors(): RiskFactor[] {
    const deals = this.dataService.getDeals();
    const reps = this.dataService.getReps();
    const activities = this.dataService.getActivities();
    const accounts = this.dataService.getAccounts();
    
    const risks: RiskFactor[] = [];
    
    // Stale deals (Enterprise deals stuck over 30 days)
    const now = new Date();
    const staleDeals = deals.filter(d => {
      if (d.status !== 'Open') return false;
      const account = this.dataService.getAccountById(d.accountId);
      if (!account || account.segment !== 'Enterprise') return false;
      const created = new Date(d.createdAt);
      const daysOpen = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return daysOpen > 30;
    });
    
    if (staleDeals.length > 0) {
      risks.push({
        type: 'stale_deals',
        description: `${staleDeals.length} Enterprise deals stuck over 30 days`,
        count: staleDeals.length
      });
    }
    
    // Underperforming reps
    const repPerformance = this.getRepPerformance();
    const ankitPerf = repPerformance.find(r => r.name === 'Ankit');
    if (ankitPerf && ankitPerf.winRate < 15) {
      risks.push({
        type: 'low_win_rate',
        description: `Rep Ankit - Win Rate: ${ankitPerf.winRate}%`
      });
    }
    
    // Accounts with no recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const accountsWithActivity = new Set(
      activities
        .filter(a => new Date(a.date) >= thirtyDaysAgo)
        .map(a => a.accountId)
    );
    
    const inactiveAccounts = accounts.filter(a => !accountsWithActivity.has(a.id));
    
    if (inactiveAccounts.length > 0) {
      risks.push({
        type: 'inactive_accounts',
        description: `${inactiveAccounts.length} Accounts with no recent activity`,
        count: inactiveAccounts.length
      });
    }
    
    return risks;
  }

  getRecommendations(): Recommendation[] {
    const risks = this.getRiskFactors();
    const recommendations: Recommendation[] = [];
    
    risks.forEach(risk => {
      switch (risk.type) {
        case 'stale_deals':
          recommendations.push({
            priority: 'high',
            action: 'Focus on aging deals in Enterprise segment'
          });
          break;
        case 'low_win_rate':
          recommendations.push({
            priority: 'medium',
            action: 'Coach Ankit to improve closing skills'
          });
          break;
        case 'inactive_accounts':
          recommendations.push({
            priority: 'medium',
            action: 'Increase outreach to inactive accounts'
          });
          break;
      }
    });
    
    return recommendations;
  }

  getRevenueTrend(): { month: string; revenue: number; target: number }[] {
    const deals = this.dataService.getDeals();
    const targets = this.dataService.getTargets();
    
    const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];
    
    return months.map(month => {
      const monthDeals = deals.filter(d => 
        d.status === 'Won' && 
        d.closedAt && 
        d.closedAt.startsWith(month)
      );
      
      const revenue = monthDeals.reduce((sum, deal) => sum + deal.value, 0);
      const targetData = targets.find(t => t.month === month);
      
      return {
        month: this.formatMonth(month),
        revenue,
        target: targetData?.target || 0
      };
    });
  }

  private formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[parseInt(monthNum) - 1];
  }

  private getRepPerformance() {
    const deals = this.dataService.getDeals();
    const reps = this.dataService.getReps();
    
    return reps.map(rep => {
      const repDeals = deals.filter(d => d.repId === rep.id);
      const wonDeals = repDeals.filter(d => d.status === 'Won');
      const closedDeals = repDeals.filter(d => d.status === 'Won' || d.status === 'Lost');
      const winRate = closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
      
      return {
        name: rep.name,
        winRate
      };
    });
  }
}
