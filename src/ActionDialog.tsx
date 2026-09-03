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
   * REQUIRED, and it names the ACTION: "Rotate", "Regenerate", "Clear", "Delete 12 issues".
   * A button that says "Confirm" has told the reader nothing they did not already know,
   * which is why there is no default here to fall back on.
   */
  actionLabel: ReactNode;
  cancelLabel?: ReactNode;
  /**
   * 'danger' is for DISCARDING something irrecoverable - clearing a stored secret,
   * regenerating an API key, rotating the cookie secret. Anything else is 'default' with
   * the accent button: red on a routine action only teaches people to ignore red.
   */
  tone?: DialogTone;
  /** Force the busy state. Unnecessary when `onAction` returns a promise. */
  busy?: boolean;
  /**
   * Return a promise and the dialog runs it: the button goes busy, a rejection's message
   * lands in a danger line above the buttons, and the dialog STAYS OPEN so it can be
   * retried or cancelled.
   */
  onAction: () => void | Promise<unknown>;
  onCancel: () => void;
}

/**
 * The gate in front of anything destructive, irrecoverable, or with a byproduct: a
 * statement of the consequence and one button that names what it will do. A modal rather
 * than an inline arm-then-confirm because those actions need the consequence stated before
 * the second click, and because a dialog stops the page - Escape and the focus trap come
 * from Modal's native dialog element. For a danger tone the focus lands on Cancel, so the
 * key that dismisses everything else does not fire this one.
 *
 * Yes or no lives here; fields live in FormDialog.
 *
 * **The dialog never closes itself.** The consumer owns `open` and sets it false once the
 * work actually succeeded - anything else closes over a failure and leaves a person
 * believing something happened.
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
    // Set on the way IN as well as cleared on the way out: React 19 StrictMode mounts,
    // unmounts and remounts in development, and a flag only ever cleared would leave every
    // later promise looking like it settled after unmount - the state would never move.
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
      {/* title, not children: Alert dims its body, and a failure that reads grey is not a
          failure anyone notices. */}
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
