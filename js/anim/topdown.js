// Top view: slope seen from above, camera follows the skier downhill.
// Shows the track, ski position (snowplough vs. parallel), pressure per ski,
// engaged edges, upper body orientation and pole plants.

import { el, set, uid, f, deg, pts, mix } from './svg.js';
import { clamp, mod } from './curves.js';
import { C, PISTE } from './palette.js';

const W = 360;
const H = 440;
const CX = 180;
const CY = 270;
const SKI_L = 62;
const SKI_W = 8;

function rng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Frame helper: forward unit vector and skier's right (n) for a heading.
const fwd = (a) => [Math.cos(a), Math.sin(a)];
const right = (a) => [-Math.sin(a), Math.cos(a)];
const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];

export function createTopView(model) {
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'scene', role: 'img', 'aria-label': 'Ansicht von oben' });
  const defs = el('defs', {}, svg);
  const gid = uid('snow');
  const grad = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': C.snowTop }, grad);
  el('stop', { offset: 1, 'stop-color': C.snowBottom }, grad);
  el('rect', { width: W, height: H, fill: `url(#${gid})` }, svg);

  // Repeating world tile (one loop long) so the loop wraps seamlessly.
  const T = model.len * model.turns;
  const tileWrap = el('g', {}, svg);
  const tile = el('g', { id: uid('tile') }, defs);
  const r = rng(7);
  for (let i = 0; i < 46; i++) {
    const rx = 2 + r() * 6;
    el('ellipse', { cx: f(30 + r() * (W - 60)), cy: f(r() * T), rx: f(rx), ry: f(rx * 0.45), fill: C.snowShade, opacity: 0.55 }, tile);
  }
  const marker = PISTE[model.piste] || PISTE.blue;
  for (let i = 0; i < 3; i++) {
    const y = (i * T) / 3 + 40;
    for (const x of [26, W - 26]) {
      el('ellipse', { cx: x + 3, cy: y + 3, rx: 5, ry: 3, fill: '#000', opacity: 0.12 }, tile);
      el('circle', { cx: x, cy: y, r: 4.2, fill: marker }, tile);
    }
  }
  for (let i = 0; i < 9; i++) {
    const y = r() * T;
    for (const x of [r() * 8 - 6, W - r() * 8 + 6]) {
      const rad = 13 + r() * 7;
      el('circle', { cx: f(x + 3), cy: f(y + 4), r: f(rad), fill: '#000', opacity: 0.1 }, tile);
      el('circle', { cx: f(x), cy: f(y), r: f(rad), fill: C.treeDark }, tile);
      el('circle', { cx: f(x - 3), cy: f(y - 3), r: f(rad * 0.55), fill: C.treeLight }, tile);
    }
  }
  const tileUses = [-1, 0, 1].map((j) => el('use', { href: `#${tile.id}`, y: j * T }, tileWrap));

  // Fall line hint
  const hint = el('g', { transform: `translate(${W - 74} ${H - 44})`, opacity: 0.75 }, svg);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 26, stroke: C.text, 'stroke-width': 2, 'stroke-linecap': 'round' }, hint);
  el('path', { d: 'M-5 20 L0 28 L5 20', fill: 'none', stroke: C.text, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, hint);
  el('text', { x: 10, y: 18, 'font-size': 12, fill: C.text, 'font-weight': 600 }, hint).textContent = 'Falllinie';

  const ahead = el('polyline', { fill: 'none', stroke: C.ahead, 'stroke-width': 2, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round', opacity: 0.7 }, svg);
  const band = [0, 1].map(() => el('polyline', { fill: 'none', stroke: C.trailBand, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.8 }, svg));
  const line = [0, 1].map(() => el('polyline', { fill: 'none', stroke: C.trailLine, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg));
  const marks = el('g', {}, svg);

  // Skier
  const skier = el('g', {}, svg);
  const shadow = el('ellipse', { rx: 26, ry: 18, fill: '#000', opacity: 0.08 }, skier);
  const skis = [0, 1].map(() => {
    const g = el('g', {}, skier);
    const body = el('path', {
      d: `M${-SKI_L / 2},${-SKI_W / 2 + 0.4} L${SKI_L / 2 - 8},${-SKI_W / 2} Q${SKI_L / 2},${-SKI_W / 2} ${SKI_L / 2 + 1.5},0 Q${SKI_L / 2},${SKI_W / 2} ${SKI_L / 2 - 8},${SKI_W / 2} L${-SKI_L / 2},${SKI_W / 2 - 0.4} Q${-SKI_L / 2 - 1.5},0 ${-SKI_L / 2},${-SKI_W / 2 + 0.4}Z`,
      stroke: C.skiOutline, 'stroke-width': 1.2,
    }, g);
    const edge = el('line', { x1: -SKI_L / 2 + 3, x2: SKI_L / 2 - 4, stroke: C.edge, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
    el('rect', { x: -7, y: -4.5, width: 15, height: 9, rx: 2.5, fill: C.helmet }, g);
    return { g, body, edge };
  });
  const poles = [0, 1].map(() => el('line', { stroke: C.pole, 'stroke-width': 2, 'stroke-linecap': 'round' }, skier));
  const poleTips = [0, 1].map(() => el('circle', { r: 2.4, fill: C.pole }, skier));
  const arms = [0, 1].map(() => el('line', { stroke: C.jacketDark, 'stroke-width': 5.5, 'stroke-linecap': 'round' }, skier));
  const hips = el('ellipse', { rx: 7, ry: 12, fill: C.pants }, skier);
  const torsoG = el('g', {}, skier);
  el('ellipse', { rx: 8.5, ry: 18, fill: C.jacket }, torsoG);
  el('ellipse', { cx: -1, rx: 5, ry: 13, fill: C.jacketDark, opacity: 0.35 }, torsoG);
  el('circle', { r: 8.5, fill: C.helmet }, torsoG);
  el('path', { d: 'M5.5,-6 Q10,0 5.5,6', fill: 'none', stroke: C.goggles, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, torsoG);

  const trailTime = model.turnTime * 1.35;
  const aheadTime = model.turnTime * 1.1;
  const STEP = model.turnTime / 36;

  function skiPositions(st) {
    const off = st.width / 2 + Math.abs(st.splay) * SKI_L * 0.32;
    const n = right(st.heading);
    const c = [CX + st.x, st.y];
    return [add(c, n, -off), add(c, n, off)]; // [left, right]
  }

  function render(st) {
    const y0 = st.y;
    const sy = (y) => CY + (y - y0);
    const ty = CY - mod(y0, T);
    tileUses.forEach((u, i) => set(u, { y: f(ty + (i - 1) * T) }));

    // Trail and upcoming line
    const L = [];
    const R = [];
    for (let t = st.t - trailTime; t <= st.t + 1e-6; t += STEP) {
      const s = model.state(t);
      const [pl, pr] = skiPositions(s);
      L.push([pl[0], sy(pl[1])]);
      R.push([pr[0], sy(pr[1])]);
    }
    const [cl, cr] = skiPositions(st);
    L.push([cl[0], sy(cl[1])]);
    R.push([cr[0], sy(cr[1])]);
    const bw = 3 + clamp(model.trailSkid ?? 0.4) * 12;
    band.forEach((b, i) => set(b, { points: pts(i ? R : L), 'stroke-width': f(bw) }));
    line.forEach((b, i) => set(b, { points: pts(i ? R : L) }));

    const A = [];
    for (let t = st.t; t <= st.t + aheadTime; t += STEP) {
      const s = model.state(t);
      A.push([CX + s.x, sy(s.y)]);
    }
    set(ahead, { points: pts(A) });

    // Pole plant marks in the snow
    marks.replaceChildren();
    if (model.plantV !== null) {
      for (let kk = st.k - 2; kk <= st.k; kk++) {
        const tp = (kk + model.plantV) * model.turnTime;
        if (tp > st.t || tp < st.t - trailTime) continue;
        const s = model.state(tp);
        const tip = poleTipWorld(s, s.pole.side > 0 ? 1 : 0);
        el('circle', { cx: f(tip[0]), cy: f(sy(tip[1])), r: 3.2, fill: 'none', stroke: C.trailLine, 'stroke-width': 1.4 }, marks);
      }
    }

    // Skier
    const n = right(st.heading);
    const center = [CX + st.x, CY];
    const body = add(center, n, st.lean * 22);
    set(shadow, { cx: f(body[0] + 4), cy: f(body[1] + 5) });
    const z = 1.25; // draw the skier a bit larger than the track scale
    set(skier, { transform: `translate(${f(center[0] * (1 - z))} ${f(center[1] * (1 - z))}) scale(${z})` });
    const [pl, pr] = skiPositions(st);
    const press = [st.pL, st.pR];
    [pl, pr].forEach((p, i) => {
      const side = i === 0 ? -1 : 1;
      const a = st.skiHeading - side * st.splay; // tips point inwards in a snowplough
      const sk = skis[i];
      set(sk.g, { transform: `translate(${f(p[0])} ${f(sy(p[1]))}) rotate(${f(deg(a))})` });
      set(sk.body, { fill: mix(C.ski, C.skiPress, clamp((press[i] - 0.35) / 0.5)) });
      const e = i === 0 ? st.edgeL : st.edgeR;
      const yEdge = (e >= 0 ? 1 : -1) * (SKI_W / 2 - 0.6);
      set(sk.edge, { y1: f(yEdge), y2: f(yEdge), opacity: f(clamp((Math.abs(e) - 0.04) / 0.3)) });
    });

    set(hips, { cx: f(body[0]), cy: f(body[1]), transform: `rotate(${f(deg(st.skiHeading))} ${f(body[0])} ${f(body[1])})` });
    set(torsoG, { transform: `translate(${f(body[0])} ${f(body[1])}) rotate(${f(deg(st.torso))})` });

    const tf = fwd(st.torso);
    const tn = right(st.torso);
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const shoulder = add(body, tn, side * 15);
      const hand = add(add(body, tn, side * 21), tf, 15);
      set(arms[i], { x1: f(shoulder[0]), y1: f(shoulder[1]), x2: f(hand[0]), y2: f(hand[1]) });
      const tipW = poleTipWorld(st, i);
      const tip = [tipW[0], sy(tipW[1])];
      set(poles[i], { x1: f(hand[0]), y1: f(hand[1]), x2: f(tip[0]), y2: f(tip[1]) });
      set(poleTips[i], { cx: f(tip[0]), cy: f(tip[1]) });
    }
  }

  // Pole tip in world coordinates. i: 0 = left, 1 = right.
  function poleTipWorld(st, i) {
    const side = i === 0 ? -1 : 1;
    const n = right(st.heading);
    const c = add([CX + st.x, st.y], n, st.lean * 22);
    const tf = fwd(st.torso);
    const tn = right(st.torso);
    const rest = add(add(c, tn, side * 27), tf, -16);
    const plantAmt = st.pole.side === side ? st.pole.amt : 0;
    if (plantAmt <= 0) return rest;
    const sf = fwd(st.skiHeading);
    const sn = right(st.skiHeading);
    const plant = add(add([CX + st.x, st.y], sf, 34), sn, side * 24);
    return [rest[0] + (plant[0] - rest[0]) * plantAmt, rest[1] + (plant[1] - rest[1]) * plantAmt];
  }

  return { svg, render };
}
