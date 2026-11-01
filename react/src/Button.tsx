import type { ButtonHTMLAttributes, RefAttributes } from 'react';
import { cx } from './cx.js';
import { Spinner } from './Spinner.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, RefAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * True while the triggered work is running: the button disables and a spinner leads the
   * label. The label stays visible during the busy state.
   */
  busy?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent-fill text-on-accent hover:bg-accent',
  secondary: 'bg-chip text-text hover:bg-surface-raised',
  ghost: 'bg-transparent text-text-dim hover:bg-surface hover:text-text',
  danger: 'bg-danger/15 text-danger hover:bg-danger hover:text-bg',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-caption',
  md: 'h-8 px-3 text-body',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  busy = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? busy}
      aria-busy={busy || undefined}
      className={cx(
        // A leading spinner/icon is round and optically light, so its side keeps the same
        // 8px breathing room the ring gets vertically instead of the full text padding.
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&:has(>.animate-spin:first-child)]:pl-2',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {busy ? <Spinner /> : null}
      {children}
    </button>
  );
}
