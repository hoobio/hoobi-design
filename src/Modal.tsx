import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { cx } from './cx.js';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: 'md' | 'lg';
  className?: string;
}

const SIZES = {
  md: 'w-[min(38rem,calc(100vw-1.5rem))]',
  lg: 'w-[min(54rem,calc(100vw-1.5rem))]',
};

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
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
        'm-auto max-h-[min(85dvh,calc(100dvh-2rem))] rounded-panel bg-surface-raised p-0 text-text backdrop:bg-[color-mix(in_srgb,var(--color-smoke)_60%,transparent)]',
        SIZES[size],
        className,
      )}
    >
      <div className="flex max-h-[inherit] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-bg px-4 py-3">
          <h2 className="min-w-0 text-subtitle break-words text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control text-body-large leading-none text-text-dim hover:bg-surface hover:text-text"
          >
            &times;
          </button>
        </header>
        <div className="styled-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </dialog>
  );
}
