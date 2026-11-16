// Lesson 2.3: start the turn in a snowplough, close to parallel after the fall line.

import { keys } from '../curves.js';

export default {
  id: 'grundschwung',
  views: ['top', 'front', 'side'],
  base: {
    turnTime: 3.4,
    amp: 105,
    len: 190,
    cross: 0.12,
    leanMax: 0.3,
    slope: 12,
    piste: 'blue',
    trailSkid: 0.75,
    width: () => 20,
    splay: ({ v }) => keys(v, [[0, 0], [0.13, 0.3], [0.5, 0.3], [0.76, 0], [1, 0]]),
    flex: ({ v }) => keys(v, [[0, 0.35], [0.14, 0.25], [0.5, 0.45], [0.8, 0.55], [1, 0.35]]),
    outer: ({ v }) => keys(v, [[0, 0.6], [0.14, 0.55], [0.4, 0.68], [0.65, 0.8], [1, 0.6]]),
    torso: () => 0.45,
    skid: () => 0.24,
  },
  variants: [
    { id: 'right', label: '✓ Richtig', cfg: {} },
    {
      id: 'wrong',
      label: '✗ Typischer Fehler',
      note: '<b>Die Ski bleiben im Pflug.</b> Der Druck ist auf beide Ski gleich verteilt und du sitzt hinten. Der Innenski bleibt auf der Kante und lässt sich nicht beidrehen.',
      cfg: {
        splay: () => 0.3,
        outer: () => 0.5,
        fore: () => -0.7,
        torso: () => 0.05,
        flex: () => 0.5,
        trailSkid: 0.9,
      },
    },
  ],
  steps: [
    { a: 0, b: 0.14, label: 'Pflug öffnen', text: 'Aus der Schrägfahrt drückst du beide Skienden auseinander. Die Spitzen bleiben nah beieinander.' },
    { a: 0.14, b: 0.5, label: 'In die Falllinie drehen', text: 'Im Pflug drehst du talwärts. Mehr Druck auf den Ski, der in der Kurve außen liegt.' },
    { a: 0.5, b: 0.78, label: 'Innenski beiziehen', text: 'Nach der Falllinie hat der Innenski kaum noch Druck. Du stellst ihn flach und drehst ihn parallel zum Außenski.' },
    { a: 0.78, b: 1, label: 'Parallel ausfahren', text: 'Parallel durch die Schrägfahrt. Dein Blick geht schon zur nächsten Kurve.' },
  ],
};
