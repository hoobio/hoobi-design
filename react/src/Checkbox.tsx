import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx.js';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  /** Optional text beside the box. Without one, pass aria-label. */
  label?: ReactNode;
  indeterminate?: boolean;
}

/**
 * A native checkbox given the house look - appearance-none on the input itself, so
 * the label association, the space key and the global focus ring all stay the
 * platform's. The label wrapper has the 44px touch target; the box stays 20px.
 */
export function Checkbox({
  label,
  indeterminate = false,
  className,
  disabled = false,
  ...rest
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={cx(
        'inline-flex min-h-8 items-center gap-2 text-body text-text select-none pointer-coarse:min-h-11',
        disabled ? 'cursor-default opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          // Filled, not outlined: an unchecked box on a mirage-backed surface needs a fill to
          // stay visible against artwork.
          className="peer size-5 min-h-0 appearance-none rounded-control bg-border checked:bg-accent indeterminate:bg-accent"
          {...rest}
        />
        <svg
          viewBox="0 0 20 20"
          aria-hidden
          fill="none"
          className="pointer-events-none absolute size-5 text-on-accent opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
        >
          <path
            d="M5 10.25l3.25 3.25L15 6.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          viewBox="0 0 20 20"
          aria-hidden
          fill="none"
          className="pointer-events-none absolute size-5 text-on-accent opacity-0 peer-indeterminate:opacity-100"
        >
          <path d="M5.5 10h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      {label}
    </label>
  );
}
