// Animation player: owns the timeline, the view switcher, the right/wrong
// toggle and the step list that stays in sync with the animation.

import { createTurnModel } from './model.js';
import { createTopView } from './topdown.js';
import { createFrontView } from './front.js';
import { createSideView } from './side.js';
import { mod } from './curves.js';

const VIEWS = {
  top: { label: 'Von oben', create: createTopView },
  front: { label: 'Von hinten', create: createFrontView },
  side: { label: 'Seitlich', create: createSideView },
};
const SPEEDS = [0.25, 0.5, 1];

const h = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};

function stepIndex(steps, v) {
  for (let i = 0; i < steps.length; i++) {
    const { a, b } = steps[i];
    if (a <= b ? v >= a && v < b : v >= a || v < b) return i;
  }
  return 0;
}

export function createPlayer(scene) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = h('div', 'player');
  const stage = h('div', 'stage');
  const chip = h('div', 'step-chip');
  const badge = h('div', 'variant-badge', 'Fehlerbild');
  stage.append(chip, badge);

  const controls = h('div', 'controls');
  const playBtn = h('button', 'play', '');
  playBtn.type = 'button';
  const range = h('input', 'scrub');
  Object.assign(range, { type: 'range', min: 0, max: 1000, value: 0 });
  range.setAttribute('aria-label', 'Zeitleiste');
  const speedBtn = h('button', 'speed', '');
  speedBtn.type = 'button';
  speedBtn.setAttribute('aria-label', 'Tempo');
  controls.append(playBtn, range, speedBtn);

  const viewSeg = h('div', 'seg');
  const varSeg = h('div', 'seg seg-variant');
  const note = h('p', 'variant-note');
  const stepList = h('ol', 'steps');
  root.append(stage, controls, viewSeg);
  if (scene.variants.length > 1) root.append(varSeg, note);
  root.append(stepList);

  let variant = scene.variants[0];
  let model = createTurnModel({ ...scene.base, ...variant.cfg });
  let viewId = scene.views[0];
  let view = null;
  let t = scene.startT ?? 0;
  let speed = 1;
  let playing = !reduced;
  let raf = 0;
  let last = 0;
  let curStep = -1;

  function buildView() {
    if (view) view.svg.remove();
    view = VIEWS[viewId].create(model);
    stage.prepend(view.svg);
    draw();
  }

  function draw() {
    const st = model.state(t);
    view.render(st);
    range.value = Math.round((t / model.duration) * 1000);
    const i = stepIndex(scene.steps, st.v);
    if (i !== curStep) {
      curStep = i;
      chip.textContent = `${i + 1} · ${scene.steps[i].label}`;
      [...stepList.children].forEach((li, j) => li.classList.toggle('active', j === i));
    }
  }

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    t = mod(t + dt * speed, model.duration);
    draw();
    raf = requestAnimationFrame(frame);
  }

  function setPlaying(p) {
    playing = p;
    playBtn.innerHTML = p ? '<span aria-hidden="true">❚❚</span>' : '<span aria-hidden="true">▶</span>';
    playBtn.setAttribute('aria-label', p ? 'Pause' : 'Abspielen');
    cancelAnimationFrame(raf);
    if (p) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function setSpeed(s) {
    speed = s;
    speedBtn.textContent = `${String(s).replace('.', ',')}×`;
  }

  // View switcher
  for (const id of scene.views) {
    const b = h('button', '', VIEWS[id].label);
    b.type = 'button';
    b.onclick = () => {
      viewId = id;
      [...viewSeg.children].forEach((c) => c.classList.toggle('on', c === b));
      buildView();
    };
    if (id === viewId) b.classList.add('on');
    viewSeg.append(b);
  }
  if (scene.views.length < 2) viewSeg.hidden = true;

  // Right / wrong toggle
  for (const v of scene.variants) {
    const b = h('button', v.id === 'wrong' ? 'bad' : 'good', v.label);
    b.type = 'button';
    b.onclick = () => {
      variant = v;
      model = createTurnModel({ ...scene.base, ...v.cfg });
      [...varSeg.children].forEach((c) => c.classList.toggle('on', c === b));
      stage.classList.toggle('wrong', v.id === 'wrong');
      note.innerHTML = v.note || '';
      note.hidden = !v.note;
      buildView();
    };
    if (v === variant) b.classList.add('on');
    varSeg.append(b);
  }
  note.hidden = true;

  // Steps
  scene.steps.forEach((s, i) => {
    const li = h('li', '', `<b>${s.label}</b><span>${s.text}</span>`);
    li.tabIndex = 0;
    li.onclick = () => {
      const k = Math.floor(t / model.turnTime);
      t = mod((k + s.a + 0.04) * model.turnTime, model.duration);
      setPlaying(false);
      draw();
    };
    li.onkeydown = (e) => e.key === 'Enter' && li.onclick();
    stepList.append(li);
  });

  playBtn.onclick = () => setPlaying(!playing);
  speedBtn.onclick = () => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]);
  range.oninput = () => {
    t = (range.value / 1000) * model.duration;
    if (t >= model.duration) t = 0;
    draw();
  };

  setSpeed(1);
  buildView();
  setPlaying(playing);

  return {
    el: root,
    destroy() {
      cancelAnimationFrame(raf);
    },
  };
}
