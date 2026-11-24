import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MultiSelect } from '../dist/MultiSelect.js';

test('MultiSelect trigger is type="button" so it never submits a surrounding form', () => {
  const html = renderToStaticMarkup(
    createElement(MultiSelect, { options: [{ value: 'a', label: 'A' }], value: ['a'], onChange() {} }),
  );
  const buttons = html.match(/<button\b[^>]*>/g) ?? [];
  assert.ok(buttons.length > 0);
  for (const b of buttons) assert.match(b, /\btype="button"/);
});

test('MultiSelect drops a disabled option from the count badge', () => {
  const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B', disabled: true },
  ];
  const render = (value) =>
    renderToStaticMarkup(createElement(MultiSelect, { label: 'L', options, value, onChange() {} }));
  assert.doesNotMatch(render(['b']), /<span[^>]*>1<\/span>/);
  assert.match(render(['a', 'b']), />1<\/span>/);
  assert.doesNotMatch(render(['a', 'b']), />2<\/span>/);
});

test('MultiSelect Clear button is type="button" (the panel is closed in a static render)', () => {
  const js = readFileSync(new URL('../dist/MultiSelect.js', import.meta.url), 'utf8');
  assert.match(js, /_jsx\(Button, \{ type: "button", variant: "ghost"/);
});
