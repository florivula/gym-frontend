import type {
  WeightEntry,
  FoodEntry,
  GymSession,
  Exercise,
  DashboardKPI,
  PaginatedSessions,
  CalendarData,
} from '@/types/gym';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || `API error: ${res.status}`);
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Weight
export const weightApi = {
  getAll: () => request<WeightEntry[]>('/weight'),
  create: (data: { weight: number; date: string }) =>
    request<WeightEntry>('/weight', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/weight/${id}`, { method: 'DELETE' }),
};

// Food
export const foodApi = {
  getByDate: (date: string) => request<FoodEntry[]>(`/food?date=${date}`),
  create: (data: { name: string; calories: number; protein: number; date: string; time: string }) =>
    request<FoodEntry>('/food', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/food/${id}`, { method: 'DELETE' }),
};

// Sessions
export const sessionsApi = {
  list: (page = 1, limit = 10) =>
    request<PaginatedSessions>(`/sessions?page=${page}&limit=${limit}`),
  getActive: async (): Promise<GymSession | null> => {
    try {
      return await request<GymSession>('/sessions/active');
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },
  getLatest: async (): Promise<GymSession | null> => {
    try {
      return await request<GymSession>('/sessions/latest');
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },
  start: (data: { plan: string; dayType: string }) =>
    request<GymSession>('/sessions/start', { method: 'POST', body: JSON.stringify(data) }),
  addExercise: (sessionId: number, data: { name: string; sets: { weight: number; reps: number; setNumber: number }[] }) =>
    request<Exercise>(`/sessions/${sessionId}/exercise`, { method: 'POST', body: JSON.stringify(data) }),
  complete: (sessionId: number) =>
    request<GymSession>(`/sessions/${sessionId}/complete`, { method: 'POST' }),
  delete: (sessionId: number) =>
    request<void>(`/sessions/${sessionId}`, { method: 'DELETE' }),
};

// Dashboard
export const dashboardApi = {
  getKPI: () => request<DashboardKPI>('/dashboard/kpi'),
  getCalendar: (year: number, month: number) =>
    request<CalendarData>(`/dashboard/calendar/${year}/${month}`),
};
