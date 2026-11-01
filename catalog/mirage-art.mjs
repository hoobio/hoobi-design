import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';

const W = 333;
const H = 500;

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

const sky = [
  [0, [18, 22, 52]],
  [0.35, [92, 38, 110]],
  [0.6, [230, 108, 72]],
  [0.72, [255, 196, 110]],
];
const orbs = [
  { x: 0.5, y: 0.6, r: 0.24, c: [255, 220, 140], a: 0.95 },
  { x: 0.18, y: 0.2, r: 0.2, c: [64, 200, 220], a: 0.55 },
  { x: 0.85, y: 0.3, r: 0.16, c: [230, 70, 160], a: 0.6 },
];
const waves = [
  { y: 0.7, amp: 0.025, freq: 3, c: [36, 84, 160] },
  { y: 0.78, amp: 0.02, freq: 5, c: [22, 130, 150] },
  { y: 0.87, amp: 0.018, freq: 7, c: [16, 46, 90] },
];

function pixel(u, v) {
  let i = 0;
  while (i < sky.length - 2 && v > sky[i + 1][0]) i++;
  const [v0, c0] = sky[i];
  const [v1, c1] = sky[i + 1];
  let c = mix(c0, c1, clamp((v - v0) / (v1 - v0)));
  for (const o of orbs) {
    const d = Math.hypot((u - o.x) * (W / H), v - o.y) / o.r;
    c = mix(c, o.c, o.a * (1 - smooth(0.85, 1, d)));
  }
  for (const w of waves) {
    const edge = w.y + w.amp * Math.sin(u * Math.PI * 2 * w.freq + w.y * 20);
    c = mix(c, w.c, smooth(edge - 0.004, edge + 0.004, v));
  }
  return c.map((x) => Math.round(Math.max(0, Math.min(255, x))));
}

const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  const row = y * (W * 3 + 1);
  for (let x = 0; x < W; x++) {
    const [r, g, b] = pixel((x + 0.5) / W, (y + 0.5) / H);
    raw.set([r, g, b], row + 1 + x * 3);
  }
}

const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr.set([8, 2, 0, 0, 0], 8);

writeFileSync(
  new URL('./src/mirage-art.png', import.meta.url),
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]),
);
