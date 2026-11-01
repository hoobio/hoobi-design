import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Table } from '../dist/Table.js';

const rows = [{ key: 'a' }, { key: 'b' }];
const html = (props = {}) =>
  renderToStaticMarkup(
    createElement(Table, {
      rows,
      rowKey: (r) => r.key,
      columns: [
        { id: 'key', header: 'key', primary: true, cell: (r) => r.key },
        { id: 'more', header: 'more', cell: () => 'x' },
      ],
      rowAction: () => 'go',
      selection: { selected: new Set(), onChange() {} },
      ...props,
    }),
  );
const render = (r) => createElement('p', { id: `panel-${r.key}` }, r.key);

test('an expanded row renders its panel across every column', () => {
  const out = html({ expansion: { expanded: new Set(['b']), render } });
  assert.equal(out.match(/data-expansion/g)?.length, 1);
  assert.match(out, /<td colSpan="4"[^>]*><p id="panel-b">b<\/p><\/td>/);
});

test('collapsed rows render no panel, and an empty expansion matches none', () => {
  const out = html({ expansion: { expanded: new Set(), render } });
  assert.doesNotMatch(out, /data-expansion/);
  assert.equal(out, html());
});

test('a header accessory renders beside the sort button, not inside it', () => {
  const out = html({
    onSortChange() {},
    columns: [
      { id: 'key', header: 'key', primary: true, cell: (r) => r.key },
      {
        id: 'more',
        header: 'more',
        sortValue: (r) => r.key,
        headerAccessory: createElement('i', { id: 'info' }, 'i'),
        cell: () => 'x',
      },
    ],
  });
  const th = out.match(/<th[^>]*>(?:(?!<\/th>).)*id="info"(?:(?!<\/th>).)*<\/th>/s)?.[0] ?? '';
  assert.match(
    th,
    /<span class="inline-flex items-center gap-1"><button[^>]*>.*<\/button><i id="info">i<\/i><\/span>/s,
  );
  assert.doesNotMatch(th, /<button[^>]*>(?:(?!<\/button>).)*id="info"/s);
});
