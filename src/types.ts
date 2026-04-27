export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface StackItem {
  id: string;
  name: string;
  category: string;
  monthlyCost: number;
  description?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  impact: ImpactLevel;
  potentialSavings: number;
  action: string;
  category: 'cost' | 'performance' | 'ecosystem' | 'security';
  timestamp: number;
}

export interface UserContext {
  onboarded: boolean;
  stack: StackItem[];
  monthlyBudget: number;
  mainFocus: string;
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface ScanResult {
  alerts: Alert[];
  healthScore: number;
  totalPotentialSavings: number;
  runwayImpactMonths: number;
}
