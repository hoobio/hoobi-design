import type { SVGProps } from 'react';
import { cx } from './cx.js';

/**
 * The handful of glyphs a control needs to explain itself. Fluent System Icons are the
 * house iconography and consumers pass them in as ReactNodes; these three are drawn here
 * because they are the affordance of a component, not decoration a consumer chooses -
 * a secret field without its lock is just an empty box. 20px grid, 1.5px strokes.
 */
function Glyph({ className, children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cx('shrink-0', className)}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="4.25" y="8.75" width="11.5" height="7.5" rx="1.75" />
      <path d="M6.75 8.75V6.5a3.25 3.25 0 016.5 0v2.25" />
    </Glyph>
  );
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M2.25 10S5.25 5.25 10 5.25 17.75 10 17.75 10 14.75 14.75 10 14.75 2.25 10 2.25 10z" />
      <circle cx="10" cy="10" r="2.25" />
    </Glyph>
  );
}

export function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M3 3l14 14" />
      <path d="M8.4 8.45a2.25 2.25 0 003.16 3.2" />
      <path d="M5.6 5.75C3.5 7.1 2.25 10 2.25 10s3 4.75 7.75 4.75c1.3 0 2.44-.36 3.4-.9" />
      <path d="M8.6 5.44A6.9 6.9 0 0110 5.25c4.75 0 7.75 4.75 7.75 4.75s-.7 1.1-1.95 2.3" />
    </Glyph>
  );
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="7.25" y="7.25" width="9" height="9" rx="1.75" />
      <path d="M12.75 7.25v-1.5a2 2 0 00-2-2h-5a2 2 0 00-2 2v5a2 2 0 002 2h1.5" />
    </Glyph>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4.75 10.5l3.5 3.5 7-8" />
    </Glyph>
  );
}

export function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M7.75 4.75L13 10l-5.25 5.25" />
    </Glyph>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="8.75" cy="8.75" r="5" />
      <path d="M12.5 12.5l4 4" />
    </Glyph>
  );
}
