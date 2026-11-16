// Levels 4 to 7: upper body, outside ski, drifting, carving, short turns,
// steep slopes and powder.

import { keys, win } from '../curves.js';

const right = { id: 'right', label: 'Richtig', cfg: {} };
const wrong = (note, cfg) => ({ id: 'wrong', label: 'Typischer Fehler', note, cfg });

const upDown = ({ v }) => keys(v, [[0, 0.45], [0.12, 0.12], [0.3, 0.32], [0.62, 0.6], [0.88, 0.75], [1, 0.45]]);
const pressure = ({ v }) => keys(v, [[0, 0.66], [0.12, 0.5], [0.3, 0.74], [0.62, 0.86], [0.9, 0.78], [1, 0.66]]);
const plant = ({ v }) => win(v, 0.9, 0.1, 0.05);

export const oberkoerper = {
  id: 'oberkoerper',
  views: ['top', 'front'],
  base: {
    turnTime: 2.3,
    amp: 78,
    len: 185,
    leanMax: 0.46,
    edgeShape: 0.55,
    slope: 21,
    piste: 'red',
    trailSkid: 0.5,
    width: () => 22,
    flex: upDown,
    outer: pressure,
    torso: () => 0.9,
    skid: () => 0.22,
    pole: plant,
    angulation: () => 0.45,
  },
  variants: [
    right,
    wrong('<b>Der Oberkörper dreht mit.</b> Schultern und Hüfte folgen den Ski bergwärts. Die Skienden rutschen weg und die nächste Kurve braucht einen neuen Anlauf.', {
      torso: () => -0.18,
      skid: () => 0.42,
      outer: () => 0.52,
      angulation: () => 0.05,
      pole: () => 0,
      fore: () => -0.45,
      edgeShape: 1.5,
      trailSkid: 0.95,
    }),
  ],
  steps: [
    { a: 0, b: 0.12, label: 'Blick ins Tal', text: 'Stock setzen, aufrichten. Brust und Helm zeigen talwärts.' },
    { a: 0.12, b: 0.45, label: 'Beine drehen', text: 'Die Ski drehen unter dir in die neue Kurve. Der Oberkörper bleibt, wo er ist.' },
    { a: 0.45, b: 0.85, label: 'Verwindung aufbauen', text: 'Ski und Oberkörper zeigen in verschiedene Richtungen. In der Hüfte entsteht Spannung.' },
    { a: 0.85, b: 1, label: 'Spannung nutzen', text: 'Beim Entlasten drehen die Ski von selbst zurück unter den Körper. Die nächste Kurve beginnt leicht.' },
  ],
};

export const aussenski = {
  id: 'aussenski',
  views: ['front', 'top'],
  base: {
    turnTime: 2.8,
    amp: 90,
    len: 200,
    leanMax: 0.5,
    edgeShape: 0.6,
    slope: 22,
    piste: 'red',
    trailSkid: 0.35,
    width: () => 24,
    flex: upDown,
    outer: ({ v }) => keys(v, [[0, 0.7], [0.12, 0.5], [0.3, 0.8], [0.62, 0.93], [0.9, 0.84], [1, 0.7]]),
    torso: () => 0.6,
    skid: () => 0.14,
    angulation: () => 0.58,
  },
  variants: [
    right,
    wrong('<b>Innenlage.</b> Der ganze Körper kippt wie ein Brett in die Kurve. Das Gewicht landet auf dem Innenski, der Außenski verliert den Halt und rutscht weg.', {
      outer: () => 0.3,
      angulation: () => -0.05,
      lean: () => 1.15,
      skid: () => 0.38,
      trailSkid: 0.9,
      flex: () => 0.35,
    }),
  ],
  steps: [
    { a: 0, b: 0.12, label: 'Umkanten', text: 'Im Wechsel stehst du kurz auf beiden Ski gleich. Die Druckpfeile sind gleich lang.' },
    { a: 0.12, b: 0.5, label: 'Druck außen aufbauen', text: 'Das Gewicht wandert auf den neuen Außenski. Er färbt sich orange.' },
    { a: 0.5, b: 0.88, label: 'Hüfte rein, Schulter raus', text: 'Die Hüfte geht in die Kurve, der Oberkörper bleibt aufrecht über dem Außenski. Die Schultern stehen fast waagrecht.' },
    { a: 0.88, b: 1, label: 'Lösen', text: 'Am Kurvenende nimmst du den Druck heraus und richtest dich für den Wechsel auf.' },
  ],
};

export const driftschwung = {
  id: 'driftschwung',
  views: ['top', 'side'],
  base: {
    turnTime: 2.6,
    amp: 70,
    len: 150,
    leanMax: 0.32,
    slope: 26,
    piste: 'red',
    trailSkid: 1,
    width: () => 22,
    flex: upDown,
    outer: pressure,
    torso: () => 0.85,
    skid: () => 0.52,
    pole: plant,
    angulation: () => 0.5,
  },
  variants: [
    right,
    wrong('<b>Zu früh und zu hart aufgekantet.</b> Die Ski schneiden, statt zu driften. Sie laufen geradeaus davon, du wirst schnell und gerätst in Rücklage.', {
      turnTime: 2,
      amp: 46,
      len: 250,
      skid: () => 0.05,
      trailSkid: 0.1,
      fore: () => -0.75,
      pole: () => 0,
      flex: () => 0.3,
      torso: () => 0.3,
    }),
  ],
  steps: [
    { a: 0, b: 0.12, label: 'Hoch und flach', text: 'Stock setzen und aufrichten. Die Ski liegen flach und lassen sich leicht drehen.' },
    { a: 0.12, b: 0.5, label: 'Quer drehen', text: 'Du drehst die Ski zügig quer zur Fahrtrichtung. Sie zeigen stärker in die Kurve, als du fährst.' },
    { a: 0.5, b: 0.9, label: 'Driften und bremsen', text: 'Die Ski schaben seitlich über den Schnee. Das breite Band in der Spur zeigt den Drift. Mit der Kante dosierst du die Bremse.' },
    { a: 0.9, b: 1, label: 'Kante setzen', text: 'Kurz stärker aufkanten, das gibt Halt für den nächsten Stockeinsatz.' },
  ],
};

export const kantenspur = {
  id: 'kantenspur',
  views: ['top', 'front'],
  base: {
    turnTime: 3,
    amp: 98,
    len: 250,
    leanMax: 0.5,
    edgeShape: 0.85,
    slope: 11,
    piste: 'blue',
    trailSkid: 0,
    width: () => 27,
    flex: ({ v }) => keys(v, [[0, 0.4], [0.12, 0.3], [0.62, 0.55], [1, 0.4]]),
    outer: ({ v }) => keys(v, [[0, 0.62], [0.12, 0.5], [0.62, 0.76], [1, 0.62]]),
    torso: () => 0.25,
    skid: () => 0,
    angulation: () => 0.4,
  },
  variants: [
    right,
    wrong('<b>Andrehen statt kippen.</b> Die Füße drehen die Ski quer. Die Kante verliert sofort den Halt und aus den zwei Linien wird ein verwischtes Band.', {
      skid: () => 0.36,
      trailSkid: 0.9,
      torso: () => -0.1,
      leanMax: 0.3,
      edgeShape: 1.4,
    }),
  ],
  steps: [
    { a: 0, b: 0.14, label: 'Flach stellen', text: 'Im Wechsel liegen beide Ski für einen Moment flach auf dem Schnee.' },
    { a: 0.14, b: 0.4, label: 'Kippen', text: 'Knie und Hüfte gehen zur Seite. Beide Ski kippen gleichzeitig auf die neue Kante. Die Füße drehen nicht.' },
    { a: 0.4, b: 0.86, label: 'Der Ski fährt die Kurve', text: 'Der aufgekantete Ski biegt sich durch und zieht seinen Bogen. Im Schnee bleiben zwei schmale Linien.' },
    { a: 0.86, b: 1, label: 'Aufrichten', text: 'Du löst die Kante und kippst direkt weiter auf die andere Seite.' },
  ],
};

export const kurvenlage = {
  id: 'kurvenlage',
  views: ['front', 'side'],
  base: {
    turnTime: 3,
    amp: 105,
    len: 240,
    leanMax: 0.6,
    edgeShape: 0.8,
    slope: 16,
    piste: 'red',
    trailSkid: 0,
    width: () => 28,
    flex: ({ v }) => keys(v, [[0, 0.35], [0.12, 0.25], [0.62, 0.62], [0.9, 0.5], [1, 0.35]]),
    outer: ({ v }) => keys(v, [[0, 0.64], [0.12, 0.5], [0.62, 0.82], [1, 0.64]]),
    torso: () => 0.35,
    skid: () => 0,
    angulation: () => 0.52,
  },
  variants: [
    right,
    wrong('<b>Mit der Schulter in die Kurve gefallen.</b> Der Oberkörper kippt zuerst, ohne Hüftknick. Das Gewicht liegt innen und der Außenski verliert Halt.', {
      angulation: () => -0.1,
      outer: () => 0.34,
      skid: () => 0.25,
      trailSkid: 0.7,
      leanMax: 0.5,
    }),
  ],
  steps: [
    { a: 0, b: 0.14, label: 'Neutral', text: 'Im Wechsel stehst du aufrecht über beiden Ski.' },
    { a: 0.14, b: 0.45, label: 'Knie, dann Hüfte', text: 'Erst kippen die Knie in die Kurve, dann folgt die Hüfte. Der Kantenwinkel wächst.' },
    { a: 0.45, b: 0.85, label: 'Lage halten', text: 'Die Fliehkraft trägt dich. Außenbein lang, Innenbein gebeugt, der Oberkörper bleibt aufrechter als die Beine.' },
    { a: 0.85, b: 1, label: 'Aufrichten', text: 'Die Lage nimmt ab, der Körper wandert über die Ski zurück.' },
  ],
};

export const carvinglang = {
  id: 'carvinglang',
  views: ['top', 'front', 'side'],
  base: {
    turnTime: 3.8,
    amp: 122,
    len: 310,
    leanMax: 0.58,
    edgeShape: 0.9,
    slope: 17,
    piste: 'red',
    trailSkid: 0,
    width: () => 28,
    flex: ({ v }) => keys(v, [[0, 0.35], [0.12, 0.28], [0.62, 0.6], [0.88, 0.5], [1, 0.35]]),
    outer: ({ v }) => keys(v, [[0, 0.6], [0.12, 0.5], [0.7, 0.84], [1, 0.6]]),
    torso: () => 0.3,
    skid: () => 0,
    angulation: () => 0.5,
  },
  variants: [
    right,
    wrong('<b>Spät gekantet und hinten gesessen.</b> Die Kante greift erst in der Falllinie. Der Druck kommt schlagartig, die Ski rutschen und fahren dir am Kurvenende davon.', {
      edgeShape: 2.4,
      fore: ({ v }) => keys(v, [[0, -0.8], [0.3, -0.2], [0.62, -0.4], [1, -0.8]]),
      skid: () => 0.22,
      trailSkid: 0.6,
      angulation: () => 0.15,
    }),
  ],
  steps: [
    { a: 0, b: 0.14, label: 'Früh umkanten', text: 'Noch oberhalb der Falllinie stehst du auf den neuen Kanten.' },
    { a: 0.14, b: 0.62, label: 'Druck aufbauen', text: 'Der Druck wächst gleichmäßig, die Lage nimmt zu. Der Ski biegt sich durch.' },
    { a: 0.62, b: 0.9, label: 'Größter Druck', text: 'Kurz nach der Falllinie ist der Druck am stärksten. Du stehst kräftig auf dem Außenski.' },
    { a: 0.9, b: 1, label: 'Lösen', text: 'Du gibst nach. Die Spannung im Ski trägt dich in die nächste Kurve.' },
  ],
};

export const kurzschwung = {
  id: 'kurzschwung',
  views: ['top', 'front', 'side'],
  base: {
    turnTime: 1.25,
    turns: 4,
    amp: 30,
    len: 96,
    leanMax: 0.36,
    edgeShape: 0.5,
    slope: 24,
    piste: 'black',
    trailSkid: 0.75,
    width: () => 20,
    flex: ({ v }) => keys(v, [[0, 0.6], [0.14, 0.15], [0.5, 0.4], [0.9, 0.78], [1, 0.6]]),
    outer: pressure,
    torso: () => 1,
    skid: () => 0.55,
    pole: ({ v }) => win(v, 0.86, 0.12, 0.06),
    angulation: () => 0.6,
  },
  variants: [
    right,
    wrong('<b>Der Oberkörper pendelt mit.</b> Die Schultern drehen jede Kurve mit. Der Takt wird träge, der Kantengriff fehlt und du wirst schneller.', {
      turnTime: 1.7,
      amp: 44,
      len: 150,
      torso: () => -0.05,
      pole: () => 0,
      flex: () => 0.35,
      skid: () => 0.3,
      angulation: () => 0.1,
      fore: () => -0.4,
    }),
  ],
  steps: [
    { a: 0.86, b: 0.1, label: 'Stock und Abdruck', text: 'Stock tippen, die Kanten greifen kurz und kräftig. Das bremst und gibt den Abdruck.' },
    { a: 0.1, b: 0.5, label: 'Beine drehen', text: 'Du kommst hoch, die Ski drehen schnell durch die Falllinie. Helm und Brust zeigen weiter ins Tal.' },
    { a: 0.5, b: 0.86, label: 'Tief und bremsen', text: 'Tiefgehen, quer driften, Tempo abbauen. Der nächste Stock ist schon unterwegs.' },
  ],
};

export const steilhang = {
  id: 'steilhang',
  views: ['side', 'top'],
  base: {
    turnTime: 1.6,
    turns: 4,
    amp: 44,
    len: 84,
    leanMax: 0.34,
    edgeShape: 0.5,
    slope: 31,
    piste: 'black',
    trailSkid: 1,
    width: () => 22,
    flex: ({ v }) => keys(v, [[0, 0.65], [0.14, 0.15], [0.5, 0.45], [0.9, 0.85], [1, 0.65]]),
    outer: pressure,
    torso: () => 1,
    skid: () => 0.75,
    pole: ({ v }) => win(v, 0.84, 0.13, 0.06),
    fore: () => 0.15,
    angulation: () => 0.65,
  },
  variants: [
    right,
    wrong('<b>Zum Hang gelehnt.</b> Der Körper sucht Sicherheit am Berg und weicht nach hinten aus. Die Kanten verlieren Druck, die Ski rutschen und beschleunigen.', {
      fore: () => -0.95,
      pole: () => 0,
      flex: () => 0.3,
      torso: () => 0.2,
      skid: () => 0.3,
      len: 130,
      trailSkid: 0.6,
    }),
  ],
  steps: [
    { a: 0.84, b: 0.1, label: 'Stock weit ins Tal', text: 'Der Stock geht weit nach vorne unten. Er zieht deinen Oberkörper dem Tal entgegen.' },
    { a: 0.1, b: 0.5, label: 'Schnell quer', text: 'Aufrichten, umkanten und die Ski zügig durch die Falllinie drehen. Hier nicht zögern.' },
    { a: 0.5, b: 0.84, label: 'Kante setzen', text: 'Tief gehen und entschlossen aufkanten. Jeder Schwung endet mit einer klaren Bremse.' },
  ],
};

export const tiefschnee = {
  id: 'tiefschnee',
  views: ['front', 'side', 'top'],
  base: {
    turnTime: 2.1,
    amp: 50,
    len: 160,
    leanMax: 0.3,
    slope: 20,
    piste: 'black',
    trailSkid: 0.6,
    width: () => 13,
    flex: ({ v }) => keys(v, [[0, 0.7], [0.14, 0.1], [0.4, 0.3], [0.85, 0.8], [1, 0.7]]),
    outer: () => 0.52,
    torso: () => 0.85,
    skid: () => 0.2,
    pole: plant,
    angulation: () => 0.3,
  },
  variants: [
    right,
    wrong('<b>Nur der Außenski ist belastet und du sitzt hinten.</b> Der Außenski sinkt ein und bremst, der Innenski schwimmt auf. Die Oberschenkel brennen nach wenigen Kurven.', {
      outer: () => 0.88,
      fore: () => -0.9,
      flex: () => 0.6,
      width: () => 24,
    }),
  ],
  steps: [
    { a: 0, b: 0.16, label: 'Hochfedern', text: 'Du streckst dich, die Ski kommen an die Oberfläche. Beide Druckpfeile sind gleich lang.' },
    { a: 0.16, b: 0.45, label: 'Drehen', text: 'Oben im Schnee lassen sich die Ski leicht drehen. Beide gemeinsam, eng geführt wie eine Plattform.' },
    { a: 0.45, b: 1, label: 'Einsinken', text: 'Du gehst tief, die Ski tauchen ab und der Schnee bremst dich weich. Dann federst du wieder hoch.' },
  ],
};
