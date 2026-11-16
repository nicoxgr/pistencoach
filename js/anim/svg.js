// Minimal SVG DOM helpers.

const NS = 'http://www.w3.org/2000/svg';
let counter = 0;

export function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

export function set(n, attrs) {
  for (const k in attrs) n.setAttribute(k, attrs[k]);
}

export const uid = (name) => `${name}-${++counter}`;
export const f = (x) => (Math.round(x * 10) / 10).toString();
export const deg = (r) => (r * 180) / Math.PI;
export const pts = (list) => list.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');

// Color interpolation between two hex colors.
export function mix(a, b, k) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p, s) => (p >> s) & 255;
  const c = [16, 8, 0].map((s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * k));
  return `rgb(${c.join(',')})`;
}
