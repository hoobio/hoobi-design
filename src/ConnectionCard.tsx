import type { ReactNode } from 'react';
import { ActionButton } from './ActionButton.js';
import { Badge, type BadgeTone } from './Badge.js';
import { Button } from './Button.js';
import { cx } from './cx.js';
import { Divider } from './Divider.js';

export interface ConnectionHealth {
  ok: boolean;
  /** Round-trip in ms. Renders as `ok · 21 ms`. */
  ms?: number;
  /** Overrides the derived wording entirely. */
  label?: string;
}

export interface ConnectionRow {
  label: ReactNode;
  value: ReactNode;
  tone?: 'text' | 'dim' | 'mute' | 'success' | 'danger';
  /** Mono, for a url or an id. */
  mono?: boolean;
}

export interface ConnectionCardProps {
  /** The service, mono - it is a hostname, not a title. */
  name: string;
  /** Marks a connection the app runs fine without. */
  optional?: boolean;
  /** Omit for a connection that has never been reached: the badge reads `not configured`. */
  health?: ConnectionHealth;
  /** The static view: label/value pairs. */
  rows?: ConnectionRow[];
  /** The form, swapped in for the rows while editing. */
  children?: ReactNode;
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  /** The last test's outcome, left of the buttons. */
  result?: ReactNode;
  /** danger tints the result; a failure is not a neutral fact. */
  resultTone?: 'neutral' | 'danger';
  /**
   * @deprecated Return a promise from `onTest` instead - the button tracks it itself.
   * Still forces the busy state for a parent that already has the flag.
   */
  testing?: boolean;
  /**
   * Return a promise and the Test button reports it: busy while pending, a tick on
   * resolve, the error on its tooltip on reject. The result LINE is still yours to write -
   * the button says whether the call finished, the line says what it found.
   */
  onTest?: () => void | Promise<unknown>;
  className?: string;
}

const ROW_TONES: Record<NonNullable<ConnectionRow['tone']>, string> = {
  text: 'text-text',
  dim: 'text-text-dim',
  mute: 'text-text-mute',
  success: 'text-success',
  danger: 'text-danger',
};

/**
 * One upstream service: what it is, whether it answers, and the two things you do about
 * it - edit the settings, or test them. Full height so a grid of these lines up; the
 * header carries no description, because six paragraphs of prose in a grid is a wall.
 */
export function ConnectionCard({
  name,
  optional = false,
  health,
  rows,
  children,
  editing = false,
  onEditingChange,
  result,
  resultTone = 'neutral',
  testing = false,
  onTest,
  className,
}: ConnectionCardProps) {
  const tone: BadgeTone = health ? (health.ok ? 'success' : 'danger') : 'neutral';
  const healthLabel =
    health?.label ??
    (health
      ? health.ok
        ? `ok${health.ms === undefined ? '' : ` · ${String(health.ms)} ms`}`
        : 'fail'
      : 'not configured');

  const actions = (
    <div className="flex shrink-0 gap-1.5">
      {onEditingChange ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onEditingChange(!editing);
          }}
        >
          {editing ? 'done' : 'edit'}
        </Button>
      ) : null}
      {onTest ? (
        <ActionButton
          size="sm"
          busy={testing}
          action={async () => {
            await onTest();
          }}
        >
          Test
        </ActionButton>
      ) : null}
    </div>
  );

  return (
    <div className={cx('flex h-full flex-col rounded-panel bg-surface-raised', className)}>
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="flex h-7 min-w-0 items-center gap-2">
          <span className="truncate font-mono text-body text-text">{name}</span>
          {optional ? <span className="shrink-0 text-caption text-text-mute">optional</span> : null}
        </span>
        <Badge tone={tone} dot={health !== undefined}>
          {healthLabel}
        </Badge>
      </header>

      <Divider />

      {editing ? (
        <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-4">{children}</div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 px-4 py-3">
          {rows?.map((row, i) => (
            <div key={i} className="flex justify-between gap-3 text-caption">
              <span className="shrink-0 text-text-mute">{row.label}</span>
              <span
                className={cx(
                  'min-w-0 truncate text-right',
                  row.mono && 'font-mono',
                  ROW_TONES[row.tone ?? 'text'],
                )}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {onEditingChange || onTest || result ? (
        <>
          <Divider />
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <span
              className={cx(
                'min-w-0 truncate text-caption',
                resultTone === 'danger' ? 'text-danger' : 'text-text-dim',
              )}
            >
              {result}
            </span>
            {actions}
          </div>
        </>
      ) : null}
    </div>
  );
}
