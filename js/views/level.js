// Level screen: lessons of one level with their status.

import { findLevel } from '../../data/lessons.js';
import { getStatus, setStatus } from '../store.js';
import { esc, statusIcon, pisteDot, levelProgress } from './common.js';

export function levelView({ id }) {
  const lv = findLevel(id);
  if (!lv) return null;
  const p = levelProgress(lv);
  const items = lv.lessons
    .map(
      (l) => `
      <a class="lesson-item" href="#/lektion/${l.id}">
        ${statusIcon(getStatus(l.id))}
        <span class="lesson-body">
          <span class="lesson-title">${l.id} ${esc(l.title)}</span>
          <span class="lesson-short">${esc(l.short)}</span>
        </span>
        ${l.scene ? '<span class="tag anim">Animation</span>' : ''}
      </a>`,
    )
    .join('');

  return {
    title: `Stufe ${lv.id}`,
    back: '#/',
    html: `
      <header class="level-head piste-${lv.piste}">
        <p class="eyebrow">${pisteDot(lv.piste)} ${esc(lv.pisteLabel)}</p>
        <h2>${esc(lv.title)}</h2>
        <p>${esc(lv.summary)}</p>
        <p class="level-meta">${p.done} von ${p.total} sicher</p>
      </header>
      <div class="lesson-list">${items}</div>
      ${p.done < p.total ? '<button class="btn ghost wide" data-all>Ganze Stufe als „sicher“ markieren</button>' : ''}
    `,
    mount(root, rerender) {
      const b = root.querySelector('[data-all]');
      if (b)
        b.onclick = () => {
          lv.lessons.forEach((l) => setStatus(l.id, 'done'));
          rerender();
        };
    },
  };
}
