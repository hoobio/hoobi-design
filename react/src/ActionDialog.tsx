import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert } from './Alert.js';
import { Button } from './Button.js';
import { Modal } from './Modal.js';

export type DialogTone = 'default' | 'danger';

export interface ActionDialogProps {
  open: boolean;
  title: ReactNode;
  /** One plain statement of the consequence: "Everyone, including you, will be signed out." */
  description?: ReactNode;
  /** Anything richer than a sentence - a list of what is about to go. Fields belong in FormDialog. */
  children?: ReactNode;
  /**
   * Required; must name the action: "Rotate", "Regenerate", "Clear", "Delete 12 issues".
   * "Confirm" carries no information, so there is no default value.
   */
  actionLabel: ReactNode;
  cancelLabel?: ReactNode;
  /**
   * 'danger' is for discarding something irrecoverable: clearing a stored secret,
   * regenerating an API key, rotating the cookie secret. Anything else uses 'default'
   * with the accent button.
   */
  tone?: DialogTone;
  /** Force the busy state. Unnecessary when `onAction` returns a promise. */
  busy?: boolean;
  /**
   * Return a promise and the dialog runs it: the button goes busy, a rejection message
   * appears in a danger line above the buttons, and the dialog stays open for a retry or
   * cancel.
   */
  onAction: () => void | Promise<unknown>;
  onCancel: () => void;
}

/**
 * Confirmation dialog for destructive or irrecoverable actions, or actions with a side
 * effect: shows the consequence and one button naming the action. Uses a modal rather
 * than an inline arm-then-confirm so the consequence is stated before the second click;
 * Escape and the focus trap come from Modal's native dialog element. For tone 'danger',
 * focus starts on Cancel so Escape does not trigger the action.
 *
 * Yes/no actions only; fields belong in FormDialog.
 *
 * **The dialog does not close itself.** The consumer sets `open` to false once the work
 * has succeeded.
 */
export function ActionDialog({
  open,
  title,
  description,
  children,
  actionLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  busy = false,
  onAction,
  onCancel,
}: ActionDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const alive = useRef(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Set on mount as well as cleared on unmount: React 19 StrictMode mounts, unmounts and
    // remounts in development. A flag only cleared on unmount would count a later promise
    // as settled after unmount, so `running` and `error` would never update.
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setRunning(false);
      setError(undefined);
      return;
    }
    const target = tone === 'danger' ? cancelRef.current : actionRef.current;
    target?.focus();
  }, [open, tone]);

  const pending = busy || running;

  const run = () => {
    const result = onAction();
    if (!(result instanceof Promise)) return;
    setRunning(true);
    setError(undefined);
    result.then(
      () => {
        if (alive.current) setRunning(false);
      },
      (reason: unknown) => {
        if (!alive.current) return;
        setRunning(false);
        setError(reason instanceof Error ? reason.message : String(reason));
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      className="w-[min(28rem,calc(100vw-1.5rem))]"
    >
      {description ? <p className="text-body text-text-dim">{description}</p> : null}
      {children}
      {/* Uses title, not children: Alert dims body text; failure text stays at full
          strength for visibility. */}
      {error ? <Alert tone="danger" title={error} className="mt-4" /> : null}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button ref={cancelRef} variant="ghost" disabled={pending} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          ref={actionRef}
          variant={tone === 'danger' ? 'danger' : 'primary'}
          busy={pending}
          onClick={run}
        >
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
}
