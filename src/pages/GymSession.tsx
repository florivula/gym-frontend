import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dumbbell, Plus, Check, Trash2, ChevronDown } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GymSession as GymSessionType, Exercise, ExerciseSet, WorkoutPlan, PLAN_DAY_TYPES } from '@/types/gym';
import { toast } from 'sonner';

export default function GymSession() {
  const [sessions, setSessions] = useLocalStorage<GymSessionType[]>('gym-sessions', []);

  // New session form
  const [plan, setPlan] = useState<WorkoutPlan>('PPL');
  const [dayType, setDayType] = useState(PLAN_DAY_TYPES['PPL'][0]);

  // Active session state
  const [exerciseName, setExerciseName] = useState('');
  const [setWeight, setSetWeight] = useState('');
  const [setReps, setSetReps] = useState('');
  const [currentSets, setCurrentSets] = useState<ExerciseSet[]>([]);

  const activeSession = sessions.find(s => !s.completed);
  const completedSessions = useMemo(
    () => sessions.filter(s => s.completed).sort((a, b) => b.date.localeCompare(a.date)),
    [sessions]
  );

  const handleStartSession = () => {
    const session: GymSessionType = {
      id: crypto.randomUUID(),
      date: format(new Date(), 'yyyy-MM-dd'),
      plan,
      dayType,
      exercises: [],
      completed: false,
      startTime: new Date().toISOString(),
    };
    setSessions(prev => [...prev, session]);
    toast.success('Session started!');
  };

  const handleAddSet = () => {
    const w = parseFloat(setWeight);
    const r = parseInt(setReps);
    if (!w || w <= 0 || !r || r <= 0) { toast.error('Enter valid weight and reps'); return; }
    setCurrentSets(prev => [...prev, { weight: w, reps: r }]);
    setSetWeight('');
    setSetReps('');
  };

  const handleCompleteExercise = () => {
    if (!exerciseName.trim()) { toast.error('Enter exercise name'); return; }
    if (currentSets.length === 0) { toast.error('Add at least one set'); return; }

    const exercise: Exercise = { name: exerciseName.trim(), sets: [...currentSets] };
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession?.id
          ? { ...s, exercises: [...s.exercises, exercise] }
          : s
      )
    );
    setExerciseName('');
    setCurrentSets([]);
    toast.success('Exercise added');
  };

  const handleRemoveExercise = (index: number) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession?.id
          ? { ...s, exercises: s.exercises.filter((_, i) => i !== index) }
          : s
      )
    );
  };

  const handleCompleteSession = () => {
    setSessions(prev =>
      prev.map(s => (s.id === activeSession?.id ? { ...s, completed: true } : s))
    );
    toast.success('Session completed! 💪');
  };

  const totalVolume = (exercises: Exercise[]) =>
    exercises.reduce((t, ex) => t + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gym Session</h1>

      {/* Active Session Banner */}
      {activeSession && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/20 p-2">
                <Dumbbell className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-sm">Session in progress</p>
                <p className="text-xs text-muted-foreground">
                  {activeSession.dayType} — {activeSession.plan} • Started{' '}
                  {format(new Date(activeSession.startTime), 'h:mm a')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start New Session */}
      {!activeSession && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start New Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={plan} onValueChange={v => { setPlan(v as WorkoutPlan); setDayType(PLAN_DAY_TYPES[v as WorkoutPlan][0]); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PLAN_DAY_TYPES) as WorkoutPlan[]).map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Day Type</Label>
                <Select value={dayType} onValueChange={setDayType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLAN_DAY_TYPES[plan].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleStartSession} className="w-full sm:w-auto">
              <Dumbbell className="mr-2 h-4 w-4" /> Start Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* During Session */}
      {activeSession && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Exercise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Exercise Name</Label>
                <Input placeholder="Bench Press" value={exerciseName} onChange={e => setExerciseName(e.target.value)} />
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" placeholder="60" value={setWeight} onChange={e => setSetWeight(e.target.value)} />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Reps</Label>
                  <Input type="number" placeholder="10" value={setReps} onChange={e => setSetReps(e.target.value)} />
                </div>
                <Button variant="secondary" size="icon" onClick={handleAddSet}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {currentSets.length > 0 && (
                <div className="space-y-1">
                  {currentSets.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md bg-secondary px-3 py-1.5 text-sm">
                      <span>Set {i + 1}: {s.weight}kg × {s.reps} reps</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentSets(prev => prev.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="secondary" onClick={handleCompleteExercise} className="w-full">
                <Check className="mr-2 h-4 w-4" /> Complete Exercise
              </Button>
            </CardContent>
          </Card>

          {/* Current exercises */}
          {activeSession.exercises.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex justify-between items-center">
                  <span>Exercises ({activeSession.exercises.length})</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Volume: {totalVolume(activeSession.exercises).toLocaleString()} kg
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeSession.exercises.map((ex, i) => (
                  <div key={i} className="flex items-start justify-between rounded-lg bg-secondary p-3">
                    <div>
                      <p className="font-medium text-sm">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ex.sets.map((s, j) => `${s.weight}kg×${s.reps}`).join(' | ')}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveExercise(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Button onClick={handleCompleteSession} className="w-full" size="lg">
            <Check className="mr-2 h-5 w-5" /> Complete Session
          </Button>
        </>
      )}

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {completedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
          ) : (
            completedSessions.map(session => (
              <Collapsible key={session.id}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between rounded-lg bg-secondary p-3 hover:bg-secondary/80 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-sm">{format(new Date(session.date), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.dayType} — {session.plan} • {session.exercises.length} exercises • {totalVolume(session.exercises).toLocaleString()} kg
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-1 rounded-lg border border-border p-3 space-y-2">
                    {session.exercises.map((ex, i) => (
                      <div key={i}>
                        <p className="text-sm font-medium">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.sets.map((s, j) => `Set ${j + 1}: ${s.weight}kg × ${s.reps}`).join(' • ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
