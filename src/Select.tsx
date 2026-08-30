import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from './cx.js';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
}

export function Select({ label, className, id, children, ...rest }: SelectProps) {
  const fallbackId = useId();
  const selectId = id ?? fallbackId;
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      {label ? (
        <label htmlFor={selectId} className="text-xs text-text-dim">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className="w-full min-w-0 rounded-control border border-border bg-surface px-2.5 py-2 text-sm text-text focus:border-accent focus:outline-none"
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
