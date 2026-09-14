import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from './Button.js';
import { cx } from './cx.js';
import { mirageImage } from './Shell.js';

export type NoticeTone = 'danger' | 'success' | 'warn' | 'info';
export type NoticePlacement = 'top' | 'center';

export interface NoticeProps {
  open: boolean;
  tone: NoticeTone;
  title: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  /** Omitted means there is no close button: the consumer closes it on its own terms. */
  onDismiss?: () => void;
  /** Calls onDismiss after this long. 0 or omitted stays until something closes it. */
  autoHideMs?: number;
  placement?: NoticePlacement;
  className?: string;
}

/** Matches the leave animation, so the node is gone the frame after it finishes. */
const LEAVE_MS = 150;

const TONE_WASHES: Record<NoticeTone, string> = {
  danger: 'bg-danger/15',
  success: 'bg-success/15',
  warn: 'bg-warn/15',
  info: 'bg-info/15',
};

const TONE_TEXTS: Record<NoticeTone, string> = {
  danger: 'text-danger',
  success: 'text-success',
  warn: 'text-warn',
  info: 'text-info',
};

const PLACEMENTS: Record<NoticePlacement, string> = {
  top: '-translate-x-1/2 top-16 md:top-[4.5rem]',
  center: 'top-1/2 -translate-x-1/2 -translate-y-1/2',
};

/**
 * State news that outranks a toast: a dropped connection, a save that failed on the way
 * out. Centred where the eye already is, and the page keeps working underneath it.
 */
export function Notice({
  open,
  tone,
  title,
  children,
  icon,
  onDismiss,
  autoHideMs,
  placement = 'top',
  className,
}: NoticeProps) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => {
      setMounted(false);
    }, LEAVE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !autoHideMs || !onDismiss) return;
    const timer = setTimeout(onDismiss, autoHideMs);
    return () => {
      clearTimeout(timer);
    };
  }, [open, autoHideMs, onDismiss]);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        'fixed left-1/2 z-40 w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-panel bg-surface-raised text-text',
        PLACEMENTS[placement],
        open ? 'notice-in' : 'notice-out',
        className,
      )}
    >
      <div className="mirage-scoped" style={{ '--mirage-image': mirageImage() } as CSSProperties}>
        <div className={cx('absolute inset-0', TONE_WASHES[tone])} />
        <div className="relative flex items-start gap-3 px-5 py-4">
          {icon ? <span className={cx('mt-0.5 shrink-0', TONE_TEXTS[tone])}>{icon}</span> : null}
          <div className="min-w-0 flex-1">
            <p className="text-body-strong">{title}</p>
            {children ? <div className="text-text-dim">{children}</div> : null}
          </div>
          {onDismiss ? (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Dismiss"
              onClick={onDismiss}
              className="shrink-0 px-1.5 pointer-coarse:size-11"
            >
              &times;
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
