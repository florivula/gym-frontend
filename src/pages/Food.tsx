import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { useFoodEntries, useCreateFood, useDeleteFood, useProfile } from '@/hooks/useApi';
import { toast } from 'sonner';

export default function Food() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: todayEntries = [], isLoading } = useFoodEntries(today);
  const { data: profile } = useProfile();
  const createFood = useCreateFood();
  const deleteFood = useDeleteFood();

  const calorieGoal = profile?.dailyCalorieGoal;
  const proteinGoal = profile?.dailyProteinGoal;

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));

  const sortedEntries = [...todayEntries].sort((a, b) => a.time.localeCompare(b.time));

  const totalCalories = sortedEntries.reduce((s, e) => s + Number(e.calories), 0);
  const totalProtein = sortedEntries.reduce((s, e) => s + Number(e.protein), 0);

  const handleAdd = () => {
    if (!name.trim()) { toast.error('Enter a food name'); return; }
    const cal = parseInt(calories);
    const prot = parseInt(protein);
    if (!cal || cal < 0) { toast.error('Enter valid calories'); return; }

    createFood.mutate(
      { name: name.trim(), calories: cal, protein: prot || 0, date: today, time },
      {
        onSuccess: () => {
          setName('');
          setCalories('');
          setProtein('');
          setTime(format(new Date(), 'HH:mm'));
          toast.success('Food added');
        },
        onError: () => toast.error('Failed to add food'),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteFood.mutate(id, {
      onSuccess: () => toast.success('Entry deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Food</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Food Name</Label>
              <Input placeholder="Chicken breast" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Calories</Label>
              <Input type="number" placeholder="350" value={calories} onChange={e => setCalories(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input type="number" placeholder="30" value={protein} onChange={e => setProtein(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={createFood.isPending} className="w-full sm:w-auto">
            {createFood.isPending ? 'Adding...' : 'Add Food'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground italic">Saved foods will appear here in future updates</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Calories</span>
              <span className="font-medium">
                {totalCalories}{calorieGoal ? ` / ${calorieGoal}` : ''} kcal
              </span>
            </div>
            {calorieGoal && (
              <Progress value={Math.min((totalCalories / calorieGoal) * 100, 100)} className="h-2" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Protein</span>
              <span className="font-medium">
                {totalProtein}{proteinGoal ? ` / ${proteinGoal}` : ''}g
              </span>
            </div>
            {proteinGoal && (
              <Progress value={Math.min((totalProtein / proteinGoal) * 100, 100)} className="h-2" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today's Food Log</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No food logged today.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Food</TableHead>
                  <TableHead className="text-right">Cal</TableHead>
                  <TableHead className="text-right">Protein</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntries.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">{entry.time}</TableCell>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell className="text-right">{entry.calories}</TableCell>
                    <TableCell className="text-right">{entry.protein}g</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(entry.id)} disabled={deleteFood.isPending}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell />
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">{totalCalories}</TableCell>
                  <TableCell className="text-right font-bold">{totalProtein}g</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
