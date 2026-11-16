// Animation player: owns the timeline, the view switcher, the right/wrong
// toggle, the legend and the step list that stays in sync with the animation.

import { createTurnModel } from './model.js';
import { createTopView } from './topdown.js';
import { createFrontView } from './front.js';
import { createSideView } from './side.js';
import { mod } from './curves.js';
import { C } from './palette.js';
import { icon } from '../views/common.js';
import { setSeg } from '../ui/motion.js';

const PRESS = { color: C.skiPress, text: 'Druck auf dem Ski' };
const EDGE = { color: C.edge, text: 'Kante greift', line: true };
const VIEWS = {
  top: { label: 'Von oben', create: createTopView, legend: [PRESS, EDGE, { color: C.trailBand, text: 'Breite Spur: Ski driftet' }] },
  front: { label: 'Von hinten', create: createFrontView, legend: [PRESS, EDGE] },
  side: { label: 'Seitlich', create: createSideView, legend: [{ color: C.good, text: 'Schwerpunkt über dem Fuß' }, { color: C.bad, text: 'Schwerpunkt daneben' }] },
};
const SPEEDS = [1, 0.5, 0.25];

const h = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};

const inStep = (s, v) => (s.a <= s.b ? v >= s.a && v < s.b : v >= s.a || v < s.b);

function stepIndex(steps, v) {
  const i = steps.findIndex((s) => inStep(s, v));
  return i < 0 ? 0 : i;
}

export function createPlayer(scene) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = h('div', 'player');
  const stage = h('div', 'stage');
  const chip = h('div', 'step-chip');
  const badge = h('div', 'variant-badge', 'Fehlerbild');
  const bigPlay = h('button', 'stage-play', icon('play'));
  bigPlay.type = 'button';
  bigPlay.setAttribute('aria-label', 'Abspielen');
  stage.append(chip, badge, bigPlay);

  const controls = h('div', 'controls');
  const playBtn = h('button', 'play');
  playBtn.type = 'button';
  const range = h('input', 'scrub');
  Object.assign(range, { type: 'range', min: 0, max: 1000, value: 0 });
  range.setAttribute('aria-label', 'Zeitleiste');
  const speedBtn = h('button', 'speed');
  speedBtn.type = 'button';
  controls.append(playBtn, range, speedBtn);

  const viewSeg = h('div', 'seg');
  viewSeg.setAttribute('role', 'group');
  viewSeg.setAttribute('aria-label', 'Ansicht');
  const varSeg = h('div', 'seg seg-variant');
  varSeg.setAttribute('role', 'group');
  varSeg.setAttribute('aria-label', 'Richtig oder Fehler');
  const note = h('p', 'variant-note');
  const legend = h('div', 'legend');
  const stepList = h('ol', 'steps');
  root.append(stage, controls, viewSeg);
  if (scene.variants.length > 1) root.append(varSeg, note);
  root.append(legend, stepList);

  let variant = scene.variants[0];
  let model = createTurnModel({ ...scene.base, ...variant.cfg });
  let viewId = scene.views[0];
  let view = null;
  let t = scene.startT ?? 0;
  let speed = 1;
  let playing = !reduced;
  let visible = true;
  let raf = 0;
  let last = 0;
  let curStep = -1;
  let showSteps = true; // the steps describe the right movement only

  function buildView() {
    if (view) view.svg.remove();
    view = VIEWS[viewId].create(model);
    stage.prepend(view.svg);
    legend.innerHTML = VIEWS[viewId].legend.map((l) => `<span><i class="${l.line ? 'line' : ''}" style="background:${l.color}"></i>${l.text}</span>`).join('');
    draw();
  }

  function draw() {
    const st = model.state(t);
    view.render(st);
    const pos = (t / model.duration) * 1000;
    range.value = Math.round(pos);
    range.style.setProperty('--pos', `${pos / 10}%`);
    if (!showSteps) return;
    const i = stepIndex(scene.steps, st.v);
    const s = scene.steps[i];
    if (i !== curStep) {
      curStep = i;
      chip.innerHTML = `<b>${i + 1}</b>${s.label}`;
      if (!reduced) chip.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' });
      [...stepList.children].forEach((li, j) => li.classList.toggle('active', j === i));
    }
    const len = mod(s.b - s.a, 1) || 1;
    stepList.children[i].style.setProperty('--p', (mod(st.v - s.a, 1) / len).toFixed(3));
  }

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    t = mod(t + dt * speed, model.duration);
    draw();
    raf = requestAnimationFrame(frame);
  }

  function loop() {
    cancelAnimationFrame(raf);
    if (playing && visible) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function setPlaying(p) {
    playing = p;
    playBtn.innerHTML = icon(p ? 'pause' : 'play');
    playBtn.setAttribute('aria-label', p ? 'Pause' : 'Abspielen');
    stage.classList.toggle('paused', !p);
    loop();
  }

  function setSpeed(s) {
    speed = s;
    speedBtn.textContent = `${String(s).replace('.', ',')}×`;
    speedBtn.setAttribute('aria-label', `Tempo ${speedBtn.textContent}, tippen zum Ändern`);
    speedBtn.classList.toggle('slow', s < 1);
  }

  // View switcher
  scene.views.forEach((id, i) => {
    const b = h('button', '', VIEWS[id].label);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.onclick = () => {
      viewId = id;
      setSeg(viewSeg, i);
      buildView();
    };
    viewSeg.append(b);
  });
  setSeg(viewSeg, 0);
  if (scene.views.length < 2) viewSeg.hidden = true;

  // Right / wrong toggle
  scene.variants.forEach((v, i) => {
    const bad = v.id === 'wrong';
    const b = h('button', bad ? 'bad' : 'good', `${icon(bad ? 'x' : 'check')}${v.label}`);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.onclick = () => {
      variant = v;
      model = createTurnModel({ ...scene.base, ...v.cfg });
      t = mod(t, model.duration);
      setSeg(varSeg, i);
      stage.classList.toggle('wrong', bad);
      // The mistake has no step list: show its name in the chip instead.
      showSteps = !bad || !!v.steps;
      stepList.hidden = !showSteps;
      curStep = -1;
      if (!showSteps) chip.innerHTML = `<b>!</b>${(v.note.match(/<b>(.*?)<\/b>/) || [, 'Fehlerbild'])[1].replace(/\.$/, '')}`;
      note.innerHTML = v.note || '';
      note.hidden = !v.note;
      if (v.note && !reduced) note.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
      buildView();
    };
    varSeg.append(b);
  });
  setSeg(varSeg, 0);
  note.hidden = true;

  // Steps
  scene.steps.forEach((s) => {
    const li = h('li', '', `<b>${s.label}</b><span>${s.text}</span>`);
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.onclick = () => {
      const k = Math.floor(t / model.turnTime);
      t = mod((k + s.a + 0.03) * model.turnTime, model.duration);
      setPlaying(false);
      draw();
    };
    li.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        li.onclick();
      }
    };
    stepList.append(li);
  });

  playBtn.onclick = () => setPlaying(!playing);
  bigPlay.onclick = () => setPlaying(true);
  stage.onclick = (e) => {
    if (e.target.closest('.stage-play')) return;
    setPlaying(!playing);
  };
  speedBtn.onclick = () => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]);
  range.oninput = () => {
    t = (range.value / 1000) * model.duration;
    if (t >= model.duration) t = 0;
    draw();
  };

  // Reserve room for the longest step text so the page below does not jump
  // while the active step changes.
  let fitWidth = 0;
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => {
    if (root.clientWidth === fitWidth) return;
    fitWidth = root.clientWidth;
    // Measure in the next frame, outside the observer callback.
    requestAnimationFrame(() => {
      stepList.style.minHeight = '';
      stepList.classList.add('measuring');
      const collapsed = stepList.offsetHeight;
      const longest = Math.max(...[...stepList.querySelectorAll('span')].map((x) => x.scrollHeight));
      stepList.classList.remove('measuring');
      stepList.style.minHeight = `${collapsed + longest + 3}px`;
    });
  }) : null;
  if (ro) ro.observe(root);

  // Stop drawing while the stage is scrolled out of view.
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    loop();
  }) : null;
  if (io) io.observe(stage);

  setSpeed(1);
  buildView();
  setPlaying(playing);

  return {
    el: root,
    destroy() {
      cancelAnimationFrame(raf);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
    },
  };
}
