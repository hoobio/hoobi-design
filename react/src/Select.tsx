import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  /** What this field means, on an (i) beside the label. */
  info?: string;
  /** Validation failure. The one thing that belongs under the control. */
  error?: ReactNode;
  /** The label is read to screen readers but not drawn: for a control inside a SettingRow. */
  hideLabel?: boolean;
}

export function Select({
  label,
  info,
  error,
  hideLabel = false,
  className,
  id,
  children,
  ...rest
}: SelectProps) {
  const fallbackId = useId();
  const selectId = id ?? fallbackId;
  const infoId = `${selectId}-info`;
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      {label ? (
        <FieldLabel
          htmlFor={selectId}
          info={info}
          infoId={infoId}
          className={hideLabel ? 'sr-only' : undefined}
        >
          {label}
        </FieldLabel>
      ) : null}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={info ? infoId : undefined}
        className={cx(
          'h-8 w-full min-w-0 rounded-control px-2.5 text-body text-text',
          error ? 'bg-danger/15' : 'bg-chip',
        )}
        {...rest}
      >
        {children}
      </select>
      {error ? <p className="text-caption text-danger">{error}</p> : null}
    </div>
  );
}
