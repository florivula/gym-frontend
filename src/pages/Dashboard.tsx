import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, Flame, Beef, Dumbbell } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeightEntry, FoodEntry, GymSession } from '@/types/gym';
import ConsistencyCalendar from '@/components/ConsistencyCalendar';

export default function Dashboard() {
  const [weights] = useLocalStorage<WeightEntry[]>('gym-weights', []);
  const [foods] = useLocalStorage<FoodEntry[]>('gym-foods', []);
  const [sessions] = useLocalStorage<GymSession[]>('gym-sessions', []);

  const today = format(new Date(), 'yyyy-MM-dd');

  const currentWeight = weights.length
    ? [...weights].sort((a, b) => b.date.localeCompare(a.date))[0].weight
    : null;

  const todayFoods = foods.filter(f => f.date === today);
  const todayCalories = todayFoods.reduce((s, f) => s + f.calories, 0);
  const todayProtein = todayFoods.reduce((s, f) => s + f.protein, 0);

  const weekSessions = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return sessions.filter(s => s.completed && isWithinInterval(new Date(s.date), { start, end })).length;
  }, [sessions]);

  const lastSession = useMemo(() => {
    const completed = sessions.filter(s => s.completed).sort((a, b) => b.date.localeCompare(a.date));
    return completed[0] || null;
  }, [sessions]);

  const sessionDates = useMemo(
    () => sessions.filter(s => s.completed).map(s => s.date),
    [sessions]
  );

  const kpis = [
    { label: 'Current Weight', value: currentWeight ? `${currentWeight} kg` : '—', icon: Scale },
    { label: "Today's Calories", value: `${todayCalories}`, icon: Flame },
    { label: "Today's Protein", value: `${todayProtein}g`, icon: Beef },
    { label: 'Weekly Sessions', value: `${weekSessions}`, icon: Dumbbell },
  ];

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
                <span>{format(new Date(lastSession.date), 'MMM d, yyyy')}</span>
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
                  {lastSession.exercises.map((ex, i) => (
                    <TableRow key={i}>
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
