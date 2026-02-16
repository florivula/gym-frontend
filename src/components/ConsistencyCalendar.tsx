import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import {
  format, eachDayOfInterval, startOfMonth, endOfMonth,
  getDay, isFuture, isToday, addMonths,
} from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  sessionDates: string[];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const GAP = 3;
const START_YEAR = 2025;
const START_MONTH = 1; // January

function getMonths(): { year: number; month: number }[] {
  // From Jan 2025 up to 1 month after today
  const limit = addMonths(new Date(), 1);
  const months: { year: number; month: number }[] = [];
  let y = START_YEAR, m = START_MONTH;
  while (y < limit.getFullYear() || (y === limit.getFullYear() && m <= limit.getMonth() + 1)) {
    months.push({ year: y, month: m });
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

function getCurrentMonthIndex(months: { year: number; month: number }[]): number {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  return months.findIndex(m => m.year === cy && m.month === cm);
}

export default function ConsistencyCalendar({ sessionDates }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateSet = useMemo(() => new Set(sessionDates), [sessionDates]);
  const months = useMemo(getMonths, []);
  const currentIdx = useMemo(() => getCurrentMonthIndex(months), [months]);
  const [cellSize, setCellSize] = useState(0);

  const calcCellSize = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Each month panel is 1/3 of the visible width
    const panelWidth = el.clientWidth / 3;
    // Widest month has 6 week-columns; use 6 so all months share the same cell size
    const maxWeeks = 6;
    const size = Math.floor((panelWidth - GAP * (maxWeeks - 1)) / maxWeeks);
    setCellSize(Math.max(size, 10));
  }, []);

  // Calculate cell size on mount + resize
  useEffect(() => {
    calcCellSize();
    window.addEventListener('resize', calcCellSize);
    return () => window.removeEventListener('resize', calcCellSize);
  }, [calcCellSize]);

  // Scroll to center current month once cell size is known
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !cellSize) return;
    const panelWidth = el.clientWidth / 3;
    // Scroll so that currentIdx is the middle panel
    el.scrollLeft = Math.max(0, (currentIdx - 1) * panelWidth);
  }, [cellSize, currentIdx]);

  const panelStyle = { minWidth: 'calc(100% / 3)', maxWidth: 'calc(100% / 3)' };

  return (
    <div className="w-full">
      <div className="flex">
        {/* Fixed day-of-week labels */}
        <div className="flex flex-col shrink-0 pr-1.5" style={{ gap: GAP }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[10px] text-muted-foreground flex items-center justify-end"
              style={{ height: cellSize, width: 14 }}
            >
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Scrollable area */}
        <div
          ref={scrollRef}
          className="overflow-x-auto flex-1"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          <div className="flex">
            {months.map(({ year, month }, idx) => (
              <div
                key={`${year}-${month}`}
                style={{
                  ...panelStyle,
                  scrollSnapAlign: 'start',
                }}
                className="shrink-0 px-1"
              >
                {/* Month label */}
                <div className="text-[11px] font-medium text-muted-foreground mb-1.5 text-center">
                  {format(new Date(year, month - 1), months.length > 12 ? 'MMM yy' : 'MMM')}
                </div>

                {/* Grid */}
                {cellSize > 0 && (
                  <MonthGrid
                    year={year}
                    month={month}
                    dateSet={dateSet}
                    cellSize={cellSize}
                    isCurrent={idx === currentIdx}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground justify-end">
        <span>Rest</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-secondary" />
        <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
        <span>Workout</span>
      </div>
    </div>
  );
}

function MonthGrid({
  year,
  month,
  dateSet,
  cellSize,
}: {
  year: number;
  month: number;
  dateSet: Set<string>;
  cellSize: number;
  isCurrent: boolean;
}) {
  const weeks = useMemo(() => {
    const start = startOfMonth(new Date(year, month - 1));
    const days = eachDayOfInterval({ start, end: endOfMonth(start) });
    const leadingEmpty = getDay(start);

    const result: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = Array(leadingEmpty).fill(null);

    days.forEach((d) => {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      result.push(currentWeek);
    }

    return result;
  }, [year, month]);

  return (
    <div className="flex justify-center" style={{ gap: GAP }}>
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
          {week.map((day, di) => {
            if (!day) {
              return <div key={`e-${di}`} style={{ width: cellSize, height: cellSize }} />;
            }

            const key = format(day, 'yyyy-MM-dd');
            const future = isFuture(day);
            const today = isToday(day);
            const hasSession = dateSet.has(key);

            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <div
                    className={[
                      'rounded-sm',
                      future
                        ? 'bg-secondary/30'
                        : hasSession
                          ? 'bg-primary'
                          : 'bg-secondary',
                      today ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : '',
                    ].join(' ')}
                    style={{ width: cellSize, height: cellSize }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>{format(day, 'MMM d, yyyy')}</p>
                  {!future && <p>{hasSession ? 'Workout' : 'Rest day'}</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
}
