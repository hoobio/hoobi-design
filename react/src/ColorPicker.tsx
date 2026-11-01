import {
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';
import { Input } from './Input.js';
import { BLACK_HEX, hexToHsv, hsvToHex, nearestName, parseHex, type Hsv } from './colour.js';

export interface ColorPickerProps {
  /** The current colour as `#rrggbb`. */
  value: string;
  onChange: (hex: string) => void;
  /** Swatch names offered as a live label for the nearest match, e.g. the accent palette. */
  names?: { name: string; hex: string }[];
  label?: string;
  className?: string;
}

const RING_LAYERS =
  'radial-gradient(circle closest-side, rgb(255 255 255) 0%, rgb(255 255 255 / 0) 100%), conic-gradient(rgb(255 0 0), rgb(255 255 0), rgb(0 255 0), rgb(0 255 255), rgb(0 0 255), rgb(255 0 255), rgb(255 0 0))';

const THUMB =
  '[&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-chip [&::-webkit-slider-thumb]:bg-text [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:rounded-chip [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-text pointer-coarse:[&::-webkit-slider-thumb]:h-11 pointer-coarse:[&::-moz-range-thumb]:h-11';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * WinUI's ColorPicker with a Ring spectrum and alpha off: a hue/saturation ring drawn at the
 * current value, a value slider, a preview and a hex input. HSV is held locally rather than
 * re-derived from `value` on every render, because black and grey have no hue to derive - the
 * ring would jump back to red the moment the value slider reached the bottom.
 */
export function ColorPicker({ value, onChange, names, label, className }: ColorPickerProps) {
  const current = parseHex(value) ?? BLACK_HEX;
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(current));
  const [draft, setDraft] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const lastHex = useRef(current);
  const ringRef = useRef<HTMLDivElement>(null);
  const hexId = `${useId()}-hex`;

  if (lastHex.current !== current) {
    lastHex.current = current;
    setHsv(hexToHsv(current));
  }

  const emit = (next: Hsv, hex: string) => {
    setHsv(next);
    lastHex.current = hex;
    if (hex !== current) onChange(hex);
  };
  const applyHsv = (next: Hsv) => {
    emit(next, hsvToHex(next));
  };

  const fromPointer = (event: ReactPointerEvent) => {
    const rect = ringRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    applyHsv({
      ...hsv,
      h: (angle + 360) % 360,
      s: clamp01(Math.hypot(dx, dy) / (rect.width / 2)),
    });
  };

  const onThumbKey = (event: ReactKeyboardEvent) => {
    const hueStep = event.key === 'ArrowLeft' ? -2 : event.key === 'ArrowRight' ? 2 : 0;
    const satStep = event.key === 'ArrowUp' ? 0.02 : event.key === 'ArrowDown' ? -0.02 : 0;
    if (hueStep === 0 && satStep === 0) return;
    event.preventDefault();
    applyHsv({ ...hsv, h: (hsv.h + hueStep + 360) % 360, s: clamp01(hsv.s + satStep) });
  };

  const commitHex = () => {
    const parsed = draft === null ? null : parseHex(draft);
    setDraft(null);
    if (parsed) emit(hexToHsv(parsed), parsed);
  };

  const radians = (hsv.h * Math.PI) / 180;
  const name = names?.length ? nearestName(current, names) : undefined;

  return (
    <div className={cx('flex w-64 max-w-full min-w-0 flex-col gap-1', className)}>
      {label ? <FieldLabel htmlFor={hexId}>{label}</FieldLabel> : null}
      <div className="flex flex-col gap-3">
        <div
          ref={ringRef}
          className="relative aspect-square w-full touch-none rounded-full select-none"
          style={{
            background: `linear-gradient(rgb(0 0 0 / ${String(1 - hsv.v)}), rgb(0 0 0 / ${String(1 - hsv.v)})), ${RING_LAYERS}`,
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            fromPointer(event);
          }}
          onPointerMove={(event) => {
            if (dragging) fromPointer(event);
          }}
          onPointerUp={() => {
            setDragging(false);
          }}
          onPointerCancel={() => {
            setDragging(false);
          }}
        >
          <div
            role="slider"
            tabIndex={0}
            aria-label="Hue and saturation"
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(hsv.h)}
            aria-valuetext={`Hue ${String(Math.round(hsv.h))} degrees, saturation ${String(Math.round(hsv.s * 100))} per cent`}
            onKeyDown={onThumbKey}
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-text"
            style={{
              left: `${String(50 + hsv.s * 50 * Math.sin(radians))}%`,
              top: `${String(50 - hsv.s * 50 * Math.cos(radians))}%`,
              background: current,
            }}
          />
        </div>
        <div
          className="relative h-8 w-full rounded-control pointer-coarse:h-11"
          style={{
            background: `linear-gradient(to right, rgb(0 0 0), ${hsvToHex({ ...hsv, v: 1 })})`,
          }}
        >
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(hsv.v * 100)}
            aria-label="Value"
            onChange={(event) => {
              applyHsv({ ...hsv, v: Number(event.target.value) / 100 });
            }}
            className={cx('absolute inset-0 m-0 h-8 w-full appearance-none bg-transparent', THUMB)}
          />
        </div>
        <div className="flex min-w-0 items-center justify-center gap-3">
          <span
            aria-hidden="true"
            className="h-8 w-8 shrink-0 rounded-control"
            style={{ background: current }}
          />
          <Input
            id={hexId}
            label="Hex colour"
            hideLabel
            mono
            className="w-24 shrink-0"
            spellCheck={false}
            value={draft ?? current}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onBlur={commitHex}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              commitHex();
            }}
          />
          {name ? (
            <span className="min-w-0 truncate text-caption text-text-dim">{name}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
