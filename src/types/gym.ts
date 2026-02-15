export interface WeightEntry {
  date: string; // ISO date string YYYY-MM-DD
  weight: number;
}

export interface FoodEntry {
  id: string;
  date: string;
  time: string; // HH:mm
  name: string;
  calories: number;
  protein: number;
}

export interface ExerciseSet {
  weight: number;
  reps: number;
}

export interface Exercise {
  name: string;
  sets: ExerciseSet[];
}

export interface GymSession {
  id: string;
  date: string;
  plan: string;
  dayType: string;
  exercises: Exercise[];
  completed: boolean;
  startTime: string; // ISO string
}

export type WorkoutPlan = 'PPL' | 'ULPPL' | 'FBEOD' | 'Other';

export const PLAN_DAY_TYPES: Record<WorkoutPlan, string[]> = {
  PPL: ['Push', 'Pull', 'Legs'],
  ULPPL: ['Upper', 'Lower', 'Push', 'Pull', 'Legs'],
  FBEOD: ['Full Body'],
  Other: ['Custom'],
};
