import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export function Input({ label, hint, error, className, id, ...rest }: InputProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      {label ? (
        <label htmlFor={inputId} className="text-xs text-text-dim">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cx(
          'w-full min-w-0 rounded-control border bg-surface px-2.5 py-2 text-sm text-text placeholder:text-text-mute focus:outline-none',
          error ? 'border-danger' : 'border-border focus:border-accent',
        )}
        {...rest}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-text-mute">{hint}</p> : null}
    </div>
  );
}
