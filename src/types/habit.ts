export type HabitType = 'good' | 'bad';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  color?: string;
  createdAt: string;
  archived?: boolean;
}

export interface HabitLog {
  habitId: string;
  date: string; // ISO date string YYYY-MM-DD
  completed: boolean;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completionRate: number;
}

export interface DayData {
  date: string;
  habits: Map<string, boolean>; // habitId -> completed
}

export interface DayActivityDetail {
  goodCompleted: number;
  goodTotal: number;
  badCompleted: number;
  badTotal: number;
  netScore: number;
}
