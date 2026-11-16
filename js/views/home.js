// Start screen: next step in the hero and the learning path as a trail.

import { levels } from '../../data/lessons.js';
import { esc, icon, ring, nextLesson, levelProgress, overall, pisteDot, pageHead, STATUS_LABEL } from './common.js';
import { getStatus, hasProgress, onboardingDone, setOnboardingDone } from '../store.js';
import { reduced } from '../ui/motion.js';

const TRACK = 'M150 -12 C 56 30, 56 76, 118 106 S 196 176, 92 256';

const heroArt = `
  <div class="hero-art" aria-hidden="true">
    <svg class="hero-track" viewBox="0 0 200 244" fill="none">
      <path class="trk" pathLength="100" d="${TRACK}" transform="translate(-7 0)"/>
      <path class="trk" pathLength="100" d="${TRACK}" transform="translate(7 0)"/>
      <circle class="skier" r="5"><animateMotion dur="7s" repeatCount="indefinite" path="${TRACK}"/></circle>
    </svg>
    <div class="snow">${'<i></i>'.repeat(14)}</div>
  </div>`;

const logo = `<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#fff" fill-opacity=".14"/><path d="M4 24 L13 9 L17.5 16 L21 11.5 L28 24 Z" fill="#fff"/><path d="M15 15.5 C 20 18, 20 20, 15.5 22 S 11 26, 16 29" fill="none" stroke="#ff7a1a" stroke-width="2.4" stroke-linecap="round"/></svg>`;

export function homeView() {
  const next = nextLesson();
  const st = getStatus(next.id);
  const all = overall();
  const curIndex = levels.findIndex((lv) => lv.id === next.level.id);
  const allDone = all.done === all.total;

  const path = levels
    .map((lv) => {
      const p = levelProgress(lv);
      const complete = p.done === p.total;
      const current = lv.id === next.level.id && !allDone;
      return `
      <li class="trail-item piste-${lv.piste}${complete ? ' complete' : ''}${current ? ' current' : ''}">
        <span class="node">${complete ? icon('check') : lv.id}</span>
        <a class="trail-card press" href="#/stufe/${lv.id}">
          <span class="trail-body">
            <span class="trail-title">${esc(lv.title)}</span>
            <span class="trail-meta">${pisteDot(lv.piste)}${esc(lv.pisteLabel)}</span>
            <span class="bar" style="--to:${p.pct / 100}"><span></span></span>
          </span>
          <span class="trail-count"><b>${p.done}</b>/${p.total}</span>
          ${icon('chev', 'chev')}
        </a>
      </li>`;
    })
    .join('');

  const showOnboarding = !onboardingDone() && !hasProgress();

  return {
    title: 'Pistencoach',
    html: `
      ${pageHead({
        cls: `hero piste-${next.level.piste}`,
        before: `${heroArt}<div class="brand-row"><h1 class="brand">${logo}Pistencoach</h1>${ring(all.pct, 'on-dark')}</div>`,
        eyebrow: allDone ? 'Alles geschafft' : `Dein nächster Schritt · Lektion ${next.id}`,
        title: next.title,
        lead: next.short,
        extra: `
          <div class="hero-foot">
            <a class="btn warm press" href="#/lektion/${next.id}">${st === 'open' ? 'Los geht’s' : 'Weiter üben'}${icon('chev')}</a>
            <span class="hero-meta">${next.time ? `${icon('clock')}${next.time} min` : ''}${st !== 'open' ? ` · ${STATUS_LABEL[st]}` : ''}</span>
          </div>`,
      })}
      ${
        showOnboarding
          ? `<div class="card callout" data-onb>
              <span class="callout-ic">${icon('sliders')}</span>
              <span class="callout-body"><b>Schon Erfahrung auf Ski?</b>Mit der Einstufung überspringst du, was du schon kannst.
                <a class="btn small primary press" href="#/einstufung">Zur Einstufung</a></span>
              <button type="button" class="icon-btn" data-onb-x aria-label="Hinweis schließen">${icon('x')}</button>
            </div>`
          : ''
      }
      <h3 class="section-title">Lernpfad<span>${all.done} von ${all.total} Lektionen sicher</span></h3>
      <ol class="trail stagger" style="--to:${curIndex / (levels.length - 1)}">${path}</ol>
      <p class="fineprint">Die App ersetzt keinen Skilehrer. Fahr nur, was du sicher kontrollieren kannst.</p>
    `,
    mount(root) {
      if (reduced()) root.querySelectorAll('animateMotion').forEach((a) => a.remove());
      const x = root.querySelector('[data-onb-x]');
      if (x)
        x.onclick = () => {
          setOnboardingDone();
          const card = root.querySelector('[data-onb]');
          if (reduced()) return card.remove();
          card.animate([{ opacity: 1, height: `${card.offsetHeight}px` }, { opacity: 0, height: '0px', marginTop: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px' }], { duration: 260, easing: 'ease-in' }).onfinish = () => card.remove();
        };
    },
  };
}
