import { useId, type ReactNode } from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';

/** The common units, still open: 'days ago' and 'per scan' are real labels too. */
export type DurationUnit = 'minutes' | 'hours' | 'days' | (string & {});

export interface DurationInputProps {
  label: ReactNode;
  /** Baked into the field as a chip-filled suffix, so the number is never unitless. */
  unit: DurationUnit;
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  /** What the number means, and what 0 does, on the (i). Never a sentence under the field. */
  info?: string;
  error?: ReactNode;
  disabled?: boolean;
  /** The label is read to screen readers but not drawn: for a control inside a SettingRow. */
  hideLabel?: boolean;
  id?: string;
  className?: string;
}

/**
 * A number with its unit inside the field. Separating the two - a bare box and the word
 * "hours" somewhere beside it - is how you get a value entered in the wrong scale.
 */
export function DurationInput({
  label,
  unit,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  info,
  error,
  disabled = false,
  hideLabel = false,
  id,
  className,
}: DurationInputProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const infoId = `${inputId}-info`;
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      <FieldLabel
        htmlFor={inputId}
        info={info}
        infoId={infoId}
        className={hideLabel ? 'sr-only' : undefined}
      >
        {label}
      </FieldLabel>
      <span
        className={cx(
          'flex h-8 items-center overflow-hidden rounded-control border bg-chip pointer-coarse:h-11',
          error ? 'border-danger' : 'border-transparent',
          disabled && 'opacity-50',
        )}
      >
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={info ? infoId : undefined}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange('');
              return;
            }
            const n = Number.parseInt(raw, 10);
            if (Number.isNaN(n)) return;
            onChange(Math.max(min, max === undefined ? n : Math.min(max, n)));
          }}
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-2.5 text-body text-text tabular-nums"
        />
        <span className="flex h-full shrink-0 items-center bg-surface-raised px-2.5 text-caption text-text-dim">
          {unit}
        </span>
      </span>
      {error ? <p className="text-caption text-danger">{error}</p> : null}
    </div>
  );
}
