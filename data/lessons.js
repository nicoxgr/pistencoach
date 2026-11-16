// Learning path: levels and lessons in the order ski instructors teach them.
// A lesson without `focus` is still a stub (content follows).

export const levels = [
  {
    id: 1,
    title: 'Grundlagen',
    piste: 'green',
    pisteLabel: 'Übungshang',
    summary: 'Gleiten, bremsen, erste Kurven im Pflug.',
    lessons: [
      { id: '1.1', title: 'Grundstellung und Gleiten', short: 'Locker in den Knien, Hände vorne, Gewicht über der Fußmitte.' },
      { id: '1.2', title: 'Pflug: bremsen und anhalten', short: 'Skienden auseinander, Spitzen zusammen. Je breiter der Pflug, desto stärker die Bremse.' },
      { id: '1.3', title: 'Pflugbogen', short: 'Kurven im Pflug: Druck auf den Ski, der außen liegt, und der Pflug dreht in die neue Richtung.' },
      { id: '1.4', title: 'Schrägfahrt (Pommes)', short: 'Ski parallel quer zum Hang, belastet wird der Talski. Die Bergkanten halten dich in der Spur.' },
    ],
  },
  {
    id: 2,
    title: 'Übergang zum Parallelschwung',
    piste: 'green',
    pisteLabel: 'Übungshang bis Blau',
    summary: 'Kanten spüren und die Ski im Bogen parallel stellen.',
    lessons: [
      { id: '2.1', title: 'Seitrutschen', short: 'Quer zum Hang die Kanten lösen und kontrolliert seitlich abrutschen. Trainiert das Kantengefühl.' },
      { id: '2.2', title: 'Bogen zum Hang', short: 'Aus der Schrägfahrt bergwärts drehen, bis du stehst. So lernst du, parallel zu steuern.' },
      {
        id: '2.3',
        title: 'Grundschwung',
        short: 'Der Schritt vom Pflugbogen zum Parallelschwung: Du beginnst die Kurve im Pflug und stellst die Ski danach parallel.',
        scene: 'grundschwung',
        focus: [
          'Nach der Falllinie ziehst du den Innenski aktiv zum Außenski.',
          'Der Druck bleibt auf dem Außenski. Nur so wird der Innenski frei.',
          'Oberkörper ruhig, Brust zeigt eher ins Tal, Hände vorne im Blickfeld.',
        ],
        mistakes: [
          { title: 'Die Ski bleiben im Pflug', cause: 'Beide Ski tragen gleich viel Gewicht, der Innenski bleibt auf der Kante.', fix: 'Mehr Druck auf den Außenski. Dann den leichten Innenski flach stellen und beidrehen.' },
          { title: 'Rücklage', cause: 'Die Falllinie macht Angst, du lehnst dich unbewusst zurück.', fix: 'Hände vorne halten und das Schienbein leicht in die Schuhzunge drücken.' },
          { title: 'Oberkörper dreht mit', cause: 'Du lenkst mit Schultern und Armen statt mit den Beinen.', fix: 'Stöcke wie ein Tablett vor dir halten. Die Beine drehen, der Oberkörper bleibt ruhig.' },
        ],
        drills: [
          'Pflugbögen auf flacher Piste. Nach jeder Falllinie den Innenski kurz ein paar Zentimeter anheben. Klappt das, ist er wirklich ohne Druck.',
          'Laut mitsprechen: „Pflug, Druck, beiziehen.“ Der Rhythmus hilft, den Moment fürs Beiziehen zu finden.',
          'Von Lauf zu Lauf früher beiziehen, bis die Ski schon kurz nach Kurvenbeginn parallel sind.',
        ],
        checks: [
          'Du stellst in jeder Kurve nach der Falllinie die Ski parallel, ohne zu stocken.',
          'Die Schrägfahrt zwischen den Kurven fährst du parallel.',
          'Es klappt in beide Richtungen gleich gut.',
        ],
        cues: ['Pflug, Druck, beiziehen', 'Außenski belasten', 'Hände vorne'],
      },
    ],
  },
  {
    id: 3,
    title: 'Parallel auf Blau',
    piste: 'blue',
    pisteLabel: 'Blaue Piste',
    summary: 'Kurven ohne Pflug: entlasten, umkanten, rund steuern.',
    lessons: [
      { id: '3.1', title: 'Parallele Grundstellung', short: 'Ski hüftbreit und parallel, beide Knie gleich gebeugt. Diese offene Stellung gibt dir Stabilität.' },
      {
        id: '3.2',
        title: 'Schwungauslösung: entlasten und umkanten',
        short: 'Statt im Pflug beginnst du die Kurve, indem du dich kurz aufrichtest, beide Ski flach stellst und gleichzeitig auf die neuen Kanten kippst.',
        scene: 'schwungausloesung',
        focus: [
          'Hochkommen nimmt Druck von den Ski. Dann lassen sie sich leicht umkanten und drehen.',
          'Beide Ski kanten gleichzeitig um, nicht nacheinander.',
          'Nach dem Umkanten gehst du wieder tiefer und belastest den neuen Außenski.',
        ],
        mistakes: [
          { title: 'Steif auf einer Höhe', cause: 'Ohne Hoch und Tief bleiben die Ski auf der alten Kante kleben. Die Kurve startet zäh oder mit Pflug.', fix: 'Beim Kurvenwechsel bewusst „hoch“, in der Kurve „tief“. Am Anfang ruhig übertreiben.' },
          { title: 'Oberkörper dreht die Kurve', cause: 'Schultern reißen die Ski herum, die Ski rutschen quer und das Tempo ist schwer zu kontrollieren.', fix: 'Die Beine drehen unter einem ruhigen Oberkörper. Brust und Blick zeigen eher ins Tal.' },
          { title: 'Aufrichten nach hinten', cause: 'Beim Hochkommen kippt die Hüfte zurück, du landest in Rücklage.', fix: 'Nach vorne oben aufrichten, Richtung Skispitzen. Hände bleiben vorne.' },
        ],
        drills: [
          'Im Stand üben: tief, hoch, tief. Dann in der Fahrt laut „hoch, um, tief“ sagen.',
          'Girlanden: In der Schrägfahrt mehrmals kurz hochkommen und die Ski leicht bergwärts drehen, ohne die ganze Kurve zu fahren.',
          'Stockeinsatz als Startsignal: Stock tippen heißt hochkommen und umkanten.',
        ],
        checks: [
          'Beide Ski kanten gleichzeitig um, ohne dass sich ein Pflug bildet.',
          'Auf Blau fährst du 10 Kurven am Stück parallel.',
          'Das Hoch und Tief fühlt sich wie ein ruhiger Rhythmus an.',
        ],
        cues: ['Hoch, um, tief', 'Beide Ski gleichzeitig', 'Nach vorne aufrichten'],
      },
      { id: '3.3', title: 'Kurven zu Ende fahren', short: 'Tempo kontrollierst du über die Kurvenform: Fahr jede Kurve weit genug quer zum Hang aus.' },
      { id: '3.4', title: 'Stockeinsatz und Rhythmus', short: 'Der Stock gibt den Takt vor und stabilisiert den Kurvenwechsel.' },
    ],
  },
  {
    id: 4,
    title: 'Parallel auf Rot',
    piste: 'red',
    pisteLabel: 'Rote Piste',
    summary: 'Steiler, schneller: Oberkörper talwärts, Druck außen, kontrolliert driften.',
    lessons: [
      { id: '4.1', title: 'Oberkörper zeigt ins Tal', short: 'Je steiler der Hang, desto wichtiger: Die Brust zeigt talwärts, die Beine drehen darunter.' },
      { id: '4.2', title: 'Druck auf den Außenski', short: 'Im Steilen rutscht der Außenski weg, wenn er zu wenig Druck bekommt. Hüfte nach innen, Oberkörper nach außen.' },
      { id: '4.3', title: 'Driftschwung im Steilen', short: 'Kontrolliertes Rutschen in der Kurve bremst, ohne dass du in den Pflug gehst.' },
      { id: '4.4', title: 'Linienwahl und Tempo', short: 'Wo du fährst, bestimmt, wie schnell du wirst. Und was du tun kannst, wenn es dir zu schnell wird.' },
    ],
  },
  {
    id: 5,
    title: 'Carving-Grundlagen',
    piste: 'red',
    pisteLabel: 'Blau bis Rot',
    summary: 'Auf der Kante fahren statt rutschen.',
    lessons: [
      { id: '5.1', title: 'Aufkanten und Kantenspur', short: 'Ski nur über die Kanten steuern und zwei schmale Spuren in den Schnee ziehen.' },
      { id: '5.2', title: 'Kurvenlage', short: 'Knie und Hüfte in die Kurve, damit die Ski mehr auf die Kante kommen.' },
      { id: '5.3', title: 'Lange Carvingschwünge', short: 'Große, runde Kurven auf der Kante, ohne zu rutschen.' },
    ],
  },
  {
    id: 6,
    title: 'Kurzschwung und Steilhang',
    piste: 'black',
    pisteLabel: 'Schwarze Piste',
    summary: 'Enge Kurven im schnellen Rhythmus, sicher im Steilen.',
    lessons: [
      { id: '6.1', title: 'Kurzschwung-Rhythmus', short: 'Kurze, schnelle Schwünge eng an der Falllinie mit ruhigem Oberkörper.' },
      { id: '6.2', title: 'Steilhang fahren', short: 'Mit Kurzschwung und klarem Stockeinsatz kontrolliert durchs Steile.' },
    ],
  },
  {
    id: 7,
    title: 'Gelände',
    piste: 'black',
    pisteLabel: 'Ausblick',
    summary: 'Buckel, Tiefschnee und harte Pisten.',
    lessons: [
      { id: '7.1', title: 'Buckelpiste', short: 'Beine als Stoßdämpfer, Kurven auf oder hinter den Buckeln.' },
      { id: '7.2', title: 'Tiefschnee', short: 'Gewicht gleichmäßig auf beide Ski, Rhythmus aus Hoch und Tief.' },
      { id: '7.3', title: 'Eis und harte Piste', short: 'Scharfe Kanten, feine Bewegungen und ruhiger Druck.' },
    ],
  },
];

export const allLessons = levels.flatMap((lv) => lv.lessons.map((l) => ({ ...l, level: lv })));
export const findLesson = (id) => allLessons.find((l) => l.id === id);
export const findLevel = (id) => levels.find((lv) => String(lv.id) === String(id));
