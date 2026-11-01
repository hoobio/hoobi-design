import assert from 'node:assert/strict';
import { test } from 'node:test';

globalThis.window = { innerWidth: 1000, innerHeight: 800 };
const { placeFlyout, placeSubmenu, cssLength } = await import('../dist/flyout.js');

const rect = (left, top, width = 100, height = 32) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});
const panel = { width: 224, height: 200 };

test('a trigger in the left half hangs the panel from its left edge', () => {
  const p = placeFlyout(rect(100, 100), panel);
  assert.equal(p.left, 100);
  assert.equal(p.top, 136);
});

test('a trigger in the right half hangs the panel from its right edge', () => {
  const p = placeFlyout(rect(800, 100), panel);
  assert.equal(p.left, 900 - 224);
});

test('an explicit placement beats the page side', () => {
  assert.equal(placeFlyout(rect(700, 100), panel, 'bottom-start').left, 700);
  assert.equal(placeFlyout(rect(300, 100), panel, 'bottom-end').left, 176);
});

test('the panel flips above when there is no room below', () => {
  const p = placeFlyout(rect(100, 700), panel);
  assert.equal(p.top, 700 - 200 - 4);
});

test('a panel taller than either side is capped to the roomier side', () => {
  const p = placeFlyout(rect(100, 100), { width: 224, height: 900 });
  assert.equal(p.room, 800 - 132 - 4 - 8);
  assert.equal(p.top, 136);
});

test('a submenu opens right of its parent, its first row level with the row', () => {
  const p = placeSubmenu({ top: 200 }, { left: 100, right: 324 }, panel);
  assert.equal(p.left, 328);
  assert.equal(p.top, 196);
  assert.equal(p.maxHeight, 784);
});

test('a submenu flips left of its parent at the right viewport edge', () => {
  const p = placeSubmenu({ top: 200 }, { left: 700, right: 924 }, panel);
  assert.equal(p.left, 700 - 4 - 224);
});

test('a cascade that flipped left keeps going left while it fits', () => {
  const p = placeSubmenu({ top: 200 }, { left: 500, right: 724 }, panel, true);
  assert.equal(p.left, 500 - 4 - 224);
  assert.equal(p.leftward, true);
  assert.equal(placeSubmenu({ top: 200 }, { left: 100, right: 324 }, panel, true).leftward, false);
});

test('a submenu with no room on either side stays on screen', () => {
  const p = placeSubmenu({ top: 200 }, { left: 100, right: 900 }, panel);
  assert.ok(p.left >= 8 && p.left + 224 <= 992);
});

test('a submenu near the bottom moves up to stay on screen', () => {
  const p = placeSubmenu({ top: 750 }, { left: 100, right: 324 }, panel);
  assert.equal(p.top, 800 - 200 - 8);
});

test('cssLength turns a number into px and leaves a string', () => {
  assert.equal(cssLength(192), '192px');
  assert.equal(cssLength('20rem'), '20rem');
});
