// Slope mode: one thought per screen, huge type and buttons that work with
// gloves. Shows the cues and drills of one lesson and ends with the status.

import { findLesson } from '../../data/lessons.js';
import { setStatus, getStatus, STATUS } from '../store.js';
import { esc, icon, nextLesson, STATUS_LABEL } from './common.js';
import { burst, reduced } from '../ui/motion.js';

export function pisteView({ id }) {
  const l = id ? findLesson(id) : nextLesson();
  if (!l) return null;
  const slides = [
    ...l.cues.map((text, i) => ({ kind: `Merksatz ${i + 1} von ${l.cues.length}`, text, big: true })),
    ...l.drills.map((text, i) => ({ kind: `Übung ${i + 1} von ${l.drills.length}`, text })),
    { kind: 'Nach der Abfahrt', rate: true },
  ];
  let i = 0;
  let lock = null;
  let touchX = null;

  const wake = async () => {
    try {
      if (navigator.wakeLock && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen');
    } catch {
      /* not allowed or not supported: the screen may dim */
    }
  };
  const onVisible = () => document.visibilityState === 'visible' && wake();

  return {
    title: 'Pistenmodus',
    html: `
      <section class="piste piste-${l.level.piste}" aria-label="Pistenmodus">
        <header class="piste-top">
          <a class="piste-x" href="#/lektion/${l.id}" aria-label="Pistenmodus beenden">${icon('x')}</a>
          <span class="piste-title">${l.id} · ${esc(l.title)}</span>
          <span class="piste-count" data-count-label></span>
        </header>
        <div class="piste-dots" aria-hidden="true">${slides.map(() => '<i></i>').join('')}</div>
        <div class="piste-card" data-card aria-live="polite"></div>
        <footer class="piste-nav">
          <button type="button" class="piste-btn" data-prev aria-label="Zurück">${icon('back')}</button>
          <button type="button" class="piste-btn main" data-next>Weiter${icon('chev')}</button>
        </footer>
      </section>
    `,
    mount(root) {
      const card = root.querySelector('[data-card]');
      const dots = [...root.querySelectorAll('.piste-dots i')];
      const prev = root.querySelector('[data-prev]');
      const next = root.querySelector('[data-next]');
      const label = root.querySelector('[data-count-label]');

      const show = (dir) => {
        const s = slides[i];
        card.innerHTML = s.rate
          ? `<p class="piste-kind">${s.kind}</p>
             <p class="piste-text">Wie lief es?</p>
             <div class="piste-rate">
               ${[...STATUS].reverse().map((st) => `<button type="button" class="piste-btn rate-${st}${getStatus(l.id) === st ? ' on' : ''}" data-rate="${st}">${STATUS_LABEL[st]}</button>`).join('')}
             </div>`
          : `<p class="piste-kind">${s.kind}</p><p class="piste-text${s.big ? ' big' : ''}">${esc(s.text)}</p>`;
        dots.forEach((d, j) => d.classList.toggle('on', j <= i));
        label.textContent = `${i + 1}/${slides.length}`;
        prev.disabled = i === 0;
        next.hidden = !!s.rate;
        if (dir && !reduced()) card.animate([{ opacity: 0, transform: `translateX(${dir * 40}px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
        card.querySelectorAll('[data-rate]').forEach((b) => {
          b.onclick = () => {
            setStatus(l.id, b.dataset.rate);
            card.querySelectorAll('[data-rate]').forEach((x) => x.classList.toggle('on', x === b));
            if (b.dataset.rate === 'done') burst(b);
            setTimeout(() => (location.hash = `#/lektion/${l.id}`), b.dataset.rate === 'done' ? 600 : 250);
          };
        });
      };
      const go = (d) => {
        const n = Math.min(slides.length - 1, Math.max(0, i + d));
        if (n === i) return;
        i = n;
        show(d);
      };
      prev.onclick = () => go(-1);
      next.onclick = () => go(1);
      card.onclick = (e) => !e.target.closest('button') && go(1);
      const section = root.querySelector('.piste');
      section.addEventListener('touchstart', (e) => (touchX = e.touches[0].clientX), { passive: true });
      section.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      });
      this.onKey = (e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'Escape') location.hash = `#/lektion/${l.id}`;
      };
      document.addEventListener('keydown', this.onKey);
      document.addEventListener('visibilitychange', onVisible);
      wake();
      show(0);
    },
    destroy() {
      document.removeEventListener('keydown', this.onKey);
      document.removeEventListener('visibilitychange', onVisible);
      if (lock) lock.release().catch(() => {});
    },
  };
}
