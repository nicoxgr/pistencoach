// Shared view helpers.

import { getStatus } from '../store.js';
import { allLessons } from '../../data/lessons.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const STATUS_LABEL = { open: 'Offen', practicing: 'Übe ich', done: 'Sicher' };

export function statusIcon(status) {
  const cls = `st st-${status}`;
  const label = STATUS_LABEL[status];
  return `<span class="${cls}" role="img" aria-label="${label}"></span>`;
}

export const pisteDot = (piste) => `<span class="piste-dot piste-${piste}" aria-hidden="true"></span>`;

// The lesson to work on next: one you are practicing, else the first not done.
export function nextLesson() {
  return allLessons.find((l) => getStatus(l.id) === 'practicing') || allLessons.find((l) => getStatus(l.id) !== 'done') || allLessons[allLessons.length - 1];
}

export function levelProgress(level) {
  const done = level.lessons.filter((l) => getStatus(l.id) === 'done').length;
  const practicing = level.lessons.filter((l) => getStatus(l.id) === 'practicing').length;
  return { done, practicing, total: level.lessons.length };
}
