import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from './cx.js';
import { SearchIcon } from './icons.js';
import { Switch } from './Switch.js';
import { tipAnchor } from './tip.js';

export type LogTag = 'DEBUG' | 'VERBOSE' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
export type LogTone = 'mute' | 'dim' | 'accent' | 'success' | 'warn' | 'danger';

export interface LogLevel {
  tag: string;
  tone: LogTone;
  /** Hidden until its chip is pressed: the chatter level. */
  off?: boolean;
  /** The row takes the surface fill: the level that must not be scrolled past. */
  raised?: boolean;
}

/** The syslog-shaped default. Pass `levels` for any other set. */
export const LOG_LEVELS: LogLevel[] = [
  { tag: 'DEBUG', tone: 'mute', off: true },
  { tag: 'VERBOSE', tone: 'dim' },
  { tag: 'INFO', tone: 'accent' },
  { tag: 'SUCCESS', tone: 'success' },
  { tag: 'WARNING', tone: 'warn' },
  { tag: 'ERROR', tone: 'danger', raised: true },
];

export interface LogLine {
  /** ISO timestamp. */
  ts: string;
  /** One of the `levels` tags. */
  tag: string;
  /** The [context] between tag and message: an issue id, MONITOR, SWEEP. */
  ctx?: string;
  message: string;
  /** Continuation lines (a stack), folded by default. */
  extra?: string[];
}

export interface LogViewerProps {
  lines: LogLine[];
  /** The level set, in chip order. Defaults to LOG_LEVELS. */
  levels?: LogLevel[];
  /** Placeholder while `lines` is empty and still loading. */
  loading?: boolean;
  /** Called when the user scrolls to the top with older lines available. */
  onLoadOlder?: () => void;
  className?: string;
}

const TONE: Record<LogTone, string> = {
  mute: 'text-text-mute',
  dim: 'text-text-dim',
  accent: 'text-accent-cyan',
  success: 'text-success',
  warn: 'text-warn',
  danger: 'text-danger',
};
const REGEX_QUERY = /^\/(.+)\/([a-z]*)$/;

/** "sonarr" is a substring; "/queue \d+/i" is a regex. An invalid regex falls back to substring. */
function compile(q: string, global: boolean): RegExp | null {
  const t = q.trim();
  if (!t) return null;
  const m = REGEX_QUERY.exec(t);
  if (m) {
    try {
      const flags = m[2] ?? '';
      return new RegExp(m[1] ?? '', global && !flags.includes('g') ? `${flags}g` : flags);
    } catch {
      /* not a regex after all: treat the whole thing as text */
    }
  }
  return new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), global ? 'gi' : 'i');
}

function highlight(text: string, re: RegExp | null): ReactNode {
  if (!re) return text;
  const out: ReactNode[] = [];
  let last = 0;
  for (const hit of text.matchAll(re)) {
    if (hit[0] === '') break;
    const i = hit.index;
    if (i > last) out.push(text.slice(last, i));
    out.push(
      <mark key={i} className="rounded-xs bg-warn/20 text-warn">
        {hit[0]}
      </mark>,
    );
    last = i + hit[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** 2026-09-06T14:02:11.204Z -> 09-06 14:02:11.204, local time. */
function shortTs(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

/**
 * The log file, in the browser: a filter bar (search, one chip per level with a count, a
 * context chip when one is pinned, Follow) over a mono list on the chip fill. Filtering is
 * client-side over whatever `lines` holds; the parent owns fetching and tailing.
 */
export function LogViewer({
  lines,
  levels = LOG_LEVELS,
  loading = false,
  onLoadOlder,
  className,
}: LogViewerProps) {
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(levels.filter((l) => l.off).map((l) => l.tag)),
  );
  const [ctx, setCtx] = useState<string | null>(null);
  const [follow, setFollow] = useState(true);
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [pending, setPending] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const seen = useRef(lines.length);

  const counts = useMemo(() => {
    const c = new Map<string, number>(levels.map((l) => [l.tag, 0]));
    for (const l of lines) c.set(l.tag, (c.get(l.tag) ?? 0) + 1);
    return c;
  }, [lines, levels]);
  const level = useMemo(() => new Map(levels.map((l) => [l.tag, l])), [levels]);

  const match = useMemo(() => compile(query, false), [query]);
  const marker = useMemo(() => compile(query, true), [query]);
  const shown = useMemo(
    () =>
      lines
        .map((l, i) => [l, i] as const)
        .filter(
          ([l]) =>
            !hidden.has(l.tag) &&
            (ctx === null || l.ctx === ctx) &&
            (match === null ||
              match.test(`${l.ctx ?? ''} ${l.message} ${(l.extra ?? []).join('\n')}`)),
        ),
    [lines, hidden, ctx, match],
  );

  // Following: stick to the bottom as lines arrive. Not following: count what arrived.
  useEffect(() => {
    const el = listRef.current;
    const added = lines.length - seen.current;
    seen.current = lines.length;
    if (!el || added <= 0) return;
    if (follow) el.scrollTop = el.scrollHeight;
    else setPending((n) => n + added);
  }, [lines.length, follow]);

  useEffect(() => {
    if (!follow) return;
    setPending(0);
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [follow, shown.length]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    if (!atBottom && follow) setFollow(false);
    if (el.scrollTop < 40) onLoadOlder?.();
  };

  const toggle = <T,>(set: (fn: (s: Set<T>) => Set<T>) => void, key: T) => {
    set((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  };

  return (
    <div className={cx('flex min-h-0 min-w-0 flex-1 flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-8 w-80 max-w-full items-center gap-2 rounded-control bg-chip px-2.5">
          <SearchIcon className="size-4 text-text-mute" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="search, or /regex/i"
            spellCheck={false}
            className="mono min-w-0 flex-1 border-0 bg-transparent text-body text-text placeholder:font-sans placeholder:text-text-mute"
          />
          {query ? (
            <span className="text-caption-small text-text-mute tabular-nums">
              {shown.length.toLocaleString()} of {lines.length.toLocaleString()}
            </span>
          ) : null}
        </label>
        <span aria-hidden className="mx-1 h-5 w-px bg-surface-raised" />
        {levels.map(({ tag: t, tone }) => {
          const off = hidden.has(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={!off}
              onClick={() => {
                toggle(setHidden, t);
              }}
              className={cx(
                'inline-flex h-7 items-center gap-1.5 rounded-control px-2.5 text-caption transition-colors',
                off ? 'bg-chip text-text-mute line-through' : cx('bg-surface-raised', TONE[tone]),
              )}
            >
              {t.toLowerCase()}
              {!off ? (
                <span className="text-text-mute tabular-nums">
                  {(counts.get(t) ?? 0).toLocaleString()}
                </span>
              ) : null}
            </button>
          );
        })}
        {ctx !== null ? (
          <>
            <span aria-hidden className="mx-1 h-5 w-px bg-surface-raised" />
            <button
              type="button"
              onClick={() => {
                setCtx(null);
              }}
              className="inline-flex h-7 items-center gap-1.5 rounded-control bg-surface-raised px-2.5 text-caption text-accent-purple"
            >
              <code>{ctx}</code>
              <span aria-hidden className="text-text-mute">
                ×
              </span>
            </button>
          </>
        ) : null}
        <span className="ml-auto flex items-center">
          <Switch label="Follow" checked={follow} onCheckedChange={setFollow} />
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={listRef}
          onScroll={onScroll}
          className="mono styled-scrollbar h-full min-h-64 overflow-auto rounded-panel bg-chip py-3 text-caption leading-[22px] text-text"
        >
          {loading && lines.length === 0 ? (
            <p className="px-4 font-sans text-text-mute">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="px-4 font-sans text-text-mute">Nothing matches.</p>
          ) : (
            shown.map(([l, i]) => {
              const folded = l.extra !== undefined && l.extra.length > 0;
              const isOpen = open.has(i);
              return (
                <div
                  key={i}
                  className={cx(
                    'grid min-w-140 grid-cols-[150px_76px_auto_1fr] items-start gap-x-3 px-4 hover:bg-surface',
                    level.get(l.tag)?.raised && 'bg-surface',
                  )}
                >
                  <span className="text-text-mute tabular-nums">{shortTs(l.ts)}</span>
                  <span className={TONE[level.get(l.tag)?.tone ?? 'dim']}>{l.tag}</span>
                  {l.ctx ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCtx(l.ctx ?? null);
                      }}
                      {...tipAnchor('Filter to this context')}
                      className="tip-fixed text-left whitespace-nowrap text-accent-purple hover:text-accent-cyan"
                    >
                      [{l.ctx}]
                    </button>
                  ) : (
                    <span />
                  )}
                  <span className="min-w-0 break-words whitespace-pre-wrap">
                    {highlight(l.message, marker)}
                    {folded ? (
                      <button
                        type="button"
                        onClick={() => {
                          toggle(setOpen, i);
                        }}
                        className="ml-2 text-text-mute hover:text-text"
                      >
                        {isOpen ? '▴' : '▾'} stack ({l.extra?.length})
                      </button>
                    ) : null}
                    {folded && isOpen ? (
                      <span className="block whitespace-pre text-text-dim">
                        {l.extra?.join('\n')}
                      </span>
                    ) : null}
                  </span>
                </div>
              );
            })
          )}
        </div>
        {!follow && pending > 0 ? (
          <button
            type="button"
            onClick={() => {
              setFollow(true);
            }}
            className="absolute bottom-3 left-1/2 inline-flex h-7 -translate-x-1/2 items-center gap-2 rounded-full bg-surface-raised px-3 text-caption text-text"
          >
            {pending} new {pending === 1 ? 'line' : 'lines'}{' '}
            <span className="text-text-dim">↓</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
