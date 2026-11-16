// Lesson 3.2: start a parallel turn by extending (unweighting) and edge change.

import { keys, win } from '../curves.js';

export default {
  id: 'schwungausloesung',
  views: ['front', 'top', 'side'],
  base: {
    turnTime: 2.6,
    amp: 95,
    len: 200,
    cross: 0.12,
    leanMax: 0.46,
    edgeShape: 0.55,
    slope: 14,
    piste: 'blue',
    trailSkid: 0.4,
    width: () => 20,
    flex: ({ v }) => keys(v, [[0, 0.45], [0.12, 0.05], [0.3, 0.3], [0.62, 0.62], [0.88, 0.8], [1, 0.45]]),
    outer: ({ v }) => keys(v, [[0, 0.68], [0.12, 0.5], [0.3, 0.74], [0.62, 0.85], [0.9, 0.78], [1, 0.68]]),
    torso: () => 0.55,
    skid: () => 0.14,
    pole: ({ v }) => win(v, 0.93, 0.1, 0.05),
    angulation: () => 0.38,
  },
  variants: [
    { id: 'right', label: '✓ Richtig', cfg: {} },
    {
      id: 'wrong',
      label: '✗ Typischer Fehler',
      note: '<b>Steif und mit dem Oberkörper gedreht.</b> Ohne Hochkommen bleiben die Ski auf der Kante und der Kurvenwechsel kommt spät. Der Oberkörper dreht mit, die Ski rutschen quer und du landest in Rücklage.',
      cfg: {
        flex: () => 0.35,
        outer: () => 0.55,
        torso: () => -0.12,
        skid: () => 0.36,
        pole: () => 0,
        fore: () => -0.8,
        edgeShape: 1.7,
        trailSkid: 0.95,
      },
    },
  ],
  steps: [
    { a: 0, b: 0.12, label: 'Stock setzen, aufrichten', text: 'Am Ende der Kurve tippst du den Talstock in den Schnee und richtest dich auf. Das nimmt Druck von den Ski.' },
    { a: 0.12, b: 0.3, label: 'Umkanten', text: 'Im kurzen Moment ohne Druck stellst du beide Ski gleichzeitig flach und kippst sie auf die neuen Kanten.' },
    { a: 0.3, b: 0.65, label: 'Steuern', text: 'Wieder tiefer gehen. Der Druck wandert auf den neuen Außenski, die Ski drehen in die Falllinie.' },
    { a: 0.65, b: 1, label: 'Ausfahren', text: 'Tief bleiben und die Kurve rund zu Ende fahren. Den nächsten Stockeinsatz bereitest du schon vor.' },
  ],
};
