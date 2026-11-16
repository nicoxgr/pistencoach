// Lesson screen: animation, explanation, drills, self-check and status.

import { allLessons, findLesson } from '../../data/lessons.js';
import { scenes } from '../anim/scenes/index.js';
import { createPlayer } from '../anim/player.js';
import { getStatus, setStatus, getNote, setNote, STATUS } from '../store.js';
import { esc, pisteDot, STATUS_LABEL } from './common.js';

export function lessonView({ id }) {
  const l = findLesson(id);
  if (!l) return null;
  const idx = allLessons.findIndex((x) => x.id === id);
  const prev = allLessons[idx - 1];
  const next = allLessons[idx + 1];
  const stub = !l.focus;
  let player = null;

  const sections = stub
    ? `<div class="card soon"><b>Kommt bald</b><p>Erklärung, Animation und Übungen für diese Lektion folgen in einem der nächsten Updates.</p></div>`
    : `
      <section class="card">
        <h3>Worauf du achtest</h3>
        <ul class="focus">${l.focus.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </section>
      <section class="card">
        <h3>Typische Fehler</h3>
        ${l.mistakes
          .map(
            (m) => `
          <details class="mistake">
            <summary>${esc(m.title)}</summary>
            <p><span class="lbl">Warum</span>${esc(m.cause)}</p>
            <p><span class="lbl good">Besser</span>${esc(m.fix)}</p>
          </details>`,
          )
          .join('')}
      </section>
      <section class="card">
        <h3>Übungen auf der Piste</h3>
        <ol class="drills">${l.drills.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      </section>
      <section class="card">
        <h3>Geschafft, wenn …</h3>
        <ul class="checks">${l.checks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </section>`;

  const status = getStatus(id);

  return {
    title: `Lektion ${l.id}`,
    back: `#/stufe/${l.level.id}`,
    html: `
      <header class="lesson-head">
        <p class="eyebrow">${pisteDot(l.level.piste)} Stufe ${l.level.id} · ${esc(l.level.title)}</p>
        <h2>${esc(l.title)}</h2>
        <p class="lead">${esc(l.short)}</p>
      </header>
      <div data-player></div>
      ${sections}
      <section class="card status-card">
        <h3>Dein Stand</h3>
        <div class="seg seg-status" role="radiogroup" aria-label="Status">
          ${STATUS.map((s) => `<button type="button" role="radio" data-st="${s}" class="${s === status ? 'on' : ''}" aria-checked="${s === status}">${STATUS_LABEL[s]}</button>`).join('')}
        </div>
        <label class="note-label" for="note">Notiz</label>
        <textarea id="note" rows="3" placeholder="Was hat geklappt, was nicht?">${esc(getNote(id))}</textarea>
      </section>
      <nav class="pager">
        ${prev ? `<a class="btn ghost" href="#/lektion/${prev.id}">‹ ${prev.id}</a>` : '<span></span>'}
        ${next ? `<a class="btn ghost" href="#/lektion/${next.id}">${next.id} ›</a>` : '<span></span>'}
      </nav>
    `,
    mount(root) {
      const slot = root.querySelector('[data-player]');
      if (l.scene && scenes[l.scene]) {
        player = createPlayer(scenes[l.scene]);
        slot.append(player.el);
      } else slot.remove();

      root.querySelectorAll('[data-st]').forEach((b) => {
        b.onclick = () => {
          setStatus(id, b.dataset.st);
          root.querySelectorAll('[data-st]').forEach((x) => {
            x.classList.toggle('on', x === b);
            x.setAttribute('aria-checked', x === b);
          });
        };
      });
      let timer;
      const note = root.querySelector('#note');
      note.oninput = () => {
        clearTimeout(timer);
        timer = setTimeout(() => setNote(id, note.value), 400);
      };
      note.onblur = () => setNote(id, note.value);
    },
    destroy() {
      if (player) player.destroy();
    },
  };
}
