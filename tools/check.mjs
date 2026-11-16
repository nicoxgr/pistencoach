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
  'js/views/piste.js', 'js/views/history.js', 'js/ui/motion.js', 'js/ui/sheet.js', 'data/lessons.js', 'data/extras.js',
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

// Lesson data: every lesson is complete and links resolve.
const { problems, glossary } = await import(root + 'data/extras.js');
const fail = (msg) => {
  failed = true;
  console.error(`FAIL ${msg}`);
};
for (const l of allLessons) {
  for (const k of ['title', 'short', 'terrain', 'why', 'feel']) if (typeof l[k] !== 'string' || !l[k].trim()) fail(`lesson ${l.id}: ${k} missing`);
  if (!(l.time > 0)) fail(`lesson ${l.id}: time missing`);
  for (const k of ['focus', 'mistakes', 'drills', 'checks', 'cues']) if (!Array.isArray(l[k]) || l[k].length < 2) fail(`lesson ${l.id}: ${k} too short`);
  for (const m of l.mistakes || []) if (!m.title || !m.cause || !m.fix) fail(`lesson ${l.id}: incomplete mistake`);
  const text = JSON.stringify(l);
  if (/ [–—] /.test(text)) fail(`lesson ${l.id}: dash used as a clause separator`);
}
for (const p of problems) for (const id of p.lessons) if (!allLessons.some((l) => l.id === id)) fail(`problem ${p.id}: unknown lesson ${id}`);
if (new Set(glossary.map(([t]) => t)).size !== glossary.length) fail('glossary: duplicate term');

// Release hygiene: cache list matches the files, versions agree.
const { readFileSync, readdirSync, statSync } = await import('node:fs');
const { fileURLToPath } = await import('node:url');
const dir = fileURLToPath(root);
const sw = readFileSync(dir + 'sw.js', 'utf8');
const assets = [...sw.match(/const ASSETS = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((a) => a !== './');
const walk = (d) => readdirSync(dir + d).flatMap((n) => (statSync(dir + d + '/' + n).isDirectory() ? walk(d + '/' + n) : [d + '/' + n]));
const files = ['js', 'data', 'css', 'icons'].flatMap(walk).filter((f) => !f.endsWith('.DS_Store'));
for (const a of assets) if (!['index.html', 'manifest.webmanifest'].includes(a) && !files.includes(a)) fail(`sw.js lists a missing file: ${a}`);
for (const f of files) if (!assets.includes(f)) fail(`sw.js does not cache ${f}`);
const { APP_VERSION } = await import(root + 'js/version.js');
if (!sw.includes(`pistencoach-${APP_VERSION}`)) fail(`sw.js cache name does not match version ${APP_VERSION}`);

// Color contrast of the design tokens (WCAG: 4.5 for text, 3 for large marks).
const css = readFileSync(dir + 'css/app.css', 'utf8');
const tokens = (block) => Object.fromEntries([...block.matchAll(/--([\w-]+): (#[0-9a-f]{6})/g)].map((m) => [m[1], m[2]]));
const light = tokens(css.match(/:root \{([\s\S]*?)\n\}/)[1]);
const dark = { ...light, ...tokens(css.match(/:root\[data-theme="dark"\] \{([\s\S]*?)\n\}/)[1]) };
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const pairs = [
  ['text', 'bg', 4.5], ['text', 'surface', 4.5], ['muted', 'bg', 4.5], ['muted', 'surface', 4.5], ['muted', 'surface-2', 4.5],
  ['accent', 'surface', 4.5], ['accent', 'bg', 4.5], ['accent', 'accent-soft', 4.5], ['accent-ink', 'accent', 4.5], ['warm-ink', 'warm', 4.5],
  ['good', 'surface', 4.5], ['good', 'good-soft', 4.5], ['on-good', 'good', 4.5], ['bad', 'surface', 4.5], ['bad', 'bad-soft', 4.5],
  ['warn-ink', 'surface', 4.5], ['warn-ink', 'warn-soft', 4.5], ['green', 'surface', 3], ['blue', 'surface', 3], ['red', 'surface', 3], ['black', 'surface', 3],
];
for (const [name, t] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, min] of pairs) {
    const r = ratio(t[fg], t[bg]);
    if (r < min) fail(`contrast ${name}: ${fg} on ${bg} is ${r.toFixed(2)}, needs ${min}`);
  }
}

console.log(`${modules.length} modules, ${Object.keys(scenes).length} scenes, ${states} states checked`);
process.exit(failed ? 1 : 0);
