import { format } from 'date-fns';
import { useQuery, useQueries } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, Flame, Beef, Dumbbell } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ConsistencyCalendar from '@/components/ConsistencyCalendar';

function usePublicSessionDates() {
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
      queryKey: ['public', 'calendar', year, month],
      queryFn: () => publicApi.getCalendar(year, month),
    })),
  });

  return results
    .map(r => r.data)
    .filter(Boolean)
    .flatMap(c => c!.sessions)
    .map(s => s.date);
}

export default function PublicDashboard() {
  const { data: kpiData, isLoading: loadingKPI } = useQuery({
    queryKey: ['public', 'kpi'],
    queryFn: publicApi.getKpi,
  });

  const { data: weightEntries = [] } = useQuery({
    queryKey: ['public', 'weight'],
    queryFn: publicApi.getWeight,
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['public', 'sessions'],
    queryFn: () => publicApi.getSessions(1, 5),
  });

  const sessionDates = usePublicSessionDates();

  const kpis = [
    { label: 'Current Weight', value: kpiData?.currentWeight ? `${kpiData.currentWeight} kg` : '—', icon: Scale },
    { label: "Today's Calories", value: `${Number(kpiData?.todayCalories) || 0}`, icon: Flame },
    { label: "Today's Protein", value: `${Number(kpiData?.todayProtein) || 0}g`, icon: Beef },
    { label: 'Weekly Sessions', value: `${kpiData?.weekSessionCount ?? 0}`, icon: Dumbbell },
  ];

  const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map(e => ({
    date: format(new Date(e.date), 'MMM d'),
    weight: e.weight,
  }));

  const sessions = sessionsData?.data ?? [];

  if (loadingKPI) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">Flori's Gym Progress 💪</h1>
        <p className="text-sm text-muted-foreground">Follow my fitness journey</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weight Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 16%)" />
                  <XAxis dataKey="date" stroke="hsl(215, 20%, 60%)" fontSize={12} />
                  <YAxis domain={['auto', 'auto']} stroke="hsl(215, 20%, 60%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 9%)',
                      border: '1px solid hsl(220, 30%, 16%)',
                      borderRadius: '8px',
                      color: 'hsl(210, 40%, 96%)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2}
                    fill="url(#weightGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsistencyCalendar sessionDates={sessionDates} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          ) : (
            <div className="space-y-6">
              {sessions.map((session) => (
                <div key={session.id} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{format(new Date(session.startedAt), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span className="text-primary font-medium">{session.dayType} — {session.plan}</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exercise</TableHead>
                        <TableHead className="text-right">Sets</TableHead>
                        <TableHead className="text-right">Weight</TableHead>
                        <TableHead className="text-right">Reps</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.exercises.map((ex) => (
                        <TableRow key={ex.id}>
                          <TableCell className="font-medium">{ex.name}</TableCell>
                          <TableCell className="text-right">{ex.sets.length}</TableCell>
                          <TableCell className="text-right">
                            {ex.sets.length ? `${ex.sets[0].weight}kg` : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {ex.sets.map(s => s.reps).join(', ')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
