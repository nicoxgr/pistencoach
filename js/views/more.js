// Settings: backup, restore, reset, about.

import { exportJson, importJson, reset } from '../store.js';
import { APP_VERSION } from '../version.js';

export function moreView() {
  return {
    title: 'Mehr',
    html: `
      <section class="card">
        <h3>Fortschritt sichern</h3>
        <p>Dein Fortschritt liegt nur auf diesem Gerät. Mit einer Sicherung kannst du ihn auf ein anderes Gerät mitnehmen.</p>
        <div class="row">
          <button class="btn primary" data-export>Sicherung erstellen</button>
          <label class="btn ghost">Sicherung laden<input type="file" accept="application/json,.json" data-import hidden></label>
        </div>
        <p class="msg" data-msg hidden></p>
      </section>
      <section class="card">
        <h3>Zurücksetzen</h3>
        <p>Löscht alle Häkchen und Notizen.</p>
        <button class="btn danger" data-reset>Fortschritt löschen</button>
      </section>
      <section class="card">
        <h3>Über die App</h3>
        <p>Pistencoach erklärt Skitechnik in der Reihenfolge, in der Skilehrer sie unterrichten. Sie ersetzt keinen Skikurs.</p>
        <p class="fineprint">Version ${APP_VERSION}</p>
      </section>
    `,
    mount(root) {
      const msg = root.querySelector('[data-msg]');
      const say = (t) => {
        msg.textContent = t;
        msg.hidden = false;
      };
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
