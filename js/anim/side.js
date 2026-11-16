// Side view: the skier in profile on the slope, moving to the right.
// Shows fore/aft balance (centre of mass over the boot or behind it),
// the up and down movement (flex/extension) and the pole plant.

import { el, set, uid, f, deg } from './svg.js';
import { mod } from './curves.js';
import { C } from './palette.js';

const W = 360;
const H = 300;
const X0 = 160; // boot position on screen

const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];

function limb(parent, color, width) {
  return el('polyline', { fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
}

export function createSideView(model) {
  const slope = (model.slope * Math.PI) / 180;
  const groundY = (x) => 236 + (x - X0) * Math.tan(slope);

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'scene', role: 'img', 'aria-label': 'Ansicht von der Seite' });
  const defs = el('defs', {}, svg);
  const sky = uid('skys');
  const g1 = el('linearGradient', { id: sky, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#b9d7f0' }, g1);
  el('stop', { offset: 1, 'stop-color': '#eaf3fb' }, g1);
  el('rect', { width: W, height: H, fill: `url(#${sky})` }, svg);
  el('path', { d: `M0 ${groundY(0) - 70} L60 ${groundY(60) - 110} L120 ${groundY(120) - 80} L200 ${groundY(200) - 135} L280 ${groundY(280) - 90} L360 ${groundY(360) - 120} L360 ${H} L0 ${H} Z`, fill: C.mountain, opacity: 0.7 }, svg);
  el('path', { d: `M0 ${f(groundY(0))} L${W} ${f(groundY(W))} L${W} ${H} L0 ${H} Z`, fill: C.snowTop, stroke: C.snowShade, 'stroke-width': 2 }, svg);

  // Moving snow marks on the slope surface
  const marks = [];
  for (let i = 0; i < 9; i++) marks.push(el('ellipse', { rx: 9, ry: 2, fill: C.snowShade }, svg));

  const label = el('text', { x: W - 12, y: H - 12, 'font-size': 12, fill: C.text, 'font-weight': 600, 'text-anchor': 'end', opacity: 0.75 }, svg);
  label.textContent = `Hang ${model.slope}°  →  talwärts`;

  // Figure is drawn in a local frame where the slope is horizontal (y = 0)
  // and then rotated by the slope angle around the boot.
  const fig = el('g', {}, svg);
  const shadow = el('ellipse', { cx: 6, cy: 1, rx: 46, ry: 3.5, fill: '#000', opacity: 0.12 }, fig);
  const pole = el('line', { stroke: C.pole, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, fig);
  const puff = el('ellipse', { rx: 8, ry: 2.5, fill: '#fff', stroke: C.trailLine, 'stroke-width': 1 }, fig);
  const ski = el('path', { d: 'M-52 -2 L50 -2 Q62 -3 66 -12 L68 -11 Q64 2 50 2 L-52 2 Q-56 0 -52 -2 Z', stroke: C.skiOutline, 'stroke-width': 1.2, fill: C.ski }, fig);
  const boot = el('path', { d: 'M-11 -2 L-11 -26 L6 -26 L9 -14 L16 -8 L16 -2 Z', fill: C.helmet }, fig);
  const legBack = limb(fig, C.pants, 15);
  const torso = limb(fig, C.jacket, 24);
  const arm = limb(fig, C.jacket, 10);
  const glove = el('circle', { r: 5.5, fill: C.helmet }, fig);
  const helmet = el('circle', { r: 13, fill: C.helmet }, fig);
  const goggle = el('rect', { width: 9, height: 7, rx: 2.5, fill: C.goggles }, fig);
  const com = el('circle', { r: 5, stroke: '#fff', 'stroke-width': 2 }, fig);
  const plumb = el('line', { 'stroke-width': 2, 'stroke-dasharray': '3 4' }, fig);
  const plumbDot = el('circle', { r: 3.5 }, fig);

  const balance = el('text', { x: 12, y: H - 12, 'font-size': 12, 'font-weight': 700 }, svg);

  function render(st) {
    const speed = 120;
    marks.forEach((mk, i) => {
      const x = mod(i * 47 - st.t * speed, W + 60) - 30;
      set(mk, { cx: f(x), cy: f(groundY(x) + 6 + (i % 3) * 9), rx: f(6 + (i % 4) * 3), opacity: 0.6 });
    });

    // Joint angles (rad) from flex and fore/aft balance
    const fl = st.flex;
    const fore = st.fore;
    const shin = 0.22 + fl * 0.42 + fore * 0.25; // forward tilt of the shin
    const thigh = 0.2 + fl * 0.75 - fore * 0.25; // backward tilt of the thigh
    const trunk = 0.18 + fl * 0.42 + fore * 0.1; // forward tilt of the torso

    const ankle = [0, -12];
    const knee = add(ankle, [Math.sin(shin), -Math.cos(shin)], 50);
    const hip = add(knee, [-Math.sin(thigh), -Math.cos(thigh)], 52);
    const shoulder = add(hip, [Math.sin(trunk), -Math.cos(trunk)], 58);
    const head = add(shoulder, [Math.sin(trunk * 0.7), -Math.cos(trunk * 0.7)], 20);

    set(legBack, { points: `${f(ankle[0])},${f(ankle[1])} ${f(knee[0])},${f(knee[1])} ${f(hip[0])},${f(hip[1])}` });
    set(torso, { points: `${f(hip[0])},${f(hip[1])} ${f(shoulder[0])},${f(shoulder[1])}` });
    set(helmet, { cx: f(head[0]), cy: f(head[1]) });
    set(goggle, { x: f(head[0] + 6), y: f(head[1] - 3) });

    const plant = st.pole.amt;
    const elbow = add(shoulder, [10 + plant * 6, 24 - plant * 4]);
    const hand = add(shoulder, [26 + plant * 14, 38 - plant * 8]);
    set(arm, { points: `${f(shoulder[0])},${f(shoulder[1])} ${f(elbow[0])},${f(elbow[1])} ${f(hand[0])},${f(hand[1])}` });
    set(glove, { cx: f(hand[0]), cy: f(hand[1]) });
    const restTip = [hand[0] - 34, -8];
    const plantTip = [hand[0] + 22, 0];
    const tip = [restTip[0] + (plantTip[0] - restTip[0]) * plant, restTip[1] + (plantTip[1] - restTip[1]) * plant];
    set(pole, { x1: f(hand[0]), y1: f(hand[1]), x2: f(tip[0]), y2: f(tip[1]) });
    set(puff, { cx: f(plantTip[0]), cy: 1, opacity: f(Math.max(0, (plant - 0.75) * 4)) });

    // Centre of mass and plumb line onto the ski
    const cm = [hip[0] * 0.55 + shoulder[0] * 0.3 + knee[0] * 0.15, hip[1] * 0.55 + shoulder[1] * 0.3 + knee[1] * 0.15];
    const off = cm[0] - 2; // boot centre is near x = 2
    const ok = Math.abs(off) < 9;
    const back = off < -9;
    const col = ok ? C.good : C.bad;
    set(com, { cx: f(cm[0]), cy: f(cm[1]), fill: col });
    set(plumb, { x1: f(cm[0]), y1: f(cm[1] + 6), x2: f(cm[0]), y2: -3, stroke: col });
    set(plumbDot, { cx: f(cm[0]), cy: -3, fill: col });
    balance.textContent = ok ? 'Schwerpunkt über dem Fuß' : back ? 'Rücklage: Schwerpunkt hinten' : 'Zu weit vorne';
    set(balance, { fill: col });

    // Up/down: the whole figure rises slightly when extending
    set(fig, { transform: `translate(${X0} ${f(groundY(X0))}) rotate(${f(deg(slope))}) scale(0.92)` });
    set(shadow, { rx: f(42 + fl * 6) });
    set(ski, { fill: C.ski });
  }

  return { svg, render };
}
