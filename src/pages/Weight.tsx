import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWeightEntries, useCreateWeight, useDeleteWeight } from '@/hooks/useApi';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export default function Weight() {
  const { data: entries = [], isLoading } = useWeightEntries();
  const createWeight = useCreateWeight();
  const deleteWeight = useDeleteWeight();

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState<Date>(new Date());

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const reversed = [...sorted].reverse();

  const handleSave = () => {
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 300) {
      toast.error('Enter a valid weight (20-300 kg)');
      return;
    }
    const dateStr = format(date, 'yyyy-MM-dd');
    createWeight.mutate(
      { weight: w, date: dateStr },
      {
        onSuccess: () => {
          setWeight('');
          toast.success('Weight saved');
        },
        onError: () => toast.error('Failed to save weight'),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteWeight.mutate(id, {
      onSuccess: () => toast.success('Entry deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  const chartData = sorted.map(e => ({
    date: format(new Date(e.date), 'MMM d'),
    weight: e.weight,
  }));

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Weight</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="75.0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full sm:w-[180px] justify-start text-left font-normal')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={d => d && setDate(d)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button onClick={handleSave} disabled={createWeight.isPending} className="w-full sm:w-auto">
            {createWeight.isPending ? 'Saving...' : 'Save Weight'}
          </Button>
        </CardContent>
      </Card>

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
          <CardTitle className="text-base">Weight Log</CardTitle>
        </CardHeader>
        <CardContent>
          {reversed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reversed.map((entry, i) => {
                  const prevEntry = reversed[i + 1];
                  const change = prevEntry ? entry.weight - prevEntry.weight : 0;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right font-medium">{entry.weight} kg</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1">
                          {change > 0 && <TrendingUp className="h-3 w-3 text-destructive" />}
                          {change < 0 && <TrendingDown className="h-3 w-3 text-primary" />}
                          {change === 0 && <Minus className="h-3 w-3 text-muted-foreground" />}
                          <span className={change > 0 ? 'text-destructive' : change < 0 ? 'text-primary' : 'text-muted-foreground'}>
                            {change !== 0 ? `${change > 0 ? '+' : ''}${change.toFixed(1)}` : '—'}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(entry.id)} disabled={deleteWeight.isPending}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
