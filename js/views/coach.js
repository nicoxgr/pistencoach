// Coach screen. Phase 2 has the slope mode; placement test and tip of the day follow.

import { esc, nextLesson } from './common.js';

export function coachView() {
  const l = nextLesson();
  const cues = l.cues || [l.short];
  return {
    title: 'Coach',
    html: `
      <section class="card piste-mode piste-${l.level.piste}">
        <p class="eyebrow">Pistenmodus · ${esc(l.title)}</p>
        <ul class="cues">${cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        <a class="btn ghost" href="#/lektion/${l.id}">Zur Lektion</a>
      </section>
      <div class="card soon">
        <b>Kommt bald</b>
        <p>Einstufung beim ersten Start, Tipp des Tages und persönliche Empfehlungen.</p>
      </div>
    `,
  };
}
