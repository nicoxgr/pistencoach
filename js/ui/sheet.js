// Bottom sheet for a glossary term, opened from a linked word in a lesson.

import { glossary } from '../../data/extras.js';
import { reduced } from './motion.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

let open = null;

export function closeSheet() {
  if (!open) return;
  const { backdrop, opener, onKey } = open;
  open = null;
  document.removeEventListener('keydown', onKey);
  window.removeEventListener('hashchange', closeSheet);
  const done = () => backdrop.remove();
  if (reduced()) done();
  else {
    backdrop.classList.add('closing');
    setTimeout(done, 220);
  }
  if (opener && opener.isConnected) opener.focus({ preventScroll: true });
}

export function openTerm(name, opener) {
  const entry = glossary.find(([t]) => t === name);
  if (!entry) return;
  closeSheet();
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <span class="sheet-grip" aria-hidden="true"></span>
      <p class="eyebrow">Glossar</p>
      <h3 id="sheet-title">${esc(entry[0])}</h3>
      <p>${esc(entry[1])}</p>
      <div class="row">
        <button type="button" class="btn primary press" data-close>Verstanden</button>
        <a class="btn ghost press" href="#/glossar">Alle Begriffe</a>
      </div>
    </div>`;
  const onKey = (e) => e.key === 'Escape' && closeSheet();
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target.closest('[data-close]')) closeSheet();
  });
  document.addEventListener('keydown', onKey);
  window.addEventListener('hashchange', closeSheet);
  document.body.append(backdrop);
  open = { backdrop, opener, onKey };
  backdrop.querySelector('[data-close]').focus({ preventScroll: true });
}
