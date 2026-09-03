import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  /** What this field means, on an (i) beside the label. */
  info?: string;
  /** Validation failure. The one thing that belongs under the control. */
  error?: ReactNode;
}

export function Select({ label, info, error, className, id, children, ...rest }: SelectProps) {
  const fallbackId = useId();
  const selectId = id ?? fallbackId;
  const infoId = `${selectId}-info`;
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      {label ? (
        <FieldLabel htmlFor={selectId} info={info} infoId={infoId}>
          {label}
        </FieldLabel>
      ) : null}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={info ? infoId : undefined}
        className={cx(
          'h-8 w-full min-w-0 rounded-control border bg-surface px-2.5 text-body text-text',
          error ? 'border-danger' : 'border-border',
        )}
        {...rest}
      >
        {children}
      </select>
      {error ? <p className="text-caption text-danger">{error}</p> : null}
    </div>
  );
}
