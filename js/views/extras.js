// Glossary and placement.

import { glossary } from '../../data/extras.js';
import { levels } from '../../data/lessons.js';
import { setStatus, setOnboardingDone, logPlacement } from '../store.js';
import { esc, icon, pageHead, pisteDot } from './common.js';
import { stagger, burst } from '../ui/motion.js';

const term = ([t, d]) => `<div class="term"><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`;

export function glossaryView() {
  return {
    title: 'Glossar',
    back: '#/mehr',
    html: `
      ${pageHead({ sub: true, title: 'Glossar', lead: 'Die Begriffe, die Skilehrer benutzen, kurz erklärt.' })}
      <label class="search">${icon('search')}<input type="search" placeholder="Begriff suchen" aria-label="Begriff suchen" data-q autocomplete="off"></label>
      <dl class="card terms stagger" data-terms>${glossary.map(term).join('')}</dl>
      <p class="fineprint" data-empty hidden>Kein Begriff gefunden.</p>
    `,
    mount(root) {
      const list = root.querySelector('[data-terms]');
      const empty = root.querySelector('[data-empty]');
      root.querySelector('[data-q]').oninput = (e) => {
        const q = e.target.value.trim().toLowerCase();
        const hits = glossary.filter(([t, d]) => !q || t.toLowerCase().includes(q) || d.toLowerCase().includes(q));
        list.innerHTML = hits.map(term).join('');
        list.hidden = !hits.length;
        empty.hidden = !!hits.length;
        stagger(list);
      };
    },
  };
}

const OPTIONS = [
  { upTo: 0, piste: 'green', title: 'Ich stehe zum ersten Mal auf Ski', text: 'Du startest ganz vorne bei der Grundstellung.' },
  { upTo: 1, piste: 'green', title: 'Ich fahre Pflugbögen und bremse sicher', text: 'Weiter geht es mit Kantengefühl und dem Grundschwung.' },
  { upTo: 2, piste: 'blue', title: 'Meine Kurven enden parallel', text: 'Als Nächstes lernst du, die Kurve ohne Pflug auszulösen.' },
  { upTo: 3, piste: 'blue', title: 'Ich fahre blaue Pisten parallel', text: 'Jetzt kommen rote Pisten: Oberkörper, Außenski, Driften.' },
  { upTo: 4, piste: 'red', title: 'Ich fahre rote Pisten kontrolliert', text: 'Du steigst beim Carving ein.' },
  { upTo: 5, piste: 'black', title: 'Ich carve sicher', text: 'Es bleiben Kurzschwung, Steilhang und Gelände.' },
];

export function placementView() {
  let pick = null;
  return {
    title: 'Einstufung',
    back: '#/',
    html: `
      ${pageHead({ sub: true, title: 'Was fährst du schon?', lead: 'Wähle, was am besten passt. Alles davor gilt als sicher. Du kannst jede Lektion später wieder ändern.' })}
      <div class="options stagger" role="radiogroup" aria-label="Können">
        ${OPTIONS.map(
          (o, i) => `
          <button type="button" class="option press" role="radio" aria-checked="false" data-opt="${i}">
            <span class="radio"></span>
            <span class="option-body"><b>${esc(o.title)}</b><span>${pisteDot(o.piste)}${esc(o.text)}</span></span>
          </button>`,
        ).join('')}
      </div>
      <button type="button" class="btn primary wide press" data-apply disabled>Übernehmen</button>
    `,
    mount(root) {
      const apply = root.querySelector('[data-apply]');
      root.querySelectorAll('[data-opt]').forEach((b) => {
        b.onclick = () => {
          pick = OPTIONS[Number(b.dataset.opt)];
          root.querySelectorAll('[data-opt]').forEach((x) => {
            x.classList.toggle('on', x === b);
            x.setAttribute('aria-checked', x === b);
          });
          apply.disabled = false;
        };
      });
      apply.onclick = () => {
        if (!pick) return;
        levels.filter((lv) => lv.id <= pick.upTo).forEach((lv) => lv.lessons.forEach((l) => setStatus(l.id, 'done', { log: false })));
        if (pick.upTo > 0) logPlacement(pick.upTo);
        setOnboardingDone();
        burst(apply);
        setTimeout(() => (location.hash = '#/'), 350);
      };
    },
  };
}
