'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { AvailabilityBlock } from '../services/availability-api';
import type { Job } from '../services/jobs-api';

type ViewMode = 'week' | 'month';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function startOfDay(date: Date): Date {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function addDays(date: Date, days: number): Date {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function getMonday(date: Date): Date {
  const clone = startOfDay(date);
  const day = clone.getDay(); // 0 = domingo .. 6 = sábado
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(clone, diff);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}

export interface AgendaCalendarProps {
  blocks: AvailabilityBlock[];
  jobs: Job[];
}

export function AgendaCalendar({ blocks, jobs }: AgendaCalendarProps) {
  const [today] = useState(() => new Date());
  const [view, setView] = useState<ViewMode>('week');
  const [anchor, setAnchor] = useState(() => startOfDay(today));

  const jobsByDay = useMemo(() => {
    const map = new Map<string, Job[]>();
    for (const job of jobs) {
      if (!job.scheduledStart) continue;
      const key = startOfDay(new Date(job.scheduledStart)).toISOString();
      const list = map.get(key) ?? [];
      list.push(job);
      map.set(key, list);
    }
    return map;
  }, [jobs]);

  function blockFor(date: Date): AvailabilityBlock | undefined {
    return blocks.find((block) => {
      const start = startOfDay(new Date(block.startDate));
      const end = startOfDay(new Date(block.endDate));
      return date >= start && date <= end;
    });
  }

  function jobsFor(date: Date): Job[] {
    return jobsByDay.get(startOfDay(date).toISOString()) ?? [];
  }

  const weekStart = getMonday(anchor);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const monthGridStart = getMonday(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(monthGridStart, index));

  function goPrev() {
    setAnchor((current) => addDays(current, view === 'week' ? -7 : -30));
  }
  function goNext() {
    setAnchor((current) => addDays(current, view === 'week' ? 7 : 30));
  }
  function goToday() {
    setAnchor(startOfDay(today));
  }

  const rangeLabel =
    view === 'week'
      ? `${formatDayHeader(weekStart)} — ${formatDayHeader(addDays(weekStart, 6))}`
      : anchor.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={goPrev} aria-label="Anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={goToday}>
            Hoje
          </Button>
          <Button size="sm" variant="outline" onClick={goNext} aria-label="Seguinte">
            <ChevronRight className="size-4" />
          </Button>
          <p className="ml-2 text-sm font-medium capitalize">{rangeLabel}</p>
        </div>
        <div className="flex gap-1.5">
          {(['week', 'month'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                view === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {mode === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {view === 'week' ? (
        <div className="mt-4 grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const block = blockFor(day);
            const dayJobs = jobsFor(day);
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={cn('min-h-[140px] rounded-xl border p-2', isToday ? 'border-primary' : 'border-border')}
              >
                <p className={cn('text-xs font-medium', isToday ? 'text-primary' : 'text-muted-foreground')}>
                  {WEEKDAY_LABELS[(day.getDay() + 6) % 7]} {day.getDate()}
                </p>
                {block ? (
                  <div className="mt-1.5 rounded-md bg-secondary px-2 py-1 text-[11px] text-muted-foreground">
                    Indisponível{block.reason ? ` — ${block.reason}` : ''}
                  </div>
                ) : null}
                <div className="mt-1.5 space-y-1">
                  {dayJobs.map((job) => (
                    <div key={job.id} className="rounded-md bg-primary/10 px-2 py-1 text-[11px] text-primary">
                      <p className="font-medium">
                        {new Date(job.scheduledStart!).toLocaleTimeString('pt-PT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="truncate">{job.serviceRequestTitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((label) => (
            <p key={label} className="text-center text-xs font-medium text-muted-foreground">
              {label}
            </p>
          ))}
          {monthDays.map((day) => {
            const block = blockFor(day);
            const dayJobs = jobsFor(day);
            const inMonth = day.getMonth() === anchor.getMonth();
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex min-h-[64px] flex-col rounded-lg border p-1.5 text-xs',
                  inMonth ? 'border-border' : 'border-transparent text-muted-foreground/40',
                  isToday && 'border-primary',
                )}
              >
                <span className={cn('font-medium', isToday && 'text-primary')}>{day.getDate()}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {block ? <span className="size-1.5 rounded-full bg-muted-foreground" title="Indisponível" /> : null}
                  {dayJobs.map((job) => (
                    <span key={job.id} className="size-1.5 rounded-full bg-primary" title={job.serviceRequestTitle} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
