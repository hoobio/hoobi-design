/**
 * A five-field cron matcher, small enough to keep the library dependency-free. Supports
 * `*`, numbers, lists, ranges and steps (`*​/n`, `a-b/n`) on minute, hour, day-of-month,
 * month and weekday - the subset node-cron and the arr apps actually use. No seconds
 * field, no names (`MON`, `JAN`), no `L`/`#`.
 */

export interface CronResult {
  /** Present when the expression parses and matches something inside the horizon. */
  runs?: Date[];
  /** Present otherwise, naming the field that failed. */
  error?: string;
}

const FIELDS = ['minute', 'hour', 'day', 'month', 'weekday'] as const;
const RANGES: [number, number][] = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7],
];

/** One field to the set of values it matches, or null when it is not valid. */
export function parseCronField(field: string, min: number, max: number): Set<number> | null {
  const out = new Set<number>();
  for (const part of field.split(',')) {
    if (part === '*') {
      for (let i = min; i <= max; i++) out.add(i);
      continue;
    }
    const step = /^\*\/(\d+)$/.exec(part);
    if (step) {
      const by = Number(step[1]);
      if (!by) return null;
      for (let i = min; i <= max; i += by) out.add(i);
      continue;
    }
    const range = /^(\d+)-(\d+)(?:\/(\d+))?$/.exec(part);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      const by = range[3] ? Number(range[3]) : 1;
      if (from < min || to > max || from > to || !by) return null;
      for (let i = from; i <= to; i += by) out.add(i);
      continue;
    }
    if (/^\d+$/.test(part)) {
      const n = Number(part);
      if (n < min || n > max) return null;
      out.add(n);
      continue;
    }
    return null;
  }
  return out;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad = (n: number) => String(n).padStart(2, '0');
const num = (field: string, min: number, max: number): number | null => {
  if (!/^\d+$/.test(field)) return null;
  const n = Number(field);
  return n >= min && n <= max ? n : null;
};
const every = (field: string): number | null => {
  if (field === '*') return 1;
  const step = /^\*\/(\d+)$/.exec(field);
  return step && Number(step[1]) > 0 ? Number(step[1]) : null;
};

/**
 * Plain words for the common shapes: `20 5 * * *` is "Every day at 05:20", `10 *​/6 * * *`
 * "Every 6 hours at :10". Null for anything else, so the caller shows the expression.
 */
export function describeCron(expression: string): string | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [minute, hour, day, month, weekday] = parts as [string, string, string, string, string];
  if (month !== '*') return null;
  const m = num(minute, 0, 59);
  const h = num(hour, 0, 23);
  if (day === '*' && weekday === '*') {
    if (hour === '*') {
      const by = every(minute);
      if (by !== null) return by === 1 ? 'Every minute' : `Every ${String(by)} minutes`;
    }
    if (m === null) return null;
    if (h !== null) return `Every day at ${pad(h)}:${pad(m)}`;
    const hours = every(hour);
    if (hours === null) return null;
    return hours === 1 ? `Every hour at :${pad(m)}` : `Every ${String(hours)} hours at :${pad(m)}`;
  }
  if (m === null || h === null) return null;
  const at = `${pad(h)}:${pad(m)}`;
  const wd = num(weekday, 0, 7);
  if (day === '*' && wd !== null) return `Every ${DAYS[wd % 7] as string} at ${at}`;
  const d = num(day, 1, 31);
  if (weekday === '*' && d !== null) return `On day ${String(d)} of every month at ${at}`;
  return null;
}

/** Minutes in the search horizon: 366 days, so a yearly expression still resolves. */
const HORIZON_MINUTES = 366 * 24 * 60;

/**
 * The next `count` firings, by stepping a minute at a time. Brute force on purpose: a
 * correct interval solver is a page of date arithmetic, and 527k cheap set lookups is
 * a few milliseconds for the one case that walks the whole horizon.
 */
export function cronRuns(expression: string, count = 3, from: Date = new Date()): CronResult {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5 || parts[0] === '') {
    return {
      error: `Expected 5 fields, got ${String(parts[0] === '' ? 0 : parts.length)}: minute hour day month weekday.`,
    };
  }

  const sets: Set<number>[] = [];
  for (let i = 0; i < 5; i++) {
    const [min, max] = RANGES[i] as [number, number];
    const set = parseCronField(parts[i] as string, min, max);
    if (!set) {
      return {
        error: `"${parts[i] as string}" is not a valid ${FIELDS[i] as string} field (${String(min)}-${String(max)}).`,
      };
    }
    sets.push(set);
  }

  // Cron's weekday field takes both 0 and 7 for Sunday.
  const weekday = sets[4] as Set<number>;
  if (weekday.has(7)) weekday.add(0);

  const runs: Date[] = [];
  const t = new Date(from);
  t.setSeconds(0, 0);
  t.setMinutes(t.getMinutes() + 1);
  for (let i = 0; i < HORIZON_MINUTES && runs.length < count; i++) {
    if (
      (sets[0] as Set<number>).has(t.getMinutes()) &&
      (sets[1] as Set<number>).has(t.getHours()) &&
      (sets[2] as Set<number>).has(t.getDate()) &&
      (sets[3] as Set<number>).has(t.getMonth() + 1) &&
      weekday.has(t.getDay())
    ) {
      runs.push(new Date(t));
    }
    t.setMinutes(t.getMinutes() + 1);
  }

  return runs.length ? { runs } : { error: 'This expression never matches a real date.' };
}

/** `Mon 8 Sep, 14:05` - short enough for a caption, unambiguous about the day. */
export function formatCronRun(date: Date): string {
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** `in 12 min`, `in 3 h 20 min`, `in 4 days`. */
export function formatCronRelative(date: Date, from: Date = new Date()): string {
  const seconds = Math.round((date.getTime() - from.getTime()) / 1000);
  if (seconds < 60) return 'in under a minute';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `in ${String(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 48) return `in ${String(hours)} h${rest ? ` ${String(rest)} min` : ''}`;
  return `in ${String(Math.round(hours / 24))} days`;
}
