// More: glossary, placement, appearance, backup, reset, about.

import { exportJson, importJson, reset, getTheme, setTheme } from '../store.js';
import { APP_VERSION } from '../version.js';
import { allLessons } from '../../data/lessons.js';
import { glossary } from '../../data/extras.js';
import { icon, pageHead } from './common.js';
import { setSeg } from '../ui/motion.js';

const THEMES = [
  ['auto', 'Automatisch'],
  ['light', 'Hell'],
  ['dark', 'Dunkel'],
];

export function applyTheme() {
  const t = getTheme();
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}

export function moreView() {
  const anims = allLessons.filter((l) => l.scene).length;
  return {
    title: 'Mehr',
    html: `
      ${pageHead({ title: 'Mehr', lead: 'Nachschlagen, einstellen, sichern.' })}
      <nav class="card nav-list">
        <a class="nav-row press" href="#/glossar"><span class="callout-ic">${icon('book')}</span><span class="callout-body"><b>Glossar</b>${glossary.length} Begriffe von Aufkanten bis Verwindung</span>${icon('chev', 'chev')}</a>
        <a class="nav-row press" href="#/einstufung"><span class="callout-ic">${icon('sliders')}</span><span class="callout-body"><b>Einstufung</b>Lernpfad an dein Können anpassen</span>${icon('chev', 'chev')}</a>
      </nav>
      <section class="card">
        <h3 class="card-title">Darstellung</h3>
        <div class="seg" role="radiogroup" aria-label="Darstellung" data-theme-seg>
          ${THEMES.map(([id, label]) => `<button type="button" role="radio" data-theme-id="${id}" aria-checked="false">${label}</button>`).join('')}
        </div>
      </section>
      <section class="card">
        <h3 class="card-title">Fortschritt sichern</h3>
        <p>Dein Fortschritt liegt nur auf diesem Gerät. Mit einer Sicherung nimmst du ihn auf ein anderes Gerät mit.</p>
        <div class="row">
          <button class="btn primary press" data-export>Sicherung erstellen</button>
          <label class="btn ghost press">Sicherung laden<input type="file" accept="application/json,.json" data-import hidden></label>
        </div>
        <p class="msg" data-msg hidden></p>
      </section>
      <section class="card">
        <h3 class="card-title">Zurücksetzen</h3>
        <p>Löscht alle Häkchen und Notizen.</p>
        <div class="row"><button class="btn danger press" data-reset>Fortschritt löschen</button></div>
      </section>
      <section class="card">
        <h3 class="card-title">Über die App</h3>
        <p>Pistencoach erklärt Skitechnik in der Reihenfolge, in der Skilehrer sie unterrichten: ${allLessons.length} Lektionen, ${anims} davon mit Animation. Die App ersetzt keinen Skikurs.</p>
        <p class="fineprint left">Version ${APP_VERSION}</p>
      </section>
    `,
    mount(root) {
      const msg = root.querySelector('[data-msg]');
      const say = (t) => {
        msg.textContent = t;
        msg.hidden = false;
      };

      const seg = root.querySelector('[data-theme-seg]');
      setSeg(seg, THEMES.findIndex(([id]) => id === getTheme()));
      seg.querySelectorAll('button').forEach((b, i) => {
        b.onclick = () => {
          setTheme(b.dataset.themeId);
          applyTheme();
          setSeg(seg, i);
        };
      });

      root.querySelector('[data-export]').onclick = async () => {
        const name = `pistencoach-${new Date().toISOString().slice(0, 10)}.json`;
        const file = new File([exportJson()], name, { type: 'application/json' });
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Pistencoach-Sicherung' });
            return;
          }
        } catch (e) {
          if (e.name === 'AbortError') return;
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      };
      root.querySelector('[data-import]').onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          importJson(await file.text());
          applyTheme();
          say('Sicherung geladen.');
        } catch {
          say('Die Datei ist keine gültige Pistencoach-Sicherung.');
        }
      };
      root.querySelector('[data-reset]').onclick = () => {
        if (confirm('Wirklich alle Häkchen und Notizen löschen?')) {
          reset();
          say('Fortschritt gelöscht.');
        }
      };
    },
  };
}
