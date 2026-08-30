import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-accent-fill text-on-accent hover:bg-accent disabled:hover:bg-accent-fill',
  secondary: 'border border-border bg-surface text-text hover:border-accent',
  ghost: 'border border-transparent bg-transparent text-text-dim hover:text-text',
  danger: 'border border-danger bg-transparent text-danger hover:bg-danger hover:text-bg',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-2 text-sm',
};

export function Button({ variant = 'secondary', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-control font-medium transition-colors disabled:cursor-default disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}
