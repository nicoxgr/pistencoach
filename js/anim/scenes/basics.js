// Level 1: stance and gliding, snowplough braking, snowplough turns.

import { keys } from '../curves.js';

const right = { id: 'right', label: 'Richtig', cfg: {} };
const wrong = (note, cfg) => ({ id: 'wrong', label: 'Typischer Fehler', note, cfg });

// Straight run: no lateral swing, no lean.
const straight = { amp: 0, leanMax: 0, skid: () => 0, torso: () => 0, outer: () => 0.5 };

export const gleiten = {
  id: 'gleiten',
  views: ['side', 'front'],
  base: {
    ...straight,
    turnTime: 3,
    len: 190,
    slope: 7,
    piste: 'green',
    trailSkid: 0.05,
    width: () => 22,
    flex: ({ v }) => keys(v, [[0, 0.32], [0.5, 0.55], [1, 0.32]]),
  },
  variants: [
    right,
    wrong('<b>Rücklage mit steifen Beinen.</b> Der Schwerpunkt liegt hinter dem Fuß. Die Skispitzen werden leicht und du kannst nicht mehr lenken.', {
      flex: () => 0.12,
      fore: () => -0.9,
    }),
  ],
  steps: [
    { a: 0, b: 0.34, label: 'Über der Fußmitte stehen', text: 'Das Gewicht liegt auf dem ganzen Fuß. Die grüne Linie zeigt: Der Schwerpunkt steht über dem Schuh.' },
    { a: 0.34, b: 0.67, label: 'Gelenke beugen', text: 'Sprunggelenk, Knie und Hüfte geben nach. So federst du Wellen ab.' },
    { a: 0.67, b: 1, label: 'Wieder strecken', text: 'Locker hochkommen, nie ganz durchstrecken. Die Hände bleiben vorne.' },
  ],
};

export const pflugbremse = {
  id: 'pflugbremse',
  views: ['top', 'front'],
  base: {
    ...straight,
    turnTime: 3.8,
    len: 170,
    slope: 9,
    piste: 'green',
    trailSkid: 0.95,
    width: () => 22,
    splay: ({ v }) => keys(v, [[0, 0.1], [0.2, 0.12], [0.5, 0.44], [0.72, 0.44], [1, 0.1]]),
    flex: ({ v }) => keys(v, [[0, 0.3], [0.5, 0.6], [0.72, 0.6], [1, 0.3]]),
    // Slow down while the plough is wide, speed up again when it narrows.
    warp: (v) => v + (0.62 * Math.sin(2 * Math.PI * (v + 0.1))) / (2 * Math.PI) - (0.62 * Math.sin(2 * Math.PI * 0.1)) / (2 * Math.PI),
  },
  variants: [
    right,
    wrong('<b>Der Pflug bleibt schmal und du sitzt hinten.</b> Die Ski liegen flach, die Kanten greifen nicht. Du wirst nicht langsamer.', {
      splay: () => 0.16,
      flex: () => 0.2,
      fore: () => -0.8,
      warp: (v) => v,
      trailSkid: 0.35,
    }),
  ],
  steps: [
    { a: 0, b: 0.22, label: 'Schmal gleiten', text: 'Ein schmaler Pflug bremst kaum. Du nimmst Fahrt auf.' },
    { a: 0.22, b: 0.5, label: 'Fersen nach außen', text: 'Du schiebst beide Skienden auseinander. Die Spitzen bleiben eine Handbreit getrennt.' },
    { a: 0.5, b: 0.74, label: 'Breiter Pflug bremst', text: 'Knie nach vorne innen: Beide Innenkanten greifen und schieben Schnee. Du wirst deutlich langsamer.' },
    { a: 0.74, b: 1, label: 'Wieder lösen', text: 'Pflug schmaler machen und weitergleiten. Zum Anhalten bleibst du einfach breit.' },
  ],
};

export const pflugbogen = {
  id: 'pflugbogen',
  views: ['top', 'front'],
  base: {
    turnTime: 3.6,
    amp: 82,
    len: 180,
    cross: 0.12,
    leanMax: 0.1,
    slope: 9,
    piste: 'green',
    trailSkid: 0.85,
    width: () => 22,
    splay: () => 0.3,
    flex: ({ v }) => keys(v, [[0, 0.4], [0.5, 0.5], [1, 0.4]]),
    outer: ({ v }) => keys(v, [[0, 0.56], [0.12, 0.5], [0.4, 0.74], [0.75, 0.8], [1, 0.56]]),
    torso: () => 0.35,
    skid: () => 0.2,
    angulation: () => 1.6,
  },
  variants: [
    right,
    wrong('<b>In die Kurve gelehnt.</b> Der Oberkörper kippt nach innen, das Gewicht landet auf dem Innenski. Der Außenski kann nicht mehr lenken.', {
      outer: () => 0.32,
      lean: () => 3.2,
      angulation: () => -0.2,
      torso: () => -0.1,
    }),
  ],
  steps: [
    { a: 0, b: 0.14, label: 'Pflug halten', text: 'Zwischen zwei Bögen stehst du gleichmäßig auf beiden Ski.' },
    { a: 0.14, b: 0.45, label: 'Außenski belasten', text: 'Du verlagerst das Gewicht auf den Ski, der außen liegen wird. Er färbt sich orange.' },
    { a: 0.45, b: 0.82, label: 'Durch die Falllinie', text: 'Der belastete Ski zieht dich herum. Den Pflug hältst du gleich breit.' },
    { a: 0.82, b: 1, label: 'Druck lösen', text: 'Kurz vor quer zum Hang wieder mittig stehen. Dann kommt die andere Seite.' },
  ],
};
