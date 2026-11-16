// Lesson screen: animation, cues, expandable sections, self-check and status.
// Only the essentials are open at first; everything else unfolds on tap.

import { allLessons, findLesson } from '../../data/lessons.js';
import { scenes } from '../anim/scenes/index.js';
import { createPlayer } from '../anim/player.js';
import { getStatus, setStatus, getNote, setNote, getChecks, toggleCheck, STATUS } from '../store.js';
import { esc, icon, pisteDot, pageHead, STATUS_LABEL } from './common.js';
import { setSeg, burst, pop, reduced } from '../ui/motion.js';

const section = (key, ic, title, count, body, open = false) => `
  <details class="card acc" data-acc="${key}"${open ? ' open' : ''}>
    <summary>
      <span class="acc-ic acc-${key}">${icon(ic)}</span>
      <span class="acc-title">${title}</span>
      ${count ? `<span class="acc-count">${count}</span>` : ''}
      ${icon('down', 'acc-chev')}
    </summary>
    <div class="acc-body"><div class="acc-pad">${body}</div></div>
  </details>`;

export function lessonView({ id }) {
  const l = findLesson(id);
  if (!l) return null;
  const idx = allLessons.findIndex((x) => x.id === id);
  const prev = allLessons[idx - 1];
  const next = allLessons[idx + 1];
  const status = getStatus(id);
  const checked = getChecks(id);
  let player = null;

  const sections = [
    section('focus', 'eye', 'Worauf du achtest', l.focus.length, `<ul class="focus">${l.focus.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`, true),
    section(
      'why',
      'bulb',
      'Warum das funktioniert',
      0,
      `<p>${esc(l.why)}</p><p class="feel"><span class="lbl good">So fühlt es sich an</span>${esc(l.feel)}</p>`,
    ),
    section(
      'mistakes',
      'alert',
      'Typische Fehler',
      l.mistakes.length,
      l.mistakes
        .map(
          (m) => `
          <div class="mistake">
            <b>${esc(m.title)}</b>
            <p><span class="lbl">Warum</span>${esc(m.cause)}</p>
            <p><span class="lbl good">Besser</span>${esc(m.fix)}</p>
          </div>`,
        )
        .join(''),
    ),
    section('drills', 'flag', 'Übungen auf der Piste', l.drills.length, `<ol class="drills">${l.drills.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`),
    section(
      'checks',
      'target',
      'Geschafft, wenn …',
      `<span data-checkcount>${checked.length}</span>/${l.checks.length}`,
      `<div class="checks">${l.checks
        .map(
          (x, i) => `
          <button type="button" class="check${checked.includes(i) ? ' on' : ''}" data-check="${i}" aria-pressed="${checked.includes(i)}">
            <span class="box">${icon('check')}</span><span>${esc(x)}</span>
          </button>`,
        )
        .join('')}</div>
      <button type="button" class="btn primary wide press all-done" data-alldone hidden>Alles erfüllt: als sicher markieren</button>`,
      true,
    ),
  ].join('');

  return {
    title: `Lektion ${l.id}`,
    back: `#/stufe/${l.level.id}`,
    html: `
      ${pageHead({
        sub: true,
        cls: `piste-${l.level.piste}`,
        eyebrow: `${pisteDot(l.level.piste)}Stufe ${l.level.id} · ${esc(l.level.title)}`,
        title: l.title,
        lead: l.short,
        extra: `<div class="facts"><span class="fact">${icon('clock')}${l.time} min</span><span class="fact">${icon('mountain')}${esc(l.terrain)}</span></div>`,
      })}
      <div data-player></div>
      ${l.safety ? `<div class="card safety">${icon('shield')}<p>${esc(l.safety)}</p></div>` : ''}
      <section class="cue-box">
        <h3 class="mini-title">Merksätze für die Piste</h3>
        <div class="cue-strip stagger">${l.cues.map((c) => `<span class="cue">${esc(c)}</span>`).join('')}</div>
      </section>
      ${sections}
      <section class="card status-card">
        <h3 class="card-title">${icon('note')}Dein Stand</h3>
        <div class="seg seg-status" role="radiogroup" aria-label="Status">
          ${STATUS.map((s) => `<button type="button" role="radio" data-st="${s}" aria-checked="${s === status}">${STATUS_LABEL[s]}</button>`).join('')}
        </div>
        <label class="note-label" for="note">Notiz</label>
        <textarea id="note" rows="3" placeholder="Was hat geklappt, was nicht?">${esc(getNote(id))}</textarea>
        <p class="saved" data-saved aria-live="polite"></p>
      </section>
      <nav class="pager">
        ${prev ? `<a class="pager-btn press" href="#/lektion/${prev.id}">${icon('back')}<span><small>Zurück · ${prev.id}</small><b>${esc(prev.title)}</b></span></a>` : '<span></span>'}
        ${next ? `<a class="pager-btn next press" href="#/lektion/${next.id}"><span><small>Weiter · ${next.id}</small><b>${esc(next.title)}</b></span>${icon('chev')}</a>` : '<span></span>'}
      </nav>
    `,
    mount(root) {
      const slot = root.querySelector('[data-player]');
      if (l.scene && scenes[l.scene]) {
        player = createPlayer(scenes[l.scene]);
        slot.append(player.el);
      } else slot.remove();

      // Status
      const seg = root.querySelector('.seg-status');
      const stButtons = [...seg.querySelectorAll('[data-st]')];
      const allDone = root.querySelector('[data-alldone]');
      const applyStatus = (s, celebrate) => {
        setStatus(id, s);
        setSeg(seg, STATUS.indexOf(s));
        seg.dataset.value = s;
        if (s === 'done' && celebrate) burst(stButtons[2]);
        syncAllDone();
      };
      const syncAllDone = () => {
        const full = getChecks(id).length === l.checks.length;
        allDone.hidden = !(full && getStatus(id) !== 'done');
      };
      setSeg(seg, STATUS.indexOf(status));
      seg.dataset.value = status;
      stButtons.forEach((b) => (b.onclick = () => applyStatus(b.dataset.st, true)));

      // Self-check
      const count = root.querySelector('[data-checkcount]');
      root.querySelectorAll('[data-check]').forEach((b) => {
        b.onclick = () => {
          const on = toggleCheck(id, Number(b.dataset.check));
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', on);
          count.textContent = getChecks(id).length;
          if (on) pop(b.querySelector('.box'));
          const wasHidden = allDone.hidden;
          syncAllDone();
          if (wasHidden && !allDone.hidden && !reduced()) allDone.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
        };
      });
      allDone.onclick = () => {
        burst(allDone);
        applyStatus('done', false);
      };
      syncAllDone();

      // Note with a quiet "saved" hint
      let timer;
      let hint;
      const note = root.querySelector('#note');
      const saved = root.querySelector('[data-saved]');
      const store = () => {
        setNote(id, note.value);
        saved.textContent = 'Gespeichert';
        saved.classList.add('show');
        clearTimeout(hint);
        hint = setTimeout(() => saved.classList.remove('show'), 1400);
      };
      note.oninput = () => {
        clearTimeout(timer);
        timer = setTimeout(store, 500);
      };
      note.onblur = () => {
        clearTimeout(timer);
        if (note.value !== getNote(id)) store();
      };
    },
    destroy() {
      if (player) player.destroy();
    },
  };
}
