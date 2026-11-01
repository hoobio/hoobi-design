import assert from 'node:assert/strict';
import { test } from 'node:test';

const { tipPosition } = await import('../dist/tip.js');

const rect = (left, top, width = 100, height = 32) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});
const tip = { width: 200, height: 40 };

test('an above tip with room sits centred over the anchor', () => {
  assert.deepEqual(tipPosition(rect(400, 300), 'above', tip, 1000, 800), {
    x: 450,
    y: 294,
    below: false,
  });
});

test('an above tip near the right edge is clamped inside the margin', () => {
  assert.equal(tipPosition(rect(880, 300), 'above', tip, 1000, 800).x, 1000 - 8 - 100);
  assert.equal(tipPosition(rect(0, 300, 20), 'above', tip, 1000, 800).x, 8 + 100);
});

test('an above tip with no room above flips below the anchor', () => {
  assert.deepEqual(tipPosition(rect(400, 20), 'above', tip, 1000, 800), {
    x: 450,
    y: 58,
    below: true,
  });
});

test('an unknown height never flips', () => {
  assert.equal(
    tipPosition(rect(400, 20), 'above', { width: 200, height: NaN }, 1000, 800).below,
    false,
  );
});

test('a right tip with no room on the right goes to the left of the anchor', () => {
  assert.equal(tipPosition(rect(400, 300), 'right', tip, 1000, 800).x, 508);
  assert.equal(tipPosition(rect(850, 300), 'right', tip, 1000, 800).x, 850 - 8 - 200);
});

test('a right tip is kept inside the top and bottom margins', () => {
  assert.equal(tipPosition(rect(400, 0, 100, 10), 'right', tip, 1000, 800).y, 8 + 20);
  assert.equal(tipPosition(rect(400, 790, 100, 10), 'right', tip, 1000, 800).y, 800 - 8 - 20);
});
