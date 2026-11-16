// History: what changed on which day, newest first.

import { findLesson, findLevel } from '../../data/lessons.js';
import { getLog } from '../store.js';
import { esc, icon, pageHead, statusIcon, STATUS_LABEL } from './common.js';

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const dayFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export function groupByDay(log) {
  const days = [];
  for (const e of [...log].reverse()) {
    const d = new Date(e.at);
    if (Number.isNaN(d.getTime())) continue;
    const key = dayKey(d);
    let day = days.find((x) => x.key === key);
    if (!day) days.push((day = { key, date: d, entries: [] }));
    day.entries.push({ ...e, date: d });
  }
  return days;
}

function row(e) {
  if (e.placement) {
    const lv = findLevel(e.placement);
    return `<li>${statusIcon('done')}<span class="hist-body"><b>Einstufung</b><span>Alles bis Stufe ${e.placement}${lv ? `: ${esc(lv.title)}` : ''} als sicher übernommen</span></span><time>${timeFmt.format(e.date)}</time></li>`;
  }
  const l = findLesson(e.id);
  if (!l) return '';
  return `<li>${statusIcon(e.status)}<a class="hist-body" href="#/lektion/${l.id}"><b>${l.id} ${esc(l.title)}</b><span>${STATUS_LABEL[e.status] || ''}</span></a><time>${timeFmt.format(e.date)}</time></li>`;
}

export function historyView() {
  const days = groupByDay(getLog());
  const done = getLog().filter((e) => e.status === 'done').length;
  return {
    title: 'Verlauf',
    back: '#/coach',
    html: `
      ${pageHead({
        sub: true,
        title: 'Verlauf',
        lead: 'Was du an welchem Tag geübt und abgehakt hast.',
        extra: `<div class="head-stats"><span class="stat"><b>${days.length}</b>${days.length === 1 ? 'Übungstag' : 'Übungstage'}</span><span class="stat"><b>${done}</b>mal „sicher“</span></div>`,
      })}
      ${
        days.length
          ? `<div class="stagger">${days
              .map(
                (d) => `
              <section class="card hist">
                <h3 class="card-title">${icon('clock')}${dayFmt.format(d.date)}</h3>
                <ul>${d.entries.map(row).join('')}</ul>
              </section>`,
              )
              .join('')}</div>`
          : `<div class="card empty"><b>Noch nichts passiert</b><p>Sobald du bei einer Lektion deinen Stand änderst, erscheint der Tag hier.</p><a class="btn primary press" href="#/">Zum Lernpfad</a></div>`
      }
    `,
  };
}
