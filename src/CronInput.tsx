import { useId, useMemo, useState, type ReactNode } from 'react';
import { cx } from './cx.js';
import { cronRuns, formatCronRelative, formatCronRun } from './cron.js';
import { FieldLabel } from './FieldLabel.js';
import { ChevronIcon } from './icons.js';

export interface CronPreset {
  label: string;
  expression: string;
}

export interface CronInputProps {
  value: string;
  onChange: (expression: string) => void;
  label?: ReactNode;
  /** What the schedule drives, on the (i). */
  info?: string;
  /** The one-click schedules. Anything else lives behind `advanced`. */
  presets?: CronPreset[];
  /** Controlled disclosure, so the raw field has an address. Omit for internal state. */
  advanced?: boolean;
  onAdvancedChange?: (open: boolean) => void;
  /** How many firings to show. */
  runs?: number;
  /** The label is read to screen readers but not drawn: for a control inside a SettingRow. */
  hideLabel?: boolean;
  id?: string;
  className?: string;
}

const DEFAULT_PRESETS: CronPreset[] = [
  { label: 'every 5 min', expression: '*/5 * * * *' },
  { label: 'every 15 min', expression: '*/15 * * * *' },
  { label: 'every 30 min', expression: '*/30 * * * *' },
  { label: 'hourly', expression: '0 * * * *' },
];

/**
 * Chips cover the common schedules; the expression field is for anything else. The next
 * firings are the real validation: a syntactically valid expression can still fire on the
 * wrong date, and the run list shows that.
 */
export function CronInput({
  value,
  onChange,
  label = 'schedule',
  info,
  presets = DEFAULT_PRESETS,
  advanced,
  onAdvancedChange,
  runs = 3,
  hideLabel = false,
  id,
  className,
}: CronInputProps) {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  const infoId = `${fieldId}-info`;
  const fieldsInfo = 'minute · hour · day · month · weekday';
  const [internalOpen, setInternalOpen] = useState(false);
  const open = advanced ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (advanced === undefined) setInternalOpen(next);
    onAdvancedChange?.(next);
  };

  const result = useMemo(() => cronRuns(value, runs), [value, runs]);

  return (
    <div className={cx('flex min-w-0 flex-col gap-2.5', className)}>
      <FieldLabel info={info} className={hideLabel ? 'sr-only' : undefined}>
        {label}
      </FieldLabel>

      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => {
          const active = preset.expression === value;
          return (
            <button
              key={preset.expression}
              type="button"
              aria-pressed={active}
              onClick={() => {
                onChange(preset.expression);
              }}
              className={cx(
                'inline-flex h-7 shrink-0 items-center rounded-control px-2.5 text-caption whitespace-nowrap transition-colors',
                active
                  ? 'bg-accent/15 text-text'
                  : 'bg-chip text-text-dim hover:bg-surface-raised hover:text-text',
              )}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={fieldId}
          onClick={() => {
            setOpen(!open);
          }}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-control bg-transparent px-2.5 text-caption text-text-dim hover:bg-surface hover:text-text"
        >
          <ChevronIcon
            className={cx(
              'size-3 transition-transform duration-150 ease-standard',
              open && 'rotate-90',
            )}
          />
          advanced
        </button>
      </div>

      {open ? (
        <div className="flex max-w-90 flex-col gap-1">
          <FieldLabel htmlFor={fieldId} info={fieldsInfo} infoId={infoId}>
            cron expression
          </FieldLabel>
          <input
            id={fieldId}
            value={value}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={result.error ? true : undefined}
            aria-describedby={infoId}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            className={cx(
              'h-8 w-full min-w-0 rounded-control px-2.5 font-mono text-body text-text pointer-coarse:h-11',
              result.error ? 'bg-danger/15' : 'bg-chip',
            )}
          />
        </div>
      ) : null}

      {result.error ? (
        <p
          role="alert"
          className="max-w-90 rounded-control bg-danger/15 px-3 py-2 text-caption text-danger"
        >
          {result.error}
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          <span className="text-caption text-text-mute">
            next {result.runs?.length === 1 ? 'run' : `${String(result.runs?.length ?? 0)} runs`}
          </span>
          {result.runs?.map((run) => (
            <span key={run.getTime()} className="flex flex-wrap gap-3 text-caption">
              <span className="text-text tabular-nums">{formatCronRun(run)}</span>
              <span className="text-text-dim">{formatCronRelative(run)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
