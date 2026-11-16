// Problem finder: pick what goes wrong, get cause, quick fix, drill and the
// matching lessons.

import { problems, problemCats } from '../../data/extras.js';
import { findLesson } from '../../data/lessons.js';
import { esc, icon, pageHead } from './common.js';
import { accordions, stagger } from '../ui/motion.js';

const item = (p) => `
  <details class="card acc problem" data-acc="${p.id}">
    <summary>
      <span class="acc-title">${esc(p.title)}<small>${p.cat}</small></span>
      ${icon('down', 'acc-chev')}
    </summary>
    <div class="acc-body"><div class="acc-pad">
      <p><span class="lbl">Ursache</span>${esc(p.cause)}</p>
      <p><span class="lbl good">Sofort-Tipp</span>${esc(p.tip)}</p>
      ${p.drills ? `<p><span class="lbl neutral">Übungen</span></p><ol class="drills">${p.drills.map((d) => `<li>${esc(d)}</li>`).join('')}</ol>` : `<p><span class="lbl neutral">Übung</span>${esc(p.drill)}</p>`}
      <div class="link-list">
        ${p.lessons
          .map((id) => findLesson(id))
          .filter(Boolean)
          .map((l) => `<a class="link-row" href="#/lektion/${l.id}"><span><small>Lektion ${l.id}</small>${esc(l.title)}</span>${icon('chev')}</a>`)
          .join('')}
      </div>
    </div></div>
  </details>`;

export function problemsView() {
  return {
    title: 'Problemfinder',
    html: `
      ${pageHead({ title: 'Was passiert dir?', lead: 'Wähle ein Problem und du bekommst Ursache, Sofort-Tipp und die passende Übung.' })}
      <div class="chips" role="group" aria-label="Kategorie">
        ${problemCats.map((c, i) => `<button type="button" class="chip${i === 0 ? ' on' : ''}" data-cat="${c}" aria-pressed="${i === 0}">${c}</button>`).join('')}
      </div>
      <div class="problem-list stagger" data-list>${problems.map(item).join('')}</div>
    `,
    mount(root) {
      const list = root.querySelector('[data-list]');
      accordions(list);
      root.querySelectorAll('[data-cat]').forEach((b) => {
        b.onclick = () => {
          root.querySelectorAll('[data-cat]').forEach((x) => {
            x.classList.toggle('on', x === b);
            x.setAttribute('aria-pressed', x === b);
          });
          const cat = b.dataset.cat;
          list.innerHTML = problems
            .filter((p) => cat === 'Alle' || p.cat === cat)
            .map(item)
            .join('');
          stagger(list);
          accordions(list);
        };
      });
    },
    ownAccordions: true,
  };
}
