import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, type ButtonProps, type ButtonVariant } from './Button.js';

export interface ConfirmButtonProps extends Omit<ButtonProps, 'onClick' | 'variant'> {
  /** Resting variant. */
  variant?: ButtonVariant;
  /** Armed label. Defaults to 'Confirm' plus the children when they are a string. */
  confirmLabel?: ReactNode;
  /** Milliseconds until it disarms. */
  timeout?: number;
  onConfirm: () => void;
}

/**
 * Arm-then-confirm: one click switches it to danger, a second fires.
 *
 * @deprecated Use ActionDialog. A destructive, irrecoverable, or side-effecting action
 * must have its consequence stated before the second click. A strip that disarms after
 * four seconds does not state one. Kept for trivial, reversible actions and for 0.19.0
 * consumers.
 */
export function ConfirmButton({
  variant = 'secondary',
  confirmLabel,
  timeout = 4000,
  onConfirm,
  children,
  ...rest
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  return (
    <Button
      variant={armed ? 'danger' : variant}
      onClick={() => {
        if (armed) {
          clearTimeout(timer.current);
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        timer.current = setTimeout(() => {
          setArmed(false);
        }, timeout);
      }}
      {...rest}
    >
      {armed
        ? (confirmLabel ?? (typeof children === 'string' ? `Confirm ${children}` : 'Confirm'))
        : children}
    </Button>
  );
}
