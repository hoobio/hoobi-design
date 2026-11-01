export interface Hsv {
  /** Degrees, 0-360. */
  h: number;
  /** 0-1. */
  s: number;
  /** 0-1. */
  v: number;
}

export const BLACK_HEX = '#000000';

/** Accepts `#rrggbb` or bare `rrggbb`, any case. Returns the lowercase `#rrggbb` form, or null. */
export function parseHex(input: string): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(input.trim());
  return match ? `#${match[1]?.toLowerCase() ?? ''}` : null;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const byte = (c: number) => Math.max(0, Math.min(255, Math.round(c)));
  return `#${((1 << 24) | (byte(r) << 16) | (byte(g) << 8) | byte(b)).toString(16).slice(1)}`;
}

export function hexToHsv(hex: string): Hsv {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const channel = (n: number) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return rgbToHex(channel(5), channel(3), channel(1));
}

/** The closest swatch by RGB Euclidean distance, the snap earmark's DeviceAccentPalette does. */
export function nearestName(
  hex: string,
  names: { name: string; hex: string }[],
): string | undefined {
  const [r, g, b] = hexToRgb(hex);
  let best: string | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const swatch of names) {
    const parsed = parseHex(swatch.hex);
    if (!parsed) continue;
    const [sr, sg, sb] = hexToRgb(parsed);
    const distance = (sr - r) ** 2 + (sg - g) ** 2 + (sb - b) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = swatch.name;
    }
  }
  return best;
}
