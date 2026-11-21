import { useEffect, useRef, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react';
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

  // React bubbles close, cancel and click from a dialog nested inside this one, so each acts only on this dialog's own event.
  const own = (e: SyntheticEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  const pressedBackdrop = useRef(false);

  return (
    <dialog
      ref={ref}
      onClose={own}
      onCancel={own}
      onMouseDown={(e) => {
        pressedBackdrop.current = e.target === ref.current;
      }}
      onClick={(e) => {
        if (pressedBackdrop.current) own(e);
        pressedBackdrop.current = false;
      }}
      className={cx(
        'm-auto max-h-[min(85dvh,calc(100dvh-2rem))] rounded-panel bg-surface-raised p-0 text-text backdrop:bg-[color-mix(in_srgb,var(--color-smoke)_60%,transparent)]',
        SIZES[size],
        className,
      )}
    >
      <div className="flex max-h-[inherit] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-bg p-4">
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
        <div
          className="styled-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          // --pad lets a Divider inside the body cancel it and reach the dialog's edges, as it does in a Card.
          style={{ '--pad': '16px' } as CSSProperties}
        >
          {children}
        </div>
      </div>
    </dialog>
  );
}
