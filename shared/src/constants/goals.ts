import { Goal } from '../types/assessment';

export const GOAL_LABELS: Record<Goal, string> = {
  WEALTH_CREATION: 'Wealth Creation',
  RETIREMENT: 'Retirement Planning',
  SHORT_TERM: 'Short-term Goal (1-3 years)',
  LONG_TERM: 'Long-term Goal (5+ years)',
  EXPLORING: 'Just Exploring',
};

export const GOAL_HORIZONS_MONTHS: Record<Goal, number> = {
  WEALTH_CREATION: 120,
  RETIREMENT: 240,
  SHORT_TERM: 24,
  LONG_TERM: 60,
  EXPLORING: 36,
};

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'WEALTH_CREATION', label: 'Wealth Creation' },
  { value: 'RETIREMENT', label: 'Retirement Planning' },
  { value: 'SHORT_TERM', label: 'Short-term Goal (1-3 years)' },
  { value: 'LONG_TERM', label: 'Long-term Goal (5+ years)' },
  { value: 'EXPLORING', label: 'Just Exploring' },
];
