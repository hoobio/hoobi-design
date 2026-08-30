import { cx } from './cx.js';

export interface SpinnerProps {
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export function Spinner({ size = 'sm', label = 'Loading', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cx(
        'inline-block animate-spin rounded-full border-2 border-border border-t-accent',
        size === 'sm' ? 'size-4' : 'size-6',
        className,
      )}
    />
  );
}
