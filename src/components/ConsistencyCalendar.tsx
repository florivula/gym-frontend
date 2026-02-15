import { useMemo } from 'react';
import { format, subDays, startOfDay, eachDayOfInterval, getDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  sessionDates: string[]; // array of YYYY-MM-DD
}

export default function ConsistencyCalendar({ sessionDates }: Props) {
  const days = useMemo(() => {
    const today = startOfDay(new Date());
    const start = subDays(today, 119); // ~17 weeks
    const dateSet = new Set(sessionDates);
    return eachDayOfInterval({ start, end: today }).map(d => ({
      date: d,
      key: format(d, 'yyyy-MM-dd'),
      hasSession: dateSet.has(format(d, 'yyyy-MM-dd')),
      isToday: format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
    }));
  }, [sessionDates]);

  // Group by week (columns)
  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];
  days.forEach((day, i) => {
    if (i === 0) {
      // Pad the first week
      const dayOfWeek = getDay(day.date);
      for (let j = 0; j < dayOfWeek; j++) currentWeek.push(null as any);
    }
    currentWeek.push(day);
    if (getDay(day.date) === 6 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day ? (
                <Tooltip key={day.key}>
                  <TooltipTrigger asChild>
                    <div
                      className={`h-3 w-3 rounded-sm transition-colors ${
                        day.isToday
                          ? 'ring-1 ring-primary ring-offset-1 ring-offset-background'
                          : ''
                      } ${
                        day.hasSession
                          ? 'bg-primary'
                          : 'bg-secondary'
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>{format(day.date, 'MMM d, yyyy')}</p>
                    <p>{day.hasSession ? '🏋️ Workout' : 'Rest day'}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={`empty-${di}`} className="h-3 w-3" />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
