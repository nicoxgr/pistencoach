// Start screen: next step and the learning path.

import { levels } from '../../data/lessons.js';
import { esc, nextLesson, levelProgress, pisteDot, STATUS_LABEL } from './common.js';
import { getStatus } from '../store.js';

export function homeView() {
  const next = nextLesson();
  const st = getStatus(next.id);
  const path = levels
    .map((lv) => {
      const p = levelProgress(lv);
      const pct = Math.round(((p.done + p.practicing * 0.5) / p.total) * 100);
      const complete = p.done === p.total;
      return `
      <a class="level-card piste-${lv.piste}${complete ? ' complete' : ''}" href="#/stufe/${lv.id}">
        <span class="level-num">${lv.id}</span>
        <span class="level-body">
          <span class="level-title">${esc(lv.title)}</span>
          <span class="level-meta">${pisteDot(lv.piste)} ${esc(lv.pisteLabel)} · ${p.done}/${p.total} sicher</span>
          <span class="bar"><span style="width:${pct}%"></span></span>
        </span>
        <span class="chev" aria-hidden="true">›</span>
      </a>`;
    })
    .join('');

  return {
    title: 'Pistencoach',
    html: `
      <section class="next-card piste-${next.level.piste}">
        <p class="eyebrow">Dein nächster Schritt</p>
        <h2>${esc(next.title)}</h2>
        <p>${esc(next.short)}</p>
        <div class="next-foot">
          <span class="tag">Stufe ${next.level.id} · ${STATUS_LABEL[st]}</span>
          <a class="btn primary" href="#/lektion/${next.id}">${st === 'open' ? 'Los geht’s' : 'Weiter üben'}</a>
        </div>
      </section>
      <h3 class="section-title">Lernpfad</h3>
      <div class="path">${path}</div>
      <p class="fineprint">Die App ersetzt keinen Skilehrer. Fahr nur, was du sicher kontrollieren kannst.</p>
    `,
  };
}
