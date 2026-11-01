import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Markdown } from '../dist/Markdown.js';

const html = (text, props = {}) =>
  renderToStaticMarkup(createElement(Markdown, props, text))
    .replace(/ class="[^"]*"/g, '')
    .replace(/^<div>|<\/div>$/g, '');

test('strong and em, nested', () => {
  assert.equal(
    html("I've read this as **Cyberpunk *Edgerunners*** not _showing_"),
    '<p>I&#x27;ve read this as <strong>Cyberpunk <em>Edgerunners</em></strong> not <em>showing</em></p>',
  );
  assert.equal(html('*a **b** c*'), '<p><em>a <strong>b</strong> c</em></p>');
});

test('unclosed and spaced delimiters stay literal', () => {
  assert.equal(html('**Cyberpunk: Edgerunners II...'), '<p>**Cyberpunk: Edgerunners II...</p>');
  assert.equal(html('5 * 3 * 2'), '<p>5 * 3 * 2</p>');
  assert.equal(html('** not bold**'), '<p>** not bold**</p>');
});

test('underscores inside words stay literal', () => {
  assert.equal(html('set snake_case_name and _a_b'), '<p>set snake_case_name and _a_b</p>');
});

test('paragraphs and line breaks', () => {
  assert.equal(html('one\ntwo\n\nthree'), '<p>one<br/>two</p><p>three</p>');
});

test('lists, with emphasis inside, opened without a blank line', () => {
  assert.equal(
    html('What landed:\n- **Audio:** eng\n* *Subtitles:* none'),
    '<p>What landed:</p><ul><li><strong>Audio:</strong> eng</li><li><em>Subtitles:</em> none</li></ul>',
  );
  assert.equal(
    html('1. **first**\n2. second'),
    '<ol><li><strong>first</strong></li><li>second</li></ol>',
  );
  assert.equal(html('*em* line'), '<p><em>em</em> line</p>');
});

test('links, headings, code and tags stay text', () => {
  const out = html('# head [x](http://y) `code` <b>raw</b>');
  assert.equal(out, '<p># head [x](http://y) `code` &lt;b&gt;raw&lt;/b&gt;</p>');
  assert.ok(!out.includes('<a'));
});

test('inline renders a span with no blocks', () => {
  assert.equal(
    renderToStaticMarkup(createElement(Markdown, { inline: true }, 'Linked to **X**')),
    '<span>Linked to <strong class="font-semibold">X</strong></span>',
  );
});
