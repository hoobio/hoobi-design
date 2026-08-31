import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border border-transparent bg-accent-fill text-on-accent hover:bg-accent',
  secondary: 'border border-border bg-surface text-text hover:bg-surface-raised',
  ghost: 'border border-transparent bg-transparent text-text-dim hover:bg-surface hover:text-text',
  danger: 'border border-danger bg-transparent text-danger hover:bg-danger hover:text-bg',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-caption',
  md: 'h-8 px-3 text-body',
};

export function Button({ variant = 'secondary', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}
