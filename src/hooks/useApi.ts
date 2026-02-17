import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { weightApi, foodApi, sessionsApi, dashboardApi, authApi } from '@/lib/api';
import { PaginatedSessions } from '@/types/gym';

// ---- Profile ----

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: authApi.getProfile });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// ---- Weight ----

export function useWeightEntries() {
  return useQuery({ queryKey: ['weight'], queryFn: weightApi.getAll });
}

export function useCreateWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: weightApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weight'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: weightApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weight'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ---- Food ----

export function useFoodEntries(date: string) {
  return useQuery({ queryKey: ['food', date], queryFn: () => foodApi.getByDate(date) });
}

export function useCreateFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: foodApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['food'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: foodApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['food'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ---- Sessions ----

export function useSessions(page = 1, limit = 10) {
  return useQuery({ queryKey: ['sessions', page, limit], queryFn: () => sessionsApi.list(page, limit) });
}

export function useActiveSession() {
  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: sessionsApi.getActive,
  });
}

export function useLatestSession() {
  return useQuery({
    queryKey: ['sessions', 'latest'],
    queryFn: sessionsApi.getLatest,
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.start,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: Parameters<typeof sessionsApi.addExercise>[1] }) =>
      sessionsApi.addExercise(sessionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.complete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: (_data, sessionId) => {
      qc.setQueriesData<PaginatedSessions>(
        { queryKey: ['sessions'] },
        (old) => old ? { ...old, data: old.data.filter(s => s.id !== sessionId), total: old.total - 1 } : old
      );
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ---- Dashboard ----

export function useDashboardKPI() {
  return useQuery({ queryKey: ['dashboard', 'kpi'], queryFn: dashboardApi.getKPI });
}

export function useDashboardCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['dashboard', 'calendar', year, month],
    queryFn: () => dashboardApi.getCalendar(year, month),
  });
}

export function useSessionDates() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const months: { year: number; month: number }[] = [];
  let y = 2025, m = 1;
  while (y < currentYear || (y === currentYear && m <= currentMonth)) {
    months.push({ year: y, month: m });
    m++;
    if (m > 12) { m = 1; y++; }
  }

  const results = useQueries({
    queries: months.map(({ year, month }) => ({
      queryKey: ['dashboard', 'calendar', year, month],
      queryFn: () => dashboardApi.getCalendar(year, month),
    })),
  });

  const sessionDates = results
    .map(r => r.data)
    .filter(Boolean)
    .flatMap(c => c!.sessions)
    .map(s => s.date);

  return sessionDates;
}
