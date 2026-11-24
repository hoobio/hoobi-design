import assert from 'node:assert/strict';
import { test } from 'node:test';

class Node {}
class Element extends Node {
  constructor(tag) {
    super();
    this.tagName = tag;
    this.children = [];
    this.parentElement = null;
    this.attrs = new Map();
    this.dataset = {};
    this.style = {};
    this.open = false;
  }
  get id() {
    return this.attrs.get('id') ?? '';
  }
  set id(v) {
    this.attrs.set('id', v);
  }
  get isConnected() {
    let n = this;
    while (n.parentElement) n = n.parentElement;
    return n === globalThis.document.documentElement;
  }
  setAttribute(k, v) {
    this.attrs.set(k, String(v));
  }
  getAttribute(k) {
    return this.attrs.get(k) ?? null;
  }
  hasAttribute(k) {
    return this.attrs.has(k);
  }
  removeAttribute(k) {
    this.attrs.delete(k);
  }
  append(child) {
    child.remove();
    child.parentElement = this;
    this.children.push(child);
  }
  remove() {
    if (!this.parentElement) return;
    const siblings = this.parentElement.children;
    siblings.splice(siblings.indexOf(this), 1);
    this.parentElement = null;
  }
  contains(other) {
    for (let n = other; n; n = n.parentElement) if (n === this) return true;
    return false;
  }
  closest(sel) {
    for (let n = this; n; n = n.parentElement) if (n.matches(sel)) return n;
    return null;
  }
  matches(sel) {
    if (sel === ':popover-open') return this.open;
    if (sel.startsWith('[data-tip]')) return 'tip' in this.dataset;
    return false;
  }
  showPopover() {
    this.open = true;
  }
  hidePopover() {
    this.open = false;
  }
  getBoundingClientRect() {
    return { left: 400, top: 300, right: 420, bottom: 316, width: 20, height: 16 };
  }
}
class HTMLElement extends Element {}

const listeners = {};
const html = new HTMLElement('html');
const body = new HTMLElement('body');
html.append(body);
html.clientWidth = 1000;
html.clientHeight = 800;
let observers = 0;
Object.assign(globalThis, {
  Node,
  Element,
  HTMLElement,
  window: { addEventListener() {} },
  MutationObserver: class {
    observe() {
      observers++;
    }
    disconnect() {}
  },
  document: {
    documentElement: html,
    body,
    createElement: (tag) => new HTMLElement(tag),
    addEventListener: (type, fn) => {
      listeners[type] = fn;
    },
  },
});
const { hideTip } = await import('../dist/tip.js');

test('a tip anchored inside a clipping flyout is shown outside it, in the top layer', () => {
  const panel = new HTMLElement('div');
  panel.style.overflow = 'hidden';
  panel.style.backdropFilter = 'blur(24px)';
  body.append(panel);
  const info = new HTMLElement('span');
  info.dataset.tip = 'Seconds per pull';
  panel.append(info);

  listeners.mouseover({ target: info });
  const tip = body.children.find((c) => c.className === 'tip-layer');
  assert.ok(tip, 'the tip box is a child of body');
  assert.equal(panel.contains(tip), false);
  assert.equal(tip.textContent, 'Seconds per pull');
  assert.equal(tip.getAttribute('popover'), 'manual');
  assert.equal(tip.open, true);
  assert.equal(info.getAttribute('aria-describedby'), tip.id);
  assert.ok(observers > 0);

  listeners.mouseout({ target: info, relatedTarget: panel });
  assert.equal(tip.parentElement, null);
  assert.equal(tip.open, false);
  assert.equal(info.hasAttribute('aria-describedby'), false);
});

test('Escape hides the tip and an SVG data-tip gets none', () => {
  const info = new HTMLElement('span');
  info.dataset.tip = 'x';
  body.append(info);
  listeners.mouseover({ target: info });
  listeners.keydown({ key: 'Escape' });
  assert.equal(
    body.children.some((c) => c.className === 'tip-layer'),
    false,
  );

  const bar = new Element('rect');
  bar.dataset.tip = 'chart draws its own';
  body.append(bar);
  listeners.mouseover({ target: bar });
  assert.equal(
    body.children.some((c) => c.className === 'tip-layer'),
    false,
  );
  hideTip();
});
