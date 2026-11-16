// Smoke test without a browser: load every module and run each animation
// scene through the turn model for a full loop. Run with `node tools/check.mjs`.
// `node --check` is not enough here: it misses errors like duplicate
// declarations inside functions of an ES module.

globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.document = {};

const root = new URL('..', import.meta.url).href;
const modules = [
  'js/anim/model.js', 'js/anim/topdown.js', 'js/anim/front.js', 'js/anim/side.js', 'js/anim/player.js', 'js/anim/scenes/index.js',
  'js/views/home.js', 'js/views/level.js', 'js/views/lesson.js', 'js/views/coach.js', 'js/views/problems.js', 'js/views/more.js', 'js/views/extras.js',
  'js/ui/motion.js', 'js/ui/sheet.js', 'data/lessons.js', 'data/extras.js',
];
let failed = false;
for (const m of modules) {
  try {
    await import(root + m);
  } catch (e) {
    failed = true;
    console.error(`FAIL ${m}: ${e.message}`);
  }
}

const { scenes } = await import(root + 'js/anim/scenes/index.js');
const { createTurnModel } = await import(root + 'js/anim/model.js');
const { allLessons } = await import(root + 'data/lessons.js');
const keys = ['x', 'y', 'heading', 'lean', 'flex', 'pL', 'torso', 'skiHeading', 'dist', 'fore', 'width', 'splay'];
let states = 0;
for (const sc of Object.values(scenes)) {
  for (const v of sc.variants) {
    const model = createTurnModel({ ...sc.base, ...v.cfg });
    for (let t = 0; t < model.duration; t += 0.05) {
      const st = model.state(t);
      states++;
      for (const k of keys) {
        if (!Number.isFinite(st[k])) {
          failed = true;
          console.error(`FAIL scene ${sc.id}/${v.id}: ${k} is ${st[k]} at t=${t.toFixed(2)}`);
          break;
        }
      }
    }
  }
  const covered = [0.01, 0.25, 0.5, 0.75, 0.99].every((p) => sc.steps.some((s) => (s.a <= s.b ? p >= s.a && p < s.b : p >= s.a || p < s.b)));
  if (!covered) {
    failed = true;
    console.error(`FAIL scene ${sc.id}: steps do not cover the whole turn`);
  }
}
for (const l of allLessons) {
  if (l.scene && !scenes[l.scene]) {
    failed = true;
    console.error(`FAIL lesson ${l.id}: unknown scene ${l.scene}`);
  }
}
console.log(`${modules.length} modules, ${Object.keys(scenes).length} scenes, ${states} states checked`);
process.exit(failed ? 1 : 0);
