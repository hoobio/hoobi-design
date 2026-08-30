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
        <label htmlFor={inputId} className="text-caption text-text-dim">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cx(
          'h-8 w-full min-w-0 rounded-control border bg-surface px-2.5 text-body text-text placeholder:text-text-mute',
          error ? 'border-danger' : 'border-border',
        )}
        {...rest}
      />
      {error ? <p className="text-caption text-danger">{error}</p> : null}
      {!error && hint ? <p className="text-caption text-text-mute">{hint}</p> : null}
    </div>
  );
}
