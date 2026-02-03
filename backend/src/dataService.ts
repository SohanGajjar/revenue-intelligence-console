import * as fs from 'fs';
import * as path from 'path';
import { Account, Rep, Deal, Activity, Target } from './types';

export class DataService {
  private accounts: Account[] = [];
  private reps: Rep[] = [];
  private deals: Deal[] = [];
  private activities: Activity[] = [];
  private targets: Target[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    const dataDir = path.join(__dirname, '../../', 'data');
    
    this.accounts = JSON.parse(fs.readFileSync(path.join(dataDir, 'accounts.json'), 'utf-8'));
    this.reps = JSON.parse(fs.readFileSync(path.join(dataDir, 'reps.json'), 'utf-8'));
    this.deals = JSON.parse(fs.readFileSync(path.join(dataDir, 'deals.json'), 'utf-8'));
    this.activities = JSON.parse(fs.readFileSync(path.join(dataDir, 'activities.json'), 'utf-8'));
    this.targets = JSON.parse(fs.readFileSync(path.join(dataDir, 'targets.json'), 'utf-8'));
  }

  getAccounts(): Account[] {
    return this.accounts;
  }

  getReps(): Rep[] {
    return this.reps;
  }

  getDeals(): Deal[] {
    return this.deals;
  }

  getActivities(): Activity[] {
    return this.activities;
  }

  getTargets(): Target[] {
    return this.targets;
  }

  getAccountById(id: string): Account | undefined {
    return this.accounts.find(a => a.id === id);
  }

  getRepById(id: string): Rep | undefined {
    return this.reps.find(r => r.id === id);
  }
}
