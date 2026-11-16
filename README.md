# Pistencoach

Web-App (PWA) zum Skifahren-Lernen: Techniken in der Reihenfolge, in der Skilehrer sie unterrichten, mit Animationen, kurzen Erklärungen, Übungen für die Piste und abhakbarem Fortschritt.

**Live:** https://nicoxgr.github.io/pistencoach/

## Auf dem iPhone installieren

1. Link in Safari öffnen.
2. Teilen-Symbol > „Zum Home-Bildschirm“.
3. Die App startet dann im Vollbild und läuft auch offline.

Der Fortschritt liegt nur auf dem Gerät (`localStorage`). Unter „Mehr“ lässt er sich als JSON sichern und wieder laden.

## Technik

- HTML, CSS und JavaScript als ES-Module, kein Build-Schritt, keine Abhängigkeiten
- GitHub Pages aus `main`, Root
- Service Worker (`sw.js`) cacht alle Dateien für den Offline-Betrieb

| Pfad | Inhalt |
|---|---|
| `js/app.js` | Hash-Router mit Übergängen je Richtung, Topbar, Tabbar, Service-Worker-Updates |
| `js/ui/motion.js` | Bewegung in der Oberfläche: gestaffeltes Einblenden, Zähler, Akkordeons, Segment-Schalter, Schnee-Burst |
| `js/store.js` | Fortschritt, Häkchen, Notizen und Darstellung in `localStorage` |
| `js/views/` | Bildschirme: Lernpfad, Stufe, Lektion, Coach, Probleme, Mehr, Glossar, Einstufung, Verlauf, Pistenmodus |
| `js/anim/model.js` | Schwungmodell: Zeit → Zustand des Skifahrers (Spur, Kanten, Druck, Hoch-Tief, Stock) |
| `js/anim/topdown.js`, `front.js`, `side.js` | Ansichten von oben, von hinten und von der Seite |
| `js/anim/player.js` | Zeitleiste, Tempo, Ansichtswechsel, Richtig/Fehler, Legende, Schritte synchron |
| `js/anim/scenes/` | Animationen: Phasenkurven, Fehlervariante, Schritte. `basics.js` (Stufe 1), `parallel.js` (Stufe 3) und `advanced.js` (Stufen 4 bis 7) und `extra.js` (Schrägfahrt, Seitrutschen, Bogen zum Hang, Linienwahl, Buckel, Eis) bündeln mehrere Szenen |
| `data/lessons.js` | Stufen und Lektionen mit allen Texten |
| `data/extras.js` | Problemfinder, Glossar, Tipps |

## Neue Animation anlegen

1. Szene in `js/anim/scenes/` anlegen, als eigene Datei oder als weiteren Export in einer der Sammeldateien. Bewegung über Phasenfunktionen (`splay`, `flex`, `outer`, `torso`, `skid`, `pole`, `fore`) mit `keys()` und `win()` aus `curves.js` beschreiben. `warp` verändert das Tempo entlang der Spur, `amp: 0` ergibt eine Geradeausfahrt.
2. Eigene Dateien in `js/anim/scenes/index.js` registrieren. Exporte der Sammeldateien sind automatisch dabei.
3. In `data/lessons.js` bei der Lektion `scene: '<id>'` setzen.
4. Neue Dateien in `ASSETS` in `sw.js` eintragen.

## Tests

Die App selbst hat keinen Build-Schritt und keine Abhängigkeiten. Nur die Tests brauchen Node und Playwright:

```bash
npm install
npx playwright install webkit
npm test
```

| Skript | Prüft |
|---|---|
| `tools/check.mjs` (`npm run check`) | lädt alle Module, rechnet jede Szene durch, prüft Lektionsdaten, Cache-Liste in `sw.js`, Versionsgleichheit und Farbkontraste. Läuft ohne Browser |
| `tools/e2e.mjs` | bedient die App in WebKit und Chrome: alle Bildschirme und Lektionen, Player samt Vollbild, Selbsttest, Notizen, Einstufung, Verlauf, Pistenmodus, Sicherung, Darstellung, kleine und große Bildschirme, Querformat, größere Schrift, dunkles Design, reduzierte Bewegung, gesperrter oder defekter Speicher, Offline-Betrieb und Update |

`node tools/e2e.mjs --only=webkit --shots=<Ordner>` beschränkt den Lauf und legt Screenshots ab. WebKit ist die Engine von Safari, ersetzt aber kein echtes iPhone: Home-Bildschirm, Statusleiste, Wake Lock und die Schriftgröße aus den iOS-Einstellungen lassen sich so nicht prüfen.

## Release

Vorher `npm test` ausführen. `CACHE` in `sw.js` und `APP_VERSION` in `js/version.js` gemeinsam hochzählen. Installierte Apps zeigen dann „Neue Version verfügbar“. Die App sucht beim Start und bei jeder Rückkehr in den Vordergrund nach Updates. Direkt nach dem Start übernimmt sie die neue Version von selbst, später fragt sie per Hinweis.

Lokal testen: `python3 -m http.server` im Projektordner, dann `http://localhost:8000`. Auf `localhost` registriert die App keinen Service Worker, Änderungen sind also sofort sichtbar.

Icons: `icons/icon.svg` ist die Quelle. PNGs neu erzeugen mit `qlmanage -t -s 1024 -o /tmp icons/icon.svg` und `sips -z <Größe> <Größe>`.

## Stand

- Version 0.5.1: alle 23 Lektionen mit Inhalt und Animation, dazu Problemfinder, Glossar, Tipp des Tages, Einstufung, Verlauf und Pistenmodus
- Pistenmodus (`#/piste/<id>`): ein Gedanke pro Bildschirm, große Schrift, große Tasten, am Ende die Statusabfrage. Hält den Bildschirm wach, wo der Browser es erlaubt
- Player mit Vollbild als Überlagerung, im Querformat liegen Bild und Bedienung nebeneinander
- Verlauf: jede Statusänderung wird mit Datum gespeichert (`log` im Fortschritt, höchstens 500 Einträge)
- Bedienhilfen: Schriftgrößen in `rem`, unter iOS folgt die App der Textgröße aus den Einstellungen (bis 22 px Grundgröße), Kontraste nach WCAG AA, Fokus springt beim Seitenwechsel auf den Inhalt, Statuswahl per Pfeiltasten
- Das Schwungmodell kennt Kurvenfolgen, Geradeausfahrt, Querfahrt (`traverse`), seitliches Rutschen (`slip`) und Buckel (`bumps`). Die Ansicht von hinten neigt die Schneefläche je nach Fahrtrichtung, alle Ansichten folgen dem Tempo (`warp`)
- Glossarbegriffe in den Lektionstexten sind antippbar und öffnen die Erklärung (`linkTerms` in `js/views/common.js`, `js/ui/sheet.js`)
- Eine Szene kann mehrere Fehlerbilder haben (jede Variante außer `right` gilt als Fehler). Lektion 3.2 zeigt neben „steif und gedreht“ den flach liegenden Innenski: `innerEdge`, `innerYaw`, `innerLift` und `innerSmear` steuern den Innenski getrennt vom Außenski
- Beim Fehlerbild blendet der Player die Schritte aus, weil sie die richtige Ausführung beschreiben. Eine Variante kann eigene `steps` mitbringen
- Offen: Die Fachtexte sind nur stichprobenhaft gegen Quellen geprüft. Ein Test auf einem echten iPhone steht aus
