import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ColumnSelect, edgeOption, matchOption, stepOption } from '../dist/ColumnSelect.js';

const options = [
  { value: 'tiger', label: 'of the Tiger', detail: '+15 Agi, +15 Str', trailing: '42.0' },
  { value: 'bear', label: 'of the Bear', detail: '+15 Sta, +15 Str', disabled: true },
  { value: 'monkey', label: 'of the Monkey', detail: '+15 Agi, +15 Sta', trailing: '38.5' },
  { value: 'eagle', label: 'of the Eagle', detail: '+15 Int, +15 Sta', trailing: '12.1' },
];

const html = (value, extra = {}) =>
  renderToStaticMarkup(
    createElement(ColumnSelect, { label: 'Suffix', options, value, onChange() {}, ...extra }),
  );

test('the closed trigger is a collapsed combobox showing the selected label and detail', () => {
  const out = html('monkey');
  assert.match(out, /role="combobox"/);
  assert.match(out, /aria-haspopup="listbox"/);
  assert.match(out, /aria-expanded="false"/);
  assert.match(out, /of the Monkey/);
  assert.match(out, /\+15 Agi, \+15 Sta/);
  assert.doesNotMatch(out, /role="listbox"/);
});

test('no selection shows the placeholder', () => {
  assert.match(html(undefined, { placeholder: 'No suffix' }), /No suffix/);
});

test('arrow steps skip disabled options and stop at the ends', () => {
  assert.equal(stepOption(options, 0, 1), 2);
  assert.equal(stepOption(options, 2, -1), 0);
  assert.equal(stepOption(options, 3, 1), 3);
  assert.equal(edgeOption(options, false), 0);
  assert.equal(edgeOption(options, true), 3);
});

test('type-ahead matches a multi-character label prefix and skips disabled options', () => {
  assert.equal(matchOption(options, 0, 'of the m'), 2);
  assert.equal(matchOption(options, 0, 'of the b'), -1);
  assert.equal(matchOption(options, 2, 'of the'), 2);
  assert.equal(matchOption(options, 0, 'o'), 2);
  assert.equal(matchOption(options, 3, 'o'), 0);
});
