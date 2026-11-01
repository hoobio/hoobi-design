import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RepeatList } from '../dist/RepeatList.js';
import { describeCron } from '../dist/cron.js';

const html = (props = {}) =>
  renderToStaticMarkup(
    createElement(RepeatList, {
      items: ['a', 'b'],
      onChange() {},
      newItem: () => '',
      cells: (item) => [
        { key: 'v', node: createElement('input', { defaultValue: item }), size: 'lg' },
        { key: 'w', node: 'x', size: 'sm' },
      ],
      addLabel: 'Add folder',
      ...props,
    }),
  );

test('one row per item, each with its own remove, and one add at the end', () => {
  const out = html();
  assert.equal(out.match(/aria-label="Remove row \d"/g)?.length, 2);
  assert.equal(out.match(/Add folder/g)?.length, 1);
  assert.match(out, /grow-\[2\] basis-28/);
  assert.match(out, /basis-15/);
});

test('remove is disabled at minItems, and the header uses the cell widths', () => {
  const out = html({ minItems: 2, columns: ['Path', 'Audio'] });
  assert.equal(out.match(/disabled=""/g)?.length, 2);
  assert.match(out, /aria-hidden="true"[^]*Path[^]*Audio/);
  assert.equal(html({ items: [], columns: ['Path'] }).includes('Path'), false);
});

test('describeCron says the common shapes in words', () => {
  const cases = {
    '20 5 * * *': 'Every day at 05:20',
    '10 */6 * * *': 'Every 6 hours at :10',
    '40 * * * *': 'Every hour at :40',
    '*/5 * * * *': 'Every 5 minutes',
    '0 4 * * 1': 'Every Monday at 04:00',
    '30 2 1 * *': 'On day 1 of every month at 02:30',
    '* * * * *': 'Every minute',
    '0 3 * * 7': 'Every Sunday at 03:00',
  };
  for (const [expr, words] of Object.entries(cases)) assert.equal(describeCron(expr), words, expr);
  for (const expr of [
    '0 3 * 1 *',
    '0 1,13 * * *',
    '0 0 * * 1-5',
    '0 0 0 * * *',
    'nonsense',
    '61 * * * *',
  ])
    assert.equal(describeCron(expr), null, expr);
});
