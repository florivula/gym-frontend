import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dumbbell, Plus, Check, Trash2, ChevronDown } from 'lucide-react';
import { useActiveSession, useSessions, useStartSession, useAddExercise, useCompleteSession, useDeleteSession } from '@/hooks/useApi';
import { Exercise, WorkoutPlan, PLAN_DAY_TYPES } from '@/types/gym';
import { toast } from 'sonner';

export default function GymSession() {
  const { data: activeSession, isLoading: loadingActive } = useActiveSession();
  const { data: sessionsPage, isLoading: loadingHistory } = useSessions(1, 50);
  const startSession = useStartSession();
  const addExercise = useAddExercise();
  const completeSession = useCompleteSession();
  const deleteSession = useDeleteSession();

  // New session form
  const [plan, setPlan] = useState<WorkoutPlan>('PPL');
  const [dayType, setDayType] = useState(PLAN_DAY_TYPES['PPL'][0]);

  // Active session exercise form
  const [exerciseName, setExerciseName] = useState('');
  const [setWeight, setSetWeight] = useState('');
  const [setReps, setSetReps] = useState('');
  const [currentSets, setCurrentSets] = useState<{ weight: number; reps: number }[]>([]);

  const completedSessions = useMemo(
    () => (sessionsPage?.data ?? []).filter(s => !s.isActive).sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [sessionsPage]
  );

  const handleStartSession = () => {
    startSession.mutate(
      { plan, dayType },
      {
        onSuccess: () => toast.success('Session started!'),
        onError: () => toast.error('Failed to start session'),
      }
    );
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
    if (!activeSession) return;

    addExercise.mutate(
      {
        sessionId: activeSession.id,
        data: {
          name: exerciseName.trim(),
          sets: currentSets.map((s, i) => ({ weight: s.weight, reps: s.reps, setNumber: i + 1 })),
        },
      },
      {
        onSuccess: () => {
          setExerciseName('');
          setCurrentSets([]);
          toast.success('Exercise added');
        },
        onError: () => toast.error('Failed to add exercise'),
      }
    );
  };

  const handleCompleteSession = () => {
    if (!activeSession) return;
    completeSession.mutate(activeSession.id, {
      onSuccess: () => toast.success('Session completed!'),
      onError: () => toast.error('Failed to complete session'),
    });
  };

  const handleDeleteSession = (id: number) => {
    deleteSession.mutate(id, {
      onSuccess: () => toast.success('Session deleted'),
      onError: () => toast.error('Failed to delete session'),
    });
  };

  const totalVolume = (exercises: Exercise[]) =>
    exercises.reduce((t, ex) => t + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);

  if (loadingActive || loadingHistory) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

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
                  {format(new Date(activeSession.startedAt), 'h:mm a')}
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
            <Button onClick={handleStartSession} disabled={startSession.isPending} className="w-full sm:w-auto">
              <Dumbbell className="mr-2 h-4 w-4" /> {startSession.isPending ? 'Starting...' : 'Start Session'}
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

              <Button variant="secondary" onClick={handleCompleteExercise} disabled={addExercise.isPending} className="w-full">
                <Check className="mr-2 h-4 w-4" /> {addExercise.isPending ? 'Saving...' : 'Complete Exercise'}
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
                {activeSession.exercises.map((ex) => (
                  <div key={ex.id} className="flex items-start justify-between rounded-lg bg-secondary p-3">
                    <div>
                      <p className="font-medium text-sm">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ex.sets.map((s) => `${s.weight}kg×${s.reps}`).join(' | ')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Button onClick={handleCompleteSession} disabled={completeSession.isPending} className="w-full" size="lg">
            <Check className="mr-2 h-5 w-5" /> {completeSession.isPending ? 'Completing...' : 'Complete Session'}
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
                <div className="flex items-center gap-1">
                  <CollapsibleTrigger className="flex-1 min-w-0">
                    <div className="flex items-center justify-between rounded-lg bg-secondary p-3 hover:bg-secondary/80 transition-colors">
                      <div className="text-left">
                        <p className="font-medium text-sm">{format(new Date(session.startedAt), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.dayType} — {session.plan} • {session.exercises.length} exercises • {totalVolume(session.exercises).toLocaleString()} kg
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CollapsibleTrigger>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" disabled={deleteSession.isPending}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the {session.dayType} session from {format(new Date(session.startedAt), 'MMM d, yyyy')}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSession(session.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <CollapsibleContent>
                  <div className="mt-1 rounded-lg border border-border p-3 space-y-2">
                    {session.exercises.map((ex) => (
                      <div key={ex.id}>
                        <p className="text-sm font-medium">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.sets.map((s) => `Set ${s.setNumber}: ${s.weight}kg × ${s.reps}`).join(' • ')}
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
