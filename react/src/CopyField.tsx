import type { ReactNode } from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';
import { useCopy } from './copy.js';

export interface CopyFieldProps {
  /** What is copied to the clipboard. */
  value: string;
  /** Caption label above the row. */
  label?: ReactNode;
  /** A fixed-width label INSIDE the row instead - for a stack of settings to paste elsewhere. */
  name?: ReactNode;
  /** Shown in place of the value (a mask, a shortened form). `value` is still what is copied. */
  display?: ReactNode;
  /** What the value is for, on the (i). */
  info?: string;
  className?: string;
}

/**
 * A value the app produces and a person has to paste somewhere else: mono, read-only, on
 * the chip fill so it does not read as an editable field, with copy as the only affordance.
 */
export function CopyField({ value, label, name, display, info, className }: CopyFieldProps) {
  const { copied, copy } = useCopy();
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      {label ? <FieldLabel info={info}>{label}</FieldLabel> : null}
      <div className="flex h-8 items-center gap-2 rounded-control bg-chip pr-1 pl-2.5 pointer-coarse:h-11">
        {name ? <span className="w-24 shrink-0 text-caption text-text-mute">{name}</span> : null}
        <code className="min-w-0 flex-1 truncate font-mono text-caption text-text">
          {display ?? value}
        </code>
        <button
          type="button"
          onClick={() => {
            copy(value);
          }}
          className="inline-flex h-6 shrink-0 items-center rounded-control border-0 bg-transparent px-2 text-caption text-text-dim hover:bg-surface hover:text-text"
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
    </div>
  );
}
