import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RadioCards } from '../dist/RadioCards.js';

const html = (value, extra = {}) =>
  renderToStaticMarkup(
    createElement(RadioCards, {
      legend: 'Starting gear',
      name: 'gear',
      value,
      onChange() {},
      options: [
        {
          value: 'worn',
          title: 'Worn',
          description: 'What the character wears',
          detail: createElement('i', null, 'DETAIL'),
        },
        { value: 'bags', title: 'Bags', disabled: true, disabledReason: 'No bags synced' },
      ],
      ...extra,
    }),
  );

test('a fieldset with a legend and one native radio per option', () => {
  const out = html('worn');
  assert.match(out, /<fieldset/);
  assert.match(out, /<legend/);
  assert.equal(out.match(/type="radio"/g)?.length, 2);
});

test('detail shows only under the selected option', () => {
  assert.match(html('worn'), /DETAIL/);
  assert.doesNotMatch(html('bags'), /DETAIL/);
});

test('a disabled option carries its reason as a tooltip', () => {
  assert.match(html('worn'), /data-tip="No bags synced"/);
});
