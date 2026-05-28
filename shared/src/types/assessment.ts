export type Goal = 'WEALTH_CREATION' | 'RETIREMENT' | 'SHORT_TERM' | 'LONG_TERM' | 'EXPLORING';

export interface Assessment {
  id: string;
  userId: string;
  age: number;
  goal: Goal;
  createdAt: Date;
}
