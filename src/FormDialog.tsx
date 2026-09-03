import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Alert } from './Alert.js';
import { Button } from './Button.js';
import { Modal } from './Modal.js';
import type { DialogTone } from './ActionDialog.js';

export interface FormDialogProps {
  open: boolean;
  title: ReactNode;
  /** The fields. They are the form's own children, so required/pattern/type do the validating. */
  children: ReactNode;
  /** REQUIRED, and it names what submitting does: "Save", "Set password", "Create". */
  submitLabel: ReactNode;
  cancelLabel?: ReactNode;
  /** Force the busy state. Unnecessary when `onSubmit` returns a promise. */
  busy?: boolean;
  /**
   * A cross-field rule the browser cannot express - "the two passwords match". ANDed with
   * the form's own checkValidity(); leave it out when the fields say everything.
   */
  valid?: boolean;
  tone?: DialogTone;
  /** Enter or the submit button. Return a promise and the dialog runs it. */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<unknown>;
  onCancel: () => void;
}

/**
 * A dialog whose body is a form. Submit is disabled until the form is actually valid, read
 * from the browser's own constraint validation rather than a hand-rolled mirror of it: put
 * `required`, `type="email"`, `minLength` or `pattern` on the fields and the button
 * follows. Enter submits, because a form that ignores Enter is not a form.
 *
 * ActionDialog is yes-or-no; this is the one with fields. Like ActionDialog it **never
 * closes itself** - the consumer flips `open` once the work succeeded - and a rejected
 * promise becomes a danger line above the buttons with the dialog left open.
 */
export function FormDialog({
  open,
  title,
  children,
  submitLabel,
  cancelLabel = 'Cancel',
  busy = false,
  valid = true,
  tone = 'default',
  onSubmit,
  onCancel,
}: FormDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const alive = useRef(true);
  const [nativeValid, setNativeValid] = useState(false);
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

  const check = () => {
    setNativeValid(formRef.current?.checkValidity() ?? false);
  };

  // Layout effect, not effect: the button has to be right on the first paint, or a dialog
  // opened over already-valid fields flashes a disabled submit.
  useLayoutEffect(() => {
    if (!open) {
      setRunning(false);
      setError(undefined);
      return;
    }
    check();
  }, [open]);

  // A passive effect, and it has to be: Modal is the CHILD, so its showModal() runs before
  // any layout effect of ours, and showModal() parks focus on the first focusable thing in
  // the dialog - the close button. Focusing the first field from a layout effect gets
  // overwritten a moment later, and the person types into nothing.
  useEffect(() => {
    if (!open) return;
    formRef.current
      ?.querySelector<HTMLElement>(
        'input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled])',
      )
      ?.focus();
  }, [open]);

  const pending = busy || running;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = onSubmit(event);
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
      <form
        ref={formRef}
        // The browser's own bubbles fire before ours and word it their way; we want its
        // verdict, which checkValidity() gives us without the popup.
        noValidate
        onSubmit={submit}
        onInput={check}
        onChange={check}
        className="flex flex-col gap-4"
      >
        {children}
        {error ? <Alert tone="danger" title={error} /> : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" disabled={pending} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            busy={pending}
            disabled={!nativeValid || !valid}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
