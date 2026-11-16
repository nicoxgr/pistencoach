// Coach screen: tip of the day, slope mode with the cues of the next lesson,
// overall progress and the way to the placement.

import { tips } from '../../data/extras.js';
import { esc, icon, nextLesson, overall, pageHead } from './common.js';
import { reduced } from '../ui/motion.js';

const dayIndex = () => Math.floor(Date.now() / 86400000) % tips.length;

export function coachView() {
  const l = nextLesson();
  const o = overall();
  let tip = dayIndex();
  const share = (n) => (o.total ? (n / o.total) * 100 : 0);

  return {
    title: 'Coach',
    html: `
      ${pageHead({ title: 'Coach', lead: 'Dein Begleiter für den Skitag.' })}
      <section class="card tip">
        <h3 class="card-title">${icon('spark')}Tipp des Tages</h3>
        <p class="tip-text" data-tip>${esc(tips[tip])}</p>
        <button type="button" class="btn small ghost press" data-next-tip>${icon('refresh')}Noch ein Tipp</button>
      </section>
      <section class="card piste-mode piste-${l.level.piste}">
        <p class="eyebrow">Pistenmodus · ${l.id} ${esc(l.title)}</p>
        <ul class="cues stagger">${l.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        <p class="piste-hint">Im Pistenmodus siehst du einen Gedanken pro Bildschirm, mit großer Schrift und Tasten für Handschuhe.</p>
        <div class="row"><a class="btn warm press" href="#/piste/${l.id}">${icon('glove')}Pistenmodus starten</a><a class="btn on-dark press" href="#/lektion/${l.id}">Zur Lektion</a></div>
      </section>
      <section class="card">
        <h3 class="card-title">${icon('target')}Dein Stand</h3>
        <div class="tiles">
          <div class="tile good"><b data-count="${o.done}">0</b><span>Sicher</span></div>
          <div class="tile warn"><b data-count="${o.practicing}">0</b><span>Übe ich</span></div>
          <div class="tile"><b data-count="${o.open}">0</b><span>Offen</span></div>
        </div>
        <div class="stack" role="img" aria-label="${o.done} sicher, ${o.practicing} in Übung, ${o.open} offen">
          <span class="good" style="--to:${share(o.done) / 100}"></span><span class="warn" style="--to:${share(o.practicing) / 100}"></span>
        </div>
      </section>
      <a class="card nav-card press" href="#/verlauf">
        <span class="callout-ic">${icon('clock')}</span>
        <span class="callout-body"><b>Verlauf</b>Was du an welchem Tag geübt hast.</span>
        ${icon('chev', 'chev')}
      </a>
      <a class="card nav-card press" href="#/einstufung">
        <span class="callout-ic">${icon('sliders')}</span>
        <span class="callout-body"><b>Einstufung</b>Sag, was du schon fährst, und überspring den Rest.</span>
        ${icon('chev', 'chev')}
      </a>
    `,
    mount(root) {
      const el = root.querySelector('[data-tip]');
      root.querySelector('[data-next-tip]').onclick = () => {
        tip = (tip + 1) % tips.length;
        if (reduced()) {
          el.textContent = tips[tip];
          return;
        }
        el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 150, easing: 'ease-in' }).onfinish = () => {
          el.textContent = tips[tip];
          el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
        };
      };
    },
  };
}
