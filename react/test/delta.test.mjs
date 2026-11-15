import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Delta } from '../dist/Delta.js';

const html = (props) => renderToStaticMarkup(createElement(Delta, props));

test('a gain prints a plus and is success', () => {
  const out = html({ value: 3, suffix: '%' });
  assert.match(out, /text-success/);
  assert.match(out, />\+3%</);
});

test('a loss prints the real minus and is danger', () => {
  const out = html({ value: -2.5 });
  assert.match(out, /text-danger/);
  assert.match(out, />−2\.5</);
});

test('zero prints plus-minus and is neutral', () => {
  const out = html({ value: 0 });
  assert.match(out, /text-text-dim/);
  assert.match(out, />±0</);
});

test('invert flips the tones and keeps the sign', () => {
  assert.match(html({ value: -1, invert: true }), /text-success/);
  assert.match(html({ value: 1, invert: true }), /text-danger/);
  assert.match(html({ value: 1, invert: true }), />\+1</);
});

test('format receives the magnitude only', () => {
  assert.match(html({ value: -1200, format: (n) => n.toLocaleString('en-US') }), />−1,200</);
});
