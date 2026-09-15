import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { cx } from './cx.js';

export type ToastTone = 'default' | 'success' | 'warn' | 'danger';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** ms before it leaves. 0 makes it sticky - the person has to dismiss it. */
  duration?: number;
  /** One thing to do about it: "Undo", "View issue". Dismisses the toast when pressed. */
  action?: ToastAction;
}

export interface ToastHandle {
  id: string;
  dismiss: () => void;
}

interface ToastRecord extends ToastOptions {
  id: string;
  duration: number;
  leaving?: boolean;
}

/** Maximum of three toasts visible at once; a fourth reads as a log. */
const MAX = 3;
/** Default time on screen in ms: long enough to read one line, short enough that it does not linger in the corner. */
const DEFAULT_DURATION = 4000;
/** Matches the leave animation, so the node is gone the frame after it finishes. */
const LEAVE_MS = 150;

const TONE_FILLS: Record<ToastTone, string> = {
  default: 'bg-surface-raised',
  success: 'bg-success/15',
  warn: 'bg-warn/15',
  danger: 'bg-danger/15',
};

const TONE_DOTS: Record<ToastTone, string> = {
  default: 'bg-text-mute',
  success: 'bg-success',
  warn: 'bg-warn',
  danger: 'bg-danger',
};

/**
 * A module-level store rather than a context: a toast is fired from an event handler, a
 * poll callback, a websocket message - places that have no component to hang a hook off.
 * The app mounts one Toaster; everything else just calls toast().
 */
let records: ToastRecord[] = [];
const listeners = new Set<() => void>();

function publish(next: ToastRecord[]) {
  records = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function remove(id: string) {
  publish(records.filter((r) => r.id !== id));
}

function startLeaving(id: string) {
  const record = records.find((r) => r.id === id);
  if (!record || record.leaving) return;
  publish(records.map((r) => (r.id === id ? { ...r, leaving: true } : r)));
  setTimeout(() => {
    remove(id);
  }, LEAVE_MS);
}

let counter = 0;

/**
 * Raise a toast. Returns a handle so a long-running job can put up a sticky toast
 * (`duration: 0`) and take it down itself when it finishes.
 */
export function toast(options: ToastOptions): ToastHandle {
  counter += 1;
  const id = `toast-${String(counter)}`;
  const record: ToastRecord = {
    tone: 'default',
    duration: DEFAULT_DURATION,
    ...options,
    id,
  };
  // Drops the oldest toast first, so the newest stays in the position the person is already looking at.
  const kept = records.filter((r) => !r.leaving);
  publish([...kept.slice(Math.max(0, kept.length - (MAX - 1))), record]);
  return {
    id,
    dismiss: () => {
      startLeaving(id);
    },
  };
}

/** Clears the stack. Use on a route change, where the previous page's toasts no longer apply. */
export function dismissAllToasts() {
  for (const record of records) startLeaving(record.id);
}

function ToastItem({ record }: { record: ToastRecord }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(record.duration);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!record.duration || paused || record.leaving) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => {
      startLeaving(record.id);
    }, remaining.current);
    return () => {
      clearTimeout(timer);
      // Bank what has already elapsed, so hovering pauses the timer rather than restarting it:
      // restarting on every hover would mean the toast never expires.
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, record.duration, record.id, record.leaving]);

  const tone = record.tone ?? 'default';
  const hold = () => {
    setPaused(true);
  };
  const release = () => {
    setPaused(false);
  };

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocus={hold}
      onBlur={release}
      className={cx(
        'pointer-events-auto flex items-start gap-2.5 rounded-panel px-3 py-2.5',
        TONE_FILLS[tone],
        record.leaving ? 'toast-out' : 'toast-in',
      )}
    >
      <span className={cx('mt-1.5 size-1.5 shrink-0 rounded-full', TONE_DOTS[tone])} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body-strong break-words text-text">{record.title}</span>
        {record.description ? (
          <span className="text-caption break-words text-text-dim">{record.description}</span>
        ) : null}
        {record.action ? (
          <button
            type="button"
            onClick={() => {
              record.action?.onClick();
              startLeaving(record.id);
            }}
            className="mt-1 self-start rounded-control border-0 bg-transparent text-caption font-medium text-accent-blue hover:text-accent-cyan"
          >
            {record.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          startLeaving(record.id);
        }}
        className="-mt-1 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-control border-0 bg-transparent text-body-large leading-none text-text-dim hover:bg-surface hover:text-text"
      >
        &times;
      </button>
    </div>
  );
}

export interface ToasterProps {
  className?: string;
}

/**
 * Mount once, near the root. Bottom-right on a desktop where the corner is dead space;
 * full width along the bottom edge on a phone, above the home indicator, since a
 * 320px card in the corner of a 360px screen leaves almost no margin either side.
 */
export function Toaster({ className }: ToasterProps) {
  const items = useSyncExternalStore(
    subscribe,
    () => records,
    () => records,
  );

  return (
    <div
      // Not aria-live: each toast has its own role, so the region must not announce
      // a second time. pointer-events-none lets the page take clicks through the gaps.
      className={cx(
        'pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col gap-2 p-3',
        'pb-[calc(12px+env(safe-area-inset-bottom))] md:left-auto md:w-90 md:p-4',
        className,
      )}
    >
      {items.map((record) => (
        <ToastItem key={record.id} record={record} />
      ))}
    </div>
  );
}
