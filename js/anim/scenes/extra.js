// Remaining lessons: traverse, side slipping, turn to the hill, line choice,
// moguls and ice. Traverse and side slipping use `side` to keep the edges on
// one side and are shown from behind only.

import { keys, win } from '../curves.js';

const right = { id: 'right', label: 'Richtig', cfg: {} };
const wrong = (note, cfg) => ({ id: 'wrong', label: 'Typischer Fehler', note, cfg });

const upDown = ({ v }) => keys(v, [[0, 0.45], [0.12, 0.15], [0.3, 0.32], [0.62, 0.6], [0.88, 0.72], [1, 0.45]]);
const pressure = ({ v }) => keys(v, [[0, 0.66], [0.12, 0.5], [0.3, 0.72], [0.62, 0.84], [0.9, 0.76], [1, 0.66]]);
const slowAcross = (a) => (v) => v - (a * Math.sin(2 * Math.PI * v)) / (2 * Math.PI);

// Across the hill: the hill is on the right, the left ski is the downhill ski.
const across = { amp: 0, side: 1, traverse: 1.3, edgeShape: 0, skid: () => 0, torso: () => 0, piste: 'green', slope: 16, trailSkid: 0.1, width: () => 22 };

export const schraegfahrt = {
  id: 'schraegfahrt',
  views: ['front'],
  base: {
    ...across,
    turnTime: 3.6,
    len: 150,
    leanMax: 0.24,
    flex: ({ v }) => keys(v, [[0, 0.35], [0.5, 0.5], [1, 0.35]]),
    outer: ({ v }) => keys(v, [[0, 0.68], [0.5, 0.75], [1, 0.68]]),
    angulation: () => 0.95,
  },
  variants: [
    right,
    wrong('<b>Zum Hang gelehnt.</b> Der Oberkörper sucht den Berg. Das Gewicht landet auf dem Bergski, der Talski wird leicht und rutscht weg.', {
      outer: () => 0.28,
      angulation: () => -0.5,
      lean: () => 1.2,
    }),
  ],
  steps: [
    { a: 0, b: 0.34, label: 'Knie zum Hang', text: 'Der Hang liegt rechts. Beide Knie kippen dorthin, beide Ski stehen auf der Bergkante. Die blauen Linien zeigen die greifenden Kanten.' },
    { a: 0.34, b: 0.67, label: 'Talski trägt', text: 'Der untere Ski trägt deutlich mehr. Er ist orange, sein Druckpfeil ist länger.' },
    { a: 0.67, b: 1, label: 'Schulter ins Tal', text: 'Die Beine neigen sich zum Hang, der Oberkörper bleibt aufrecht über dem Talski.' },
  ],
};

export const seitrutschen = {
  id: 'seitrutschen',
  views: ['front'],
  base: {
    ...across,
    turnTime: 4.2,
    len: 110,
    leanMax: 0.32,
    lean: ({ v }) => keys(v, [[0, 1], [0.12, 1], [0.34, 0.1], [0.62, 0.1], [0.84, 1], [1, 1]]),
    flex: () => 0.42,
    outer: () => 0.64,
    angulation: () => 0.9,
  },
  variants: [
    right,
    wrong('<b>Ganz auf oder ganz ab.</b> Die Kanten lösen und greifen ruckartig. Du rutschst in Sprüngen und der Oberkörper kippt zum Hang.', {
      lean: ({ v }) => keys(v, [[0, 1], [0.3, 1], [0.34, 0], [0.6, 0], [0.64, 1.2], [1, 1]]),
      angulation: () => -0.3,
      outer: () => 0.4,
      flex: () => 0.2,
    }),
  ],
  steps: [
    { a: 0.84, b: 0.14, label: 'Kanten halten', text: 'Knie zum Hang: Beide Kanten greifen und du stehst sicher quer zum Hang.' },
    { a: 0.14, b: 0.36, label: 'Knie talwärts', text: 'Du kippst die Knie langsam talwärts. Die Ski werden flacher, die Kantenlinien verblassen.' },
    { a: 0.36, b: 0.62, label: 'Rutschen', text: 'Die fast flachen Ski schaben seitlich den Hang hinunter. Das Gewicht bleibt über der Fußmitte.' },
    { a: 0.62, b: 0.84, label: 'Wieder aufkanten', text: 'Knie zurück zum Hang. Die Kanten greifen weich und du kommst zum Stehen.' },
  ],
};

export const bogenzumhang = {
  id: 'bogenzumhang',
  views: ['top', 'front'],
  base: {
    turnTime: 4.2,
    amp: 104,
    len: 150,
    leanMax: 0.34,
    slope: 10,
    piste: 'green',
    trailSkid: 0.45,
    width: () => 22,
    splay: ({ v }) => keys(v, [[0, 0], [0.1, 0.26], [0.4, 0.26], [0.6, 0], [1, 0]]),
    flex: upDown,
    outer: pressure,
    torso: () => 0.5,
    skid: () => 0.18,
    warp: slowAcross(0.82),
  },
  variants: [
    right,
    wrong('<b>Der Pflug schleicht sich ein.</b> Der Bergski dreht nicht mit und bleibt auf der Innenkante. Der Oberkörper dreht zum Hang, die Skienden rutschen.', {
      splay: () => 0.26,
      torso: () => -0.18,
      outer: () => 0.52,
      skid: () => 0.34,
      trailSkid: 0.9,
    }),
  ],
  steps: [
    { a: 0, b: 0.4, label: 'Anfahren', text: 'Du fährst an und drehst in die Falllinie. Hier wirst du schneller.' },
    { a: 0.4, b: 0.62, label: 'Parallel stellen', text: 'In der Falllinie stehen die Ski parallel. Ab hier beginnt der Bogen zum Hang.' },
    { a: 0.62, b: 0.88, label: 'Knie zum Hang', text: 'Beide Knie drücken nach vorne und zum Hang. Die Ski ziehen parallel bergwärts, der Talski trägt.' },
    { a: 0.88, b: 1, label: 'Ausdrehen bis zum Stand', text: 'Je weiter du bergwärts drehst, desto langsamer wirst du. So hältst du ohne Pflug an.' },
  ],
};

export const linienwahl = {
  id: 'linienwahl',
  views: ['top'],
  base: {
    turnTime: 3.3,
    amp: 120,
    len: 175,
    leanMax: 0.4,
    slope: 22,
    piste: 'red',
    trailSkid: 0.6,
    width: () => 22,
    flex: upDown,
    outer: pressure,
    torso: () => 0.7,
    skid: () => 0.26,
    pole: ({ v }) => win(v, 0.9, 0.1, 0.05),
    warp: slowAcross(0.4),
  },
  variants: [
    right,
    wrong('<b>Ohne Plan in der Falllinie.</b> Schmale Kurven in der abgefahrenen Pistenmitte bauen kein Tempo ab. Du wirst schneller und reagierst nur noch.', {
      turnTime: 1.8,
      amp: 26,
      len: 280,
      skid: () => 0.2,
      fore: () => -0.7,
      flex: () => 0.3,
      pole: () => 0,
      torso: () => 0.2,
      warp: (v) => v,
    }),
  ],
  steps: [
    { a: 0, b: 0.14, label: 'Vorausschauen', text: 'Im Kurvenwechsel geht der Blick zwei Kurven voraus: Wo ist es griffig, wo frei?' },
    { a: 0.14, b: 0.62, label: 'Pistenbreite nutzen', text: 'Du nutzt die ganze Breite. Am Rand liegt oft der griffigere Schnee.' },
    { a: 0.62, b: 0.9, label: 'Quer Tempo abbauen', text: 'Am Pistenrand fährst du die Kurve aus, bis das Tempo wieder passt.' },
    { a: 0.9, b: 1, label: 'Nächsten Abschnitt planen', text: 'Erst wenn du die nächste Kurve gesehen hast, kantest du um.' },
  ],
};

export const buckel = {
  id: 'buckel',
  views: ['side', 'top'],
  base: {
    turnTime: 1.5,
    turns: 4,
    amp: 36,
    len: 100,
    leanMax: 0.3,
    edgeShape: 0.5,
    slope: 22,
    piste: 'black',
    trailSkid: 0.8,
    width: () => 20,
    flex: ({ v }) => keys(v, [[0, 0.8], [0.12, 0.98], [0.5, 0.12], [0.86, 0.6], [1, 0.8]]),
    outer: pressure,
    torso: () => 1,
    skid: () => 0.5,
    pole: ({ v }) => win(v, 0.86, 0.14, 0.06),
    fore: () => 0.12,
    angulation: () => 0.6,
  },
  variants: [
    right,
    wrong('<b>Steife Beine und Rücklage.</b> Ohne Beugen wirft dich jeder Buckel hoch. Die Ski schießen nach vorne und du sitzt hinten.', {
      flex: () => 0.12,
      fore: ({ v }) => keys(v, [[0, -0.5], [0.3, -1], [0.7, -0.6], [1, -0.5]]),
      pole: () => 0,
      torso: () => 0.3,
    }),
  ],
  steps: [
    { a: 0.86, b: 0.2, label: 'Auf dem Buckel beugen', text: 'Die Kuppe drückt die Ski hoch. Du lässt die Knie zur Brust kommen, der Kopf bleibt auf einer Höhe. Hier drehen die Ski am leichtesten.' },
    { a: 0.2, b: 0.6, label: 'In der Mulde strecken', text: 'Hinter dem Buckel streckst du die Beine und drückst die Skispitzen nach unten. So bleiben die Ski am Schnee.' },
    { a: 0.6, b: 0.86, label: 'Driften, Stock vor', text: 'Auf der Rückseite driftest du und baust Tempo ab. Der Stock geht schon zur nächsten Kuppe.' },
  ],
};

export const eis = {
  id: 'eis',
  views: ['front', 'top'],
  base: {
    turnTime: 3.1,
    amp: 96,
    len: 230,
    leanMax: 0.34,
    edgeShape: 1.15,
    slope: 18,
    piste: 'red',
    trailSkid: 0.4,
    width: () => 25,
    flex: ({ v }) => keys(v, [[0, 0.4], [0.12, 0.3], [0.62, 0.55], [1, 0.4]]),
    outer: ({ v }) => keys(v, [[0, 0.66], [0.12, 0.5], [0.4, 0.74], [0.7, 0.88], [1, 0.66]]),
    torso: () => 0.6,
    skid: () => 0.18,
    angulation: () => 0.62,
  },
  variants: [
    right,
    wrong('<b>Hart aufgekantet und nach innen gelehnt.</b> Die Kante kommt schlagartig und bricht aus. Der Außenski hat zu wenig Druck und rutscht weg.', {
      edgeShape: 0.2,
      lean: () => 1.3,
      angulation: () => -0.05,
      outer: () => 0.38,
      skid: () => 0.46,
      trailSkid: 1,
      flex: () => 0.25,
    }),
  ],
  steps: [
    { a: 0, b: 0.14, label: 'Ruhig umkanten', text: 'Kein Ruck im Wechsel. Du stehst kurz auf beiden Ski gleich.' },
    { a: 0.14, b: 0.5, label: 'Druck früh aufbauen', text: 'Der Druck wandert langsam und gleichmäßig auf den Außenski. Der Kantenwinkel wächst nur allmählich.' },
    { a: 0.5, b: 0.88, label: 'Über dem Außenski bleiben', text: 'Hüfte nach innen, Schulter über dem Außenski. Ein leichtes Rutschen ist in Ordnung.' },
    { a: 0.88, b: 1, label: 'Weich lösen', text: 'Den Druck langsam herausnehmen, dann erst umkanten.' },
  ],
};
