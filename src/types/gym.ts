export interface WeightEntry {
  id: number;
  date: string; // ISO date string YYYY-MM-DD
  weight: number;
  createdAt: string;
}

export interface FoodEntry {
  id: number;
  date: string;
  time: string; // HH:mm
  name: string;
  calories: number;
  protein: number;
  createdAt: string;
}

export interface SavedFood {
  id: number;
  name: string;
  calories: number;
  protein: number;
  createdAt: string;
}

export interface ExerciseSet {
  id: number;
  exerciseId: number;
  weight: number;
  reps: number;
  setNumber: number;
}

export interface Exercise {
  id: number;
  sessionId: number;
  name: string;
  sets: ExerciseSet[];
  createdAt: string;
}

export interface GymSession {
  id: number;
  plan: string;
  dayType: string;
  exercises: Exercise[];
  isActive: boolean;
  startedAt: string; // ISO string
  completedAt: string | null;
}

export interface DashboardKPI {
  currentWeight: number | null;
  todayCalories: number;
  todayProtein: number;
  weekSessionCount: number;
}

export interface PaginatedSessions {
  data: GymSession[];
  page: number;
  limit: number;
  total: number;
}

export interface CalendarData {
  year: number;
  month: number;
  weights: { date: string; weight: number }[];
  food: { date: string; totalCalories: number; totalProtein: number; entryCount: number }[];
  sessions: { date: string; plan: string; dayType: string }[];
}

export type WorkoutPlan = 'PPL' | 'ULPPL' | 'FBEOD' | 'Other';

export const PLAN_DAY_TYPES: Record<WorkoutPlan, string[]> = {
  PPL: ['Push', 'Pull', 'Legs'],
  ULPPL: ['Upper', 'Lower', 'Push', 'Pull', 'Legs'],
  FBEOD: ['Full Body'],
  Other: ['Custom'],
};
