import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, type ButtonProps } from './Button.js';
import { cx } from './cx.js';
import { CheckIcon } from './icons.js';
import { tipAnchor } from './tip.js';

export type ActionButtonState = 'rest' | 'busy' | 'success' | 'failure';

export interface ActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Forces the busy state on top of the promise's own - for work a parent already tracks. */
  busy?: boolean;
  /** The work. Its promise IS the button's state: pending, resolved, rejected. */
  action: () => Promise<unknown>;
  /** Swaps the label while the success state holds - Save becomes Saved. */
  successLabel?: ReactNode;
  /** Swaps the label while the failure state holds. The error text goes on the tooltip. */
  failureLabel?: ReactNode;
  /** How long the transient states hold, in ms. */
  successMs?: number;
  failureMs?: number;
}

/**
 * Reports the outcome of `action`: busy while pending, then a brief success state or a
 * longer failure state, with the rejection message in the tooltip and in `title`. A plain
 * Button wired to an async onClick has no equivalent state or error surface.
 */
export function ActionButton({
  action,
  successLabel,
  failureLabel,
  successMs = 1500,
  failureMs = 3000,
  busy = false,
  children,
  className,
  disabled,
  ...rest
}: ActionButtonProps) {
  const [state, setState] = useState<ActionButtonState>('rest');
  const [message, setMessage] = useState<string | undefined>(undefined);
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Set on mount as well as cleared on unmount: React 19 StrictMode mounts, unmounts and
    // remounts in development. A flag only cleared on unmount would count a later promise
    // as settled after unmount, leaving the button stuck busy.
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const settle = (next: 'success' | 'failure', ms: number, error?: string) => {
    if (!alive.current) return;
    setMessage(error);
    setState(next);
    timer.current = setTimeout(() => {
      if (!alive.current) return;
      setState('rest');
      setMessage(undefined);
    }, ms);
  };

  const run = () => {
    // A second press mid-flight is treated as a double submit and ignored.
    if (state === 'busy') return;
    clearTimeout(timer.current);
    setState('busy');
    setMessage(undefined);
    action().then(
      () => {
        settle('success', successMs);
      },
      (error: unknown) => {
        settle('failure', failureMs, error instanceof Error ? error.message : String(error));
      },
    );
  };

  const label =
    state === 'success'
      ? (successLabel ?? children)
      : state === 'failure'
        ? (failureLabel ?? children)
        : children;

  return (
    <Button
      {...rest}
      {...(state === 'failure' ? tipAnchor(message) : {})}
      onClick={run}
      busy={busy || state === 'busy'}
      disabled={disabled}
      className={cx(
        state === 'failure' && 'tip-fixed',
        // Important, because the variant's own fill/text utilities are equally specific:
        // CSS order, not class order, determines which one applies.
        state === 'success' && 'bg-success/15! text-success!',
        state === 'failure' && 'bg-danger/15! text-danger!',
        className,
      )}
    >
      {state === 'success' ? <CheckIcon className="size-4" /> : null}
      <span aria-live="polite" className="inline-flex items-center gap-1.5">
        {label}
      </span>
    </Button>
  );
}
