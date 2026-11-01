import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copy to the clipboard with a short "copied" flash. Not exported from the package:
 * it is two components' shared plumbing, not a design fact.
 */
export function useCopy(ms = 1500): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    (text: string) => {
      void navigator.clipboard?.writeText(text).catch(() => undefined);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
      }, ms);
    },
    [ms],
  );

  return { copied, copy };
}
