// Level screen: what the level is about, its lessons and when you are ready
// for the next one.

import { findLevel, levels } from '../../data/lessons.js';
import { getStatus, setStatus } from '../store.js';
import { esc, icon, ring, statusIcon, pisteDot, levelProgress, pageHead, lessonMeta } from './common.js';
import { burst } from '../ui/motion.js';

export function levelView({ id }) {
  const lv = findLevel(id);
  if (!lv) return null;
  const p = levelProgress(lv);
  const minutes = lv.lessons.reduce((sum, l) => sum + (l.time || 0), 0);
  const anims = lv.lessons.filter((l) => l.scene).length;
  const nextLv = levels[levels.indexOf(lv) + 1];

  const items = lv.lessons
    .map(
      (l) => `
      <a class="lesson-item press" href="#/lektion/${l.id}">
        ${statusIcon(getStatus(l.id))}
        <span class="lesson-body">
          <span class="lesson-title"><span class="lesson-num">${l.id}</span>${esc(l.title)}</span>
          <span class="lesson-short">${esc(l.short)}</span>
          ${lessonMeta(l)}
        </span>
        ${icon('chev', 'chev')}
      </a>`,
    )
    .join('');

  return {
    title: `Stufe ${lv.id}`,
    back: '#/',
    html: `
      ${pageHead({
        sub: true,
        cls: `piste-${lv.piste}`,
        eyebrow: `${pisteDot(lv.piste)}${esc(lv.pisteLabel)}`,
        title: lv.title,
        lead: lv.summary,
        extra: `
          <div class="head-stats">
            ${ring(p.pct, 'on-dark')}
            <span class="stat"><b>${p.done}/${p.total}</b>sicher</span>
            <span class="stat"><b>${minutes}</b>min Übung</span>
            <span class="stat"><b>${anims}</b>${anims === 1 ? 'Animation' : 'Animationen'}</span>
          </div>`,
      })}
      <section class="card">
        <h3 class="card-title">${icon('target')}Am Ende dieser Stufe</h3>
        <ul class="goals">${lv.goals.map((g) => `<li>${icon('check')}<span>${esc(g)}</span></li>`).join('')}</ul>
      </section>
      <h3 class="section-title">Lektionen</h3>
      <div class="lesson-list stagger">${items}</div>
      <section class="card ready">
        <h3 class="card-title">${icon('flag')}${nextLv ? `Bereit für Stufe ${nextLv.id}, wenn …` : 'Geschafft, wenn …'}</h3>
        <p>${esc(lv.ready)}</p>
        ${nextLv ? `<a class="link-row" href="#/stufe/${nextLv.id}">Stufe ${nextLv.id}: ${esc(nextLv.title)}${icon('chev')}</a>` : ''}
      </section>
      ${p.done < p.total ? '<button class="btn ghost wide press" data-all>Ganze Stufe als „sicher“ markieren</button>' : ''}
    `,
    mount(root, rerender) {
      const b = root.querySelector('[data-all]');
      if (b)
        b.onclick = () => {
          burst(b);
          lv.lessons.forEach((l) => setStatus(l.id, 'done'));
          rerender();
        };
    },
  };
}
