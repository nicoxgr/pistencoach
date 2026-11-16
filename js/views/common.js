// Shared view helpers: escaping, icons, page header, progress ring.

import { getStatus } from '../store.js';
import { allLessons } from '../../data/lessons.js';
import { glossary } from '../../data/extras.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Glossary terms inside running text become tappable. Only the noun form is
// matched (with common endings), and each term is linked once per page.
const TERMS = glossary.map(([t]) => t).filter((t) => t !== 'Pistenfarben').sort((a, b) => b.length - a.length);
// No lookbehind: older iOS Safari does not support it.
const TERM_RE = new RegExp(`(^|[^\\wäöüÄÖÜß-])(${TERMS.join('|')})((?:es|en|s|n|e)?)(?![\\wäöüÄÖÜß-])`, 'g');

export function linkTerms(text, used) {
  return esc(text).replace(TERM_RE, (match, before, term, ending) => {
    if (used.has(term)) return match;
    used.add(term);
    return `${before}<button type="button" class="term-link" data-term="${term}">${term}${ending}</button>`;
  });
}

export const STATUS_LABEL = { open: 'Offen', practicing: 'Übe ich', done: 'Sicher' };

const FILLED = ' fill="currentColor" stroke="none"';
const ICONS = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  play: `<path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1l-11-6.8a.6.6 0 0 0-.9.5z"${FILLED}/>`,
  pause: `<rect x="6" y="5" width="4.4" height="14" rx="1.2"${FILLED}/><rect x="13.6" y="5" width="4.4" height="14" rx="1.2"${FILLED}/>`,
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mountain: '<path d="M3 19l6-10 4 6 2.5-3.5L21 19z"/>',
  film: `<circle cx="12" cy="12" r="9"/><path d="M10.2 8.6v6.8l5.6-3.4z"${FILLED}/>`,
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  note: '<path d="M4 20l4-1L19 8l-3-3L5 16z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  collapse: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  glove: '<path d="M7 11V6a2 2 0 0 1 4 0v4V5a2 2 0 0 1 4 0v6l1.5-1.8a1.8 1.8 0 0 1 2.9 2.1L16 17.5c-.9 1.6-2.4 2.5-4.2 2.5H11a4 4 0 0 1-4-4z"/>',
};

export const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

export function statusIcon(status) {
  const inner = status === 'done' ? icon('check') : '';
  return `<span class="st st-${status}" role="img" aria-label="${STATUS_LABEL[status]}">${inner}</span>`;
}

export const pisteDot = (piste) => `<span class="piste-dot piste-${piste}" aria-hidden="true"></span>`;

// Mountain ridge that closes every dark page header.
const RIDGE = `
  <svg class="ridge" viewBox="0 0 400 44" preserveAspectRatio="none" aria-hidden="true">
    <path class="ridge-back" d="M0 44 L0 20 L40 30 L84 8 L122 26 L158 14 L206 34 L252 6 L300 28 L340 16 L400 32 L400 44Z"/>
    <path class="ridge-front" d="M0 44 L0 30 L56 38 L100 20 L134 34 L176 16 L222 38 L262 24 L312 40 L352 22 L400 36 L400 44Z"/>
  </svg>`;

// Dark header block. `sub` leaves room for the fixed top bar on sub pages.
export function pageHead({ eyebrow = '', title, lead = '', extra = '', before = '', cls = '', sub = false }) {
  return `
    <header class="page-head ${sub ? 'sub' : ''} ${cls}">
      ${before}
      <div class="head-inner stagger">
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
        <h2>${esc(title)}</h2>
        ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
        ${extra}
      </div>
      ${RIDGE}
    </header>`;
}

// Progress ring, animated by CSS once the view is marked ready.
export function ring(pct, cls = '') {
  return `
    <span class="ring ${cls}" style="--to:${pct / 100}" role="img" aria-label="${pct} Prozent">
      <svg viewBox="0 0 40 40" aria-hidden="true"><circle class="trk" cx="20" cy="20" r="16"/><circle class="val" cx="20" cy="20" r="16" transform="rotate(-90 20 20)"/></svg>
      <b><span data-count="${pct}">0</span><small>%</small></b>
    </span>`;
}

// The lesson to work on next: one you are practicing, else the first not done.
export function nextLesson() {
  return allLessons.find((l) => getStatus(l.id) === 'practicing') || allLessons.find((l) => getStatus(l.id) !== 'done') || allLessons[allLessons.length - 1];
}

export function levelProgress(level) {
  const done = level.lessons.filter((l) => getStatus(l.id) === 'done').length;
  const practicing = level.lessons.filter((l) => getStatus(l.id) === 'practicing').length;
  const total = level.lessons.length;
  return { done, practicing, total, pct: Math.round(((done + practicing * 0.5) / total) * 100) };
}

export function overall() {
  const done = allLessons.filter((l) => getStatus(l.id) === 'done').length;
  const practicing = allLessons.filter((l) => getStatus(l.id) === 'practicing').length;
  const total = allLessons.length;
  return { done, practicing, open: total - done - practicing, total, pct: Math.round(((done + practicing * 0.5) / total) * 100) };
}

export const lessonMeta = (l) =>
  `<span class="meta-row">${l.time ? `<span>${icon('clock')}${l.time} min</span>` : ''}${l.scene ? `<span class="has-anim">${icon('film')}Animation</span>` : ''}</span>`;
