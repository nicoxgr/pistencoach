// Rear view: the skier seen from behind, as if you were following them.
// Shows inclination into the turn, edge angle of each ski, knee drive,
// stance (snowplough tips together vs. parallel), height (flex) and pressure.

import { el, set, uid, f, deg, mix } from './svg.js';
import { clamp, mod } from './curves.js';
import { C } from './palette.js';

const W = 360;
const H = 300;
const G = 250; // ground line under the boots
const HORIZON = 112;

const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
const up = (a) => [Math.sin(a), -Math.cos(a)]; // tilted "up" vector, a > 0 tilts right

function limb(parent, color, width) {
  return el('polyline', { fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
}

export function createFrontView(model) {
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'scene', role: 'img', 'aria-label': 'Ansicht von hinten' });
  const defs = el('defs', {}, svg);
  const sky = uid('sky');
  const g1 = el('linearGradient', { id: sky, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#b9d7f0' }, g1);
  el('stop', { offset: 1, 'stop-color': '#e6f1fa' }, g1);
  const snow = uid('snowf');
  const g2 = el('linearGradient', { id: snow, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': C.snowBottom }, g2);
  el('stop', { offset: 1, 'stop-color': C.snowTop }, g2);

  el('rect', { width: W, height: H, fill: `url(#${sky})` }, svg);
  el('path', { d: `M0 ${HORIZON} L40 78 L70 92 L118 52 L150 80 L190 60 L232 88 L270 58 L318 86 L360 70 L360 ${HORIZON + 90} L0 ${HORIZON + 90} Z`, fill: C.mountain }, svg);
  el('path', { d: 'M118 52 L104 64 L112 66 L120 60 L128 66 L136 64 Z M270 58 L258 68 L266 70 L272 64 L280 69 Z M190 60 L180 68 L192 70 L200 66Z', fill: C.mountainSnow }, svg);
  // Everything that stands on the snow lives in `world`. It is sheared so the
  // ground rises towards the hill and drops towards the valley, depending on
  // where the skier is heading. Vertical lines stay vertical.
  const world = el('g', {}, svg);
  el('rect', { x: -300, y: HORIZON, width: W + 600, height: H - HORIZON + 200, fill: `url(#${snow})` }, world);
  el('line', { x1: -300, y1: HORIZON, x2: W + 300, y2: HORIZON, stroke: C.snowShade, 'stroke-width': 2 }, world);

  // Snow specks rushing towards the horizon to suggest speed.
  const specks = [];
  for (let i = 0; i < 18; i++) specks.push(el('ellipse', { fill: C.snowShade }, world));

  const shadow = el('ellipse', { rx: 62, ry: 9, fill: '#000', opacity: 0.1 }, world);
  const fig = el('g', {}, world);
  const skis = [0, 1].map(() => ({
    long: el('path', { stroke: C.skiOutline, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, fig),
    tail: el('rect', { width: 20, height: 6, rx: 2, stroke: C.skiOutline, 'stroke-width': 1.2 }, fig),
    edge: el('line', { stroke: C.edge, 'stroke-width': 3, 'stroke-linecap': 'round' }, fig),
  }));
  const poles = [0, 1].map(() => el('line', { stroke: C.pole, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, fig));
  const puffs = [0, 1].map(() => el('ellipse', { rx: 9, ry: 3, fill: '#fff', stroke: C.trailLine, 'stroke-width': 1 }, fig));
  const boots = [0, 1].map(() => el('rect', { width: 18, height: 20, rx: 4, fill: C.helmet }, fig));
  const legs = [0, 1].map(() => limb(fig, C.pants, 15));
  const pelvis = el('line', { stroke: C.pants, 'stroke-width': 17, 'stroke-linecap': 'round' }, fig);
  const torso = el('path', { fill: C.jacket, stroke: C.jacketDark, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, fig);
  const arms = [0, 1].map(() => limb(fig, C.jacket, 11));
  const gloves = [0, 1].map(() => el('circle', { r: 6, fill: C.helmet }, fig));
  const helmet = el('circle', { r: 13.5, fill: C.helmet }, fig);
  const strap = el('path', { fill: 'none', stroke: C.goggles, 'stroke-width': 4, 'stroke-linecap': 'round' }, fig);

  // Pressure arrows and labels
  const press = [0, 1].map(() => ({
    arrow: el('path', { fill: C.skiPress }, svg),
    label: el('text', { 'font-size': 12, 'font-weight': 700, fill: C.text, 'text-anchor': 'middle' }, svg),
  }));
  const pressTitle = el('text', { x: W / 2, y: H - 6, 'font-size': 11, fill: C.text, opacity: 0.65, 'text-anchor': 'middle' }, svg);
  pressTitle.textContent = 'Druck auf den Ski';

  // Where is the valley? Labels on the high and low side and a small compass.
  const slopeTan = Math.tan(((model.slope || 12) * Math.PI) / 180);
  const sideLabels = [0, 1].map((i) => el('text', { x: i ? W - 10 : 10, 'font-size': 12, 'font-weight': 700, fill: C.text, 'text-anchor': i ? 'end' : 'start' }, svg));
  const compass = el('g', { transform: `translate(${W - 28} ${H - 44})` }, svg);
  el('circle', { r: 16, fill: '#fff', opacity: 0.85 }, compass);
  const needle = el('g', {}, compass);
  el('path', { d: 'M0 -10 L6 4 L0 1 L-6 4 Z', fill: C.text }, needle);
  el('text', { y: 30, 'font-size': 11, 'font-weight': 700, fill: C.text, 'text-anchor': 'middle' }, compass).textContent = 'Tal';

  function render(st) {
    // Specks
    const speed = 0.35;
    specks.forEach((sp, i) => {
      // Side slipping: the snow passes sideways. Otherwise it rushes towards the horizon.
      const phase = model.slip ? ((i * 29) % specks.length) / specks.length : mod(st.dist * speed + i / specks.length, 1);
      const depth = 1 - phase; // 1 = near, 0 = horizon
      const lane = ((i * 37) % 17) / 16 - 0.5;
      const y = HORIZON + (G + 40 - HORIZON) * depth * depth;
      const x = model.slip ? mod(i * 53 + st.dist * 70 * (0.4 + depth), W + 80) - 40 : W / 2 + lane * W * (0.15 + depth * 1.3) - st.x * 0.4 * depth;
      set(sp, { cx: f(x), cy: f(y), rx: f(1 + depth * 7), ry: f(0.5 + depth * 2), opacity: f(0.2 + depth * 0.6) });
    });

    const cx = W / 2 + st.x * 0.22;

    // Cross slope seen from behind: positive k means the valley is on the right.
    const k = clamp(slopeTan * Math.cos(st.heading) * 1.5, -0.5, 0.5);
    set(world, { transform: `matrix(1 ${f(k * 100) / 100} 0 1 0 ${f(-k * cx)})` });
    const vis = clamp((Math.abs(k) - 0.03) / 0.06);
    sideLabels.forEach((t, i) => {
      const x = i ? W - 10 : 10;
      const low = i ? k > 0 : k < 0;
      t.textContent = low ? 'Tal ↓' : '↑ Hang';
      set(t, { y: f(HORIZON + 26 + k * (x - cx)), opacity: f(vis * 0.8) });
    });
    set(needle, { transform: `rotate(${f(deg(Math.PI / 2 - st.heading))})` });
    const w = st.width * 1.35 + Math.abs(st.splay) * 70;
    const hf = 1 - st.flex * 0.32; // projected height factor from behind
    const lean = st.lean;
    const torsoLean = lean * (1 - st.angulation);
    const feet = [[cx - w / 2, G], [cx + w / 2, G]];
    const edges = [st.edgeL, st.edgeR];

    set(shadow, { cx: f(cx), cy: f(G + 6), rx: f(40 + w / 2) });

    // Skis: long trapezoid towards the tip (perspective), tail block, edge line
    feet.forEach((p, i) => {
      const e = edges[i];
      const side = i === 0 ? -1 : 1;
      const sk = skis[i];
      const tipX = p[0] - side * Math.min(Math.abs(st.splay) * 70, w / 2 - 7) + st.lean * 10;
      const tipY = G - 44;
      const hw = 10;
      const dx = Math.cos(e) * hw;
      const dy = Math.sin(e) * hw;
      sk.long.setAttribute('d', `M${f(p[0] - dx)} ${f(G + 4 - dy)} L${f(tipX - 2.5)} ${f(tipY)} Q${f(tipX)} ${f(tipY - 5)} ${f(tipX + 2.5)} ${f(tipY)} L${f(p[0] + dx)} ${f(G + 4 + dy)} Z`);
      const pr = i === 0 ? st.pL : st.pR;
      const fill = mix(C.ski, C.skiPress, clamp((pr - 0.35) / 0.5));
      set(sk.long, { fill });
      set(sk.tail, { x: f(p[0] - 10), y: f(G + 1), fill, transform: `rotate(${f(deg(e))} ${f(p[0])} ${f(G + 4)})` });
      const ex = p[0] + (e >= 0 ? 1 : -1) * Math.cos(e) * 10;
      const ey = G + 4 + (e >= 0 ? 1 : -1) * Math.sin(e) * 10;
      set(sk.edge, { x1: f(ex), y1: f(ey), x2: f(ex + (tipX - p[0]) * 0.9), y2: f(ey - 44 * 0.9), opacity: f(clamp((Math.abs(e) - 0.04) / 0.3)) });
      set(boots[i], { x: f(p[0] - 9), y: f(G - 18), transform: `rotate(${f(deg(e))} ${f(p[0])} ${f(G)})` });
    });

    // Legs: ankle -> knee -> hip, knees pushed into the turn
    const legLen = 94 * hf;
    const feetMid = [cx, G - 14];
    const P = add(feetMid, up(lean), legLen);
    const hipHalf = 15;
    const tiltP = lean * 0.4;
    const hips = [add(P, [Math.cos(tiltP), Math.sin(tiltP)], -hipHalf), add(P, [Math.cos(tiltP), Math.sin(tiltP)], hipHalf)];
    feet.forEach((p, i) => {
      const side = i === 0 ? -1 : 1;
      const ankle = [p[0], G - 14];
      const hip = hips[i];
      const kneeIn = lean * (3 + 9 * st.flex) - side * Math.abs(st.splay) * 26;
      const knee = [(ankle[0] + hip[0]) / 2 + kneeIn, (ankle[1] + hip[1]) / 2 + 2];
      set(legs[i], { points: `${f(ankle[0])},${f(ankle[1])} ${f(knee[0])},${f(knee[1])} ${f(hip[0])},${f(hip[1])}` });
    });
    set(pelvis, { x1: f(hips[0][0]), y1: f(hips[0][1]), x2: f(hips[1][0]), y2: f(hips[1][1]) });

    // Torso and head
    const tu = up(torsoLean);
    const tr = [Math.cos(torsoLean), Math.sin(torsoLean)];
    const S = add(P, tu, 56 * (1 - st.flex * 0.12));
    const sL = add(S, tr, -24);
    const sR = add(S, tr, 24);
    const wL = add(P, tr, -17);
    const wR = add(P, tr, 17);
    torso.setAttribute('d', `M${f(wL[0])} ${f(wL[1])} L${f(sL[0])} ${f(sL[1])} Q${f(S[0] + tu[0] * 8)} ${f(S[1] + tu[1] * 8)} ${f(sR[0])} ${f(sR[1])} L${f(wR[0])} ${f(wR[1])} Z`);
    const head = add(S, tu, 19);
    set(helmet, { cx: f(head[0]), cy: f(head[1]) });
    const g0 = add(head, tr, -14);
    const g2r = add(head, tr, 14);
    const gm = add(head, tu, -2);
    strap.setAttribute('d', `M${f(g0[0])} ${f(g0[1])} Q${f(gm[0])} ${f(gm[1] + 6)} ${f(g2r[0])} ${f(g2r[1])}`);

    // Arms and poles
    [sL, sR].forEach((sh, i) => {
      const side = i === 0 ? -1 : 1;
      const plant = st.pole.side === side ? st.pole.amt : 0;
      const elbow = add(add(sh, tr, side * 10), tu, -26);
      const hand = add(add(sh, tr, side * (22 - plant * 6)), tu, -46 + plant * 10);
      set(arms[i], { points: `${f(sh[0])},${f(sh[1])} ${f(elbow[0])},${f(elbow[1])} ${f(hand[0])},${f(hand[1])}` });
      set(gloves[i], { cx: f(hand[0]), cy: f(hand[1]) });
      const restTip = [hand[0] + side * 26, G + 14];
      const plantTip = [cx + side * (w / 2 + 26), G - 30];
      const tip = [restTip[0] + (plantTip[0] - restTip[0]) * plant, restTip[1] + (plantTip[1] - restTip[1]) * plant];
      set(poles[i], { x1: f(hand[0]), y1: f(hand[1]), x2: f(tip[0]), y2: f(tip[1]) });
      set(puffs[i], { cx: f(plantTip[0]), cy: f(plantTip[1] + 1), opacity: f(clamp((plant - 0.75) * 4)) });
    });

    // Pressure arrows below the skis
    [st.pL, st.pR].forEach((p, i) => {
      const x = Math.round(feet[i][0] + (i === 0 ? -6 : 6));
      const len = 4 + p * 18;
      const y0 = G + 14 + k * (x - cx);
      press[i].arrow.setAttribute('d', `M${x - 3} ${y0} L${x + 3} ${y0} L${x + 3} ${y0 + len} L${x + 7} ${y0 + len} L${x} ${y0 + len + 7} L${x - 7} ${y0 + len} L${x - 3} ${y0 + len} Z`);
      set(press[i].arrow, { opacity: f(0.35 + p * 0.65) });
      set(press[i].label, { x: x + (i === 0 ? -26 : 26), y: f(y0 + 16) });
      press[i].label.textContent = `${Math.round(p * 100)} %`;
    });
  }

  return { svg, render };
}
