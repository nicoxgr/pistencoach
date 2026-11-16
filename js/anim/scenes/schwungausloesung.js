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
    outer: ({ v }) => keys(v, [[0, 0.68], [0.12, 0.5], [0.3, 0.72], [0.62, 0.8], [0.9, 0.76], [1, 0.68]]),
    torso: () => 0.55,
    skid: () => 0.14,
    pole: ({ v }) => win(v, 0.93, 0.1, 0.05),
    angulation: () => 0.38,
  },
  variants: [
    { id: 'right', label: 'Richtig', cfg: {} },
    {
      id: 'wrong',
      label: 'Steif und gedreht',
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
    {
      // Only the outside ski holds an edge. The inside ski is unweighted or
      // lifted, lies flat, lags behind the turn and smears its track.
      id: 'inner',
      label: 'Innenski flach',
      note: '<b>Innenski nur entlastet, nicht gekantet.</b> Nur der Außenski steht auf der Kante. Der Innenski liegt flach, trägt kaum Gewicht und läuft der Kurve hinterher. Du musst ihn ständig bewusst parallel halten. Wird es steiler, reicht die Konzentration nicht mehr und der Pflug kommt zurück.<br><span class="lbl good">Besser</span>Beide Knie kippen zur selben Seite. Der Innenski geht auf seine Kleinzehenkante und trägt 20 bis 30 % des Gewichts. Das Gefühl kennst du vom Bergski in der Schrägfahrt.',
      cfg: {
        innerEdge: () => 0.06,
        innerYaw: ({ v }) => 0.13 + 0.05 * Math.sin(v * Math.PI * 8),
        innerLift: ({ v }) => keys(v, [[0, 0], [0.3, 0.3], [0.55, 1], [0.8, 0.5], [1, 0]]),
        innerSmear: 0.9,
        outer: ({ v }) => keys(v, [[0, 0.8], [0.12, 0.6], [0.3, 0.9], [0.62, 0.96], [0.9, 0.9], [1, 0.8]]),
        width: () => 25,
        angulation: () => 0.2,
        skid: () => 0.2,
      },
    },
  ],
  steps: [
    { a: 0, b: 0.12, label: 'Stock setzen, aufrichten', text: 'Am Ende der Kurve tippst du den Talstock in den Schnee und richtest dich auf. Das nimmt Druck von den Ski.' },
    { a: 0.12, b: 0.3, label: 'Umkanten', text: 'Im kurzen Moment ohne Druck stellst du beide Ski gleichzeitig flach und kippst sie auf die neuen Kanten. Auch der Innenski kantet mit, auf seiner Kleinzehenkante.' },
    { a: 0.3, b: 0.65, label: 'Steuern', text: 'Wieder tiefer gehen. Der Druck wandert auf den neuen Außenski, der Innenski trägt 20 bis 30 % mit. Beide Ski zeigen eine blaue Kantenlinie.' },
    { a: 0.65, b: 1, label: 'Ausfahren', text: 'Tief bleiben und die Kurve rund zu Ende fahren. Den nächsten Stockeinsatz bereitest du schon vor.' },
  ],
};
