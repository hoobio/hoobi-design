import type { ReactNode } from 'react';
import { ActionButton } from './ActionButton.js';
import { Button } from './Button.js';
import { cx } from './cx.js';

export interface UnsavedBarProps {
  /** Section names holding edits. Empty renders nothing at all (unless `message` is set). */
  sections?: string[];
  /** Replaces the "Unsaved changes in …" sentence for a bar that is not about sections. */
  message?: ReactNode;
  /**
   * Return a promise and the Save button reports it itself: busy while pending, "Saved"
   * for a moment on resolve, the error on its tooltip on reject.
   */
  onSave: () => void | Promise<unknown>;
  onDiscard: () => void;
  /** Forces the saving state, for a parent that already tracks it. */
  saving?: boolean;
  saveLabel?: string;
  discardLabel?: string;
  className?: string;
}

/**
 * Sticky at the foot of the scroll container while anything is unsaved, naming which
 * sections hold the changes - on a page you scroll, "you have unsaved changes" alone
 * does not say where. The strip behind the bar is page background rather than a
 * shadow, so content does not appear to pass under a translucent edge.
 */
export function UnsavedBar({
  sections = [],
  message,
  onSave,
  onDiscard,
  saving = false,
  saveLabel = 'Save',
  discardLabel = 'Discard',
  className,
}: UnsavedBarProps) {
  if (sections.length === 0 && !message) return null;
  return (
    <div
      role="status"
      className={cx(
        'sticky bottom-0 z-10 bg-bg pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-panel bg-surface-raised py-2.5 pr-3 pl-4">
        <span className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warn" />
          <span className="min-w-0 text-body text-text">
            {message ?? (
              <>
                Unsaved changes in <span className="font-medium">{sections.join(', ')}</span>
              </>
            )}
          </span>
        </span>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" onClick={onDiscard} disabled={saving}>
            {discardLabel}
          </Button>
          <ActionButton
            variant="primary"
            busy={saving}
            successLabel="Saved"
            action={async () => {
              await onSave();
            }}
          >
            {saveLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
