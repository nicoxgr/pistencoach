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
| `js/app.js` | Hash-Router, Topbar, Tabbar, Service-Worker-Updates |
| `js/store.js` | Fortschritt und Notizen in `localStorage` |
| `js/views/` | Bildschirme: Lernpfad, Stufe, Lektion, Coach, Probleme, Mehr |
| `js/anim/model.js` | Schwungmodell: Zeit → Zustand des Skifahrers (Spur, Kanten, Druck, Hoch-Tief, Stock) |
| `js/anim/topdown.js`, `front.js`, `side.js` | Ansichten von oben, von hinten und von der Seite |
| `js/anim/player.js` | Zeitleiste, Tempo, Ansichtswechsel, Richtig/Fehler, Schritte synchron |
| `js/anim/scenes/` | eine Datei pro Animation: Phasenkurven, Fehlervariante, Schritte |
| `data/lessons.js` | Stufen und Lektionen mit allen Texten |

## Neue Animation anlegen

1. Szene in `js/anim/scenes/<id>.js` anlegen. Bewegung über Phasenfunktionen (`splay`, `flex`, `outer`, `torso`, `skid`, `pole`, `fore`) mit `keys()` und `win()` aus `curves.js` beschreiben.
2. Szene in `js/anim/scenes/index.js` registrieren.
3. In `data/lessons.js` bei der Lektion `scene: '<id>'` setzen.
4. Datei in `ASSETS` in `sw.js` eintragen.

## Release

`CACHE` in `sw.js` und `APP_VERSION` in `js/version.js` gemeinsam hochzählen. Installierte Apps zeigen dann „Neue Version verfügbar“.

Lokal testen: `python3 -m http.server` im Projektordner, dann `http://localhost:8000`.

## Stand

- Phase 1 und 2 fertig: Gerüst, PWA, Animations-Engine, Lektionen 2.3 und 3.2 komplett
- Offen: Texte und Animationen der übrigen Lektionen, Einstufung, Tipp des Tages, Problemfinder, Glossar
