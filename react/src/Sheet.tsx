import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { cx } from './cx.js';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
  className?: string;
}

const SIZES = {
  md: 'w-[min(32rem,100vw)]',
  lg: 'w-[min(40rem,100vw)]',
};

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={onBackdrop}
      className={cx(
        'slide-in-right m-0 mr-0 ml-auto h-dvh max-h-none max-w-none rounded-l-panel bg-surface-raised p-0 text-text backdrop:bg-[color-mix(in_srgb,var(--color-smoke)_60%,transparent)]',
        SIZES[size],
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-bg px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
          <div className="min-w-0">
            <h2 className="text-subtitle break-words text-text">{title}</h2>
            {description && <p className="text-caption text-text-dim">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control text-body-large leading-none text-text-dim hover:bg-surface hover:text-text"
          >
            &times;
          </button>
        </header>
        <div
          className={cx(
            'styled-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4',
            !footer && 'pb-[max(1rem,env(safe-area-inset-bottom))]',
          )}
          style={{ '--pad': '16px' } as CSSProperties}
        >
          {children}
        </div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-bg px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
