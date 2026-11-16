// Level 3: parallel stance, finishing turns, pole plant.

import { keys, win } from '../curves.js';

const right = { id: 'right', label: 'Richtig', cfg: {} };
const wrong = (note, cfg) => ({ id: 'wrong', label: 'Typischer Fehler', note, cfg });

const upDown = ({ v }) => keys(v, [[0, 0.45], [0.12, 0.12], [0.3, 0.32], [0.62, 0.6], [0.88, 0.72], [1, 0.45]]);
const pressure = ({ v }) => keys(v, [[0, 0.66], [0.12, 0.5], [0.3, 0.72], [0.62, 0.84], [0.9, 0.76], [1, 0.66]]);

export const parallelstellung = {
  id: 'parallelstellung',
  views: ['front', 'top'],
  base: {
    turnTime: 3.1,
    amp: 92,
    len: 215,
    leanMax: 0.36,
    slope: 13,
    piste: 'blue',
    trailSkid: 0.4,
    width: () => 24,
    flex: upDown,
    outer: pressure,
    torso: () => 0.5,
    skid: () => 0.15,
  },
  variants: [
    right,
    wrong('<b>Beine zusammengeklemmt.</b> Die Standfläche ist schmal, die Knie blockieren sich gegenseitig. Du stehst auf beiden Ski gleich und kippelst.', {
      width: () => 6,
      outer: () => 0.5,
      leanMax: 0.2,
      flex: () => 0.3,
      trailSkid: 0.7,
      skid: () => 0.28,
    }),
  ],
  steps: [
    { a: 0, b: 0.25, label: 'Hüftbreit stehen', text: 'Zwischen den Schuhen ist etwa eine Faust Platz. Das gibt dir eine stabile Standfläche.' },
    { a: 0.25, b: 0.62, label: 'Beide Knie in die Kurve', text: 'Beide Ski stehen auf derselben Kantenseite. Die blauen Linien zeigen die greifenden Kanten.' },
    { a: 0.62, b: 1, label: 'Abstand halten', text: 'Die Ski bleiben über die ganze Kurve gleich weit auseinander. Die Spur zeigt zwei gleichmäßige Linien.' },
  ],
};

export const kurvenform = {
  id: 'kurvenform',
  views: ['top', 'side'],
  base: {
    turnTime: 3.6,
    amp: 122,
    len: 165,
    leanMax: 0.38,
    slope: 14,
    piste: 'blue',
    trailSkid: 0.5,
    width: () => 22,
    flex: upDown,
    outer: pressure,
    torso: () => 0.5,
    skid: () => 0.2,
    // Slower across the hill, faster through the fall line.
    warp: (v) => v - (0.28 * Math.sin(2 * Math.PI * (v - 0.12))) / (2 * Math.PI) - (0.28 * Math.sin(2 * Math.PI * 0.12)) / (2 * Math.PI),
  },
  variants: [
    right,
    wrong('<b>Z-Kurven nah an der Falllinie.</b> Die Kurve endet, bevor die Ski quer stehen. Du baust kein Tempo ab und wirst von Kurve zu Kurve schneller.', {
      turnTime: 1.9,
      amp: 40,
      len: 250,
      skid: () => 0.3,
      fore: () => -0.6,
      flex: () => 0.3,
      trailSkid: 0.8,
      warp: (v) => v,
    }),
  ],
  steps: [
    { a: 0, b: 0.14, label: 'Umkanten', text: 'Du kommst langsam aus der Schrägfahrt und leitest die neue Kurve ein.' },
    { a: 0.14, b: 0.62, label: 'In die Falllinie', text: 'Hier nimmst du Fahrt auf. Das ist normal und gewollt.' },
    { a: 0.62, b: 0.9, label: 'Weiterdrehen', text: 'Nach der Falllinie steuerst du weiter, bis die Ski fast quer zum Hang zeigen. Jetzt baust du das Tempo wieder ab.' },
    { a: 0.9, b: 1, label: 'Tempo prüfen', text: 'Passt das Tempo, beginnt die nächste Kurve. Sonst fährst du noch ein Stück bergwärts.' },
  ],
};

export const stockeinsatz = {
  id: 'stockeinsatz',
  views: ['side', 'front', 'top'],
  startT: 1.5,
  base: {
    turnTime: 2.7,
    amp: 92,
    len: 200,
    leanMax: 0.42,
    edgeShape: 0.55,
    slope: 15,
    piste: 'blue',
    trailSkid: 0.4,
    width: () => 22,
    flex: upDown,
    outer: pressure,
    torso: () => 0.6,
    skid: () => 0.15,
    pole: ({ v }) => win(v, 0.86, 0.12, 0.07),
  },
  variants: [
    right,
    wrong('<b>Der Stock kommt zu spät.</b> Du tippst erst, wenn die Kurve schon läuft. Der Takt fehlt und der Arm zieht dich nach hinten.', {
      pole: ({ v }) => win(v, 0.22, 0.42, 0.06),
      fore: () => -0.55,
      flex: () => 0.38,
      edgeShape: 1.3,
      torso: () => 0.15,
    }),
  ],
  steps: [
    { a: 0.6, b: 0.86, label: 'Stock vorbereiten', text: 'Am Ende der Kurve schwingt der Talstock aus dem Handgelenk nach vorne.' },
    { a: 0.86, b: 0.06, label: 'Tippen und aufrichten', text: 'Der Stock tippt neben der Skispitze in den Schnee. Gleichzeitig kommst du hoch.' },
    { a: 0.06, b: 0.3, label: 'Um den Stock herum', text: 'Du kantest um und fährst um den Stock herum. Die Hand geht sofort wieder nach vorne.' },
    { a: 0.3, b: 0.6, label: 'Steuern', text: 'Ruhige Arme, beide Hände im Blickfeld. Die Kurve läuft, der nächste Stock wartet.' },
  ],
};
