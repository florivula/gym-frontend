import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, Flame, Beef, Dumbbell } from 'lucide-react';
import { useDashboardKPI, useLatestSession, useSessionDates } from '@/hooks/useApi';
import ConsistencyCalendar from '@/components/ConsistencyCalendar';

export default function Dashboard() {
  const { data: kpiData, isLoading: loadingKPI } = useDashboardKPI();
  const { data: lastSession } = useLatestSession();
  const sessionDates = useSessionDates();

  const kpis = [
    { label: 'Current Weight', value: kpiData?.currentWeight ? `${kpiData.currentWeight} kg` : '—', icon: Scale },
    { label: "Today's Calories", value: `${Number(kpiData?.todayCalories) || 0}`, icon: Flame },
    { label: "Today's Protein", value: `${Number(kpiData?.todayProtein) || 0}g`, icon: Beef },
    { label: 'Weekly Sessions', value: `${kpiData?.weekSessionCount ?? 0}`, icon: Dumbbell },
  ];

  if (loadingKPI) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Last Gym Session</CardTitle>
        </CardHeader>
        <CardContent>
          {lastSession ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{format(new Date(lastSession.startedAt), 'MMM d, yyyy')}</span>
                <span>•</span>
                <span className="text-primary font-medium">{lastSession.dayType} — {lastSession.plan}</span>
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
                  {lastSession.exercises.map((ex) => (
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
          ) : (
            <p className="text-sm text-muted-foreground">No sessions yet. Start your first workout!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsistencyCalendar sessionDates={sessionDates} />
        </CardContent>
      </Card>
    </div>
  );
}
