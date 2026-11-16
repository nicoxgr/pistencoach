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
  // One loop moves the world by (loopX, loopY). The tile repeats with exactly
  // that period, so the loop wraps without a visible jump.
  const follow = model.follow;
  const end = model.state(model.duration - 1e-6);
  const T = follow ? Math.max(40, Math.abs(end.y)) : model.len * model.turns;
  const TW = follow ? Math.max(40, Math.abs(end.x)) : W;
  const tileWrap = el('g', {}, svg);
  const tile = el('g', { id: uid('tile') }, defs);
  const r = rng(7);
  const nSpecks = follow ? Math.max(5, Math.round((TW * T) / 2600)) : 46;
  for (let i = 0; i < nSpecks; i++) {
    const rx = 2 + r() * 6;
    el('ellipse', { cx: f(follow ? r() * TW : 30 + r() * (W - 60)), cy: f(r() * T), rx: f(rx), ry: f(rx * 0.45), fill: C.snowShade, opacity: 0.55 }, tile);
  }
  const marker = PISTE[model.piste] || PISTE.blue;
  for (let i = 0; i < (follow ? 0 : 3); i++) {
    const y = (i * T) / 3 + 40;
    for (const x of [26, W - 26]) {
      el('ellipse', { cx: x + 3, cy: y + 3, rx: 5, ry: 3, fill: '#000', opacity: 0.12 }, tile);
      el('circle', { cx: x, cy: y, r: 4.2, fill: marker }, tile);
    }
  }
  for (let i = 0; i < (follow ? 0 : 9); i++) {
    const y = r() * T;
    for (const x of [r() * 8 - 6, W - r() * 8 + 6]) {
      const rad = 13 + r() * 7;
      el('circle', { cx: f(x + 3), cy: f(y + 4), r: f(rad), fill: '#000', opacity: 0.1 }, tile);
      el('circle', { cx: f(x), cy: f(y), r: f(rad), fill: C.treeDark }, tile);
      el('circle', { cx: f(x - 3), cy: f(y - 3), r: f(rad * 0.55), fill: C.treeLight }, tile);
    }
  }
  const nx = follow ? Math.ceil(W / TW) + 2 : 1;
  const ny = Math.ceil(H / T) + 2;
  const tileUses = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) tileUses.push({ i, j, n: el('use', { href: `#${tile.id}` }, tileWrap) });
  const bumps = el('g', {}, svg);

  // Fall line hint
  const hint = el('g', { transform: `translate(${W - 92} ${H - 46})`, opacity: 0.75 }, svg);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 26, stroke: C.text, 'stroke-width': 2, 'stroke-linecap': 'round' }, hint);
  el('path', { d: 'M-5 20 L0 28 L5 20', fill: 'none', stroke: C.text, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, hint);
  el('text', { x: 10, y: 12, 'font-size': 13, fill: C.text, 'font-weight': 800 }, hint).textContent = 'Tal';
  el('text', { x: 10, y: 26, 'font-size': 11, fill: C.text, 'font-weight': 600 }, hint).textContent = 'Falllinie';

  const ahead = el('polyline', { fill: 'none', stroke: C.ahead, 'stroke-width': 2, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round', opacity: 0.7 }, svg);
  const band = [0, 1].map(() => el('polyline', { fill: 'none', stroke: C.trailBand, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.8 }, svg));
  // Smeared track of an inside ski that lies flat instead of holding an edge
  const smear = el('path', { fill: 'none', stroke: C.trailBand, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.85 }, svg);
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

  let camX = 0; // camera offset across the hill, set per frame

  function skiPositions(st) {
    const off = st.width / 2 + Math.abs(st.splay) * SKI_L * 0.32;
    const n = right(st.heading);
    const c = [CX + st.x - camX, st.y];
    return [add(c, n, -off), add(c, n, off)]; // [left, right]
  }

  function render(st) {
    const y0 = st.y;
    camX = follow ? st.x : 0;
    const sy = (y) => CY + (y - y0);
    const ty = CY - mod(y0, T) - T * Math.ceil(CY / T);
    const tx = follow ? CX - mod(camX, TW) - TW * Math.ceil(CX / TW) : 0;
    tileUses.forEach((u) => set(u.n, { x: f(tx + u.i * TW), y: f(ty + u.j * T) }));

    // Moguls as soft shapes where each turn changes edges
    if (model.bumps) {
      bumps.replaceChildren();
      for (let kk = st.k - 3; kk <= st.k + 3; kk++) {
        const b = model.state((kk + model.cross) * model.turnTime);
        el('ellipse', { cx: f(CX + b.x * 0.5), cy: f(sy(b.y) + 5), rx: 40, ry: 24, fill: C.snowShade, opacity: 0.55 }, bumps);
        el('ellipse', { cx: f(CX + b.x * 0.5), cy: f(sy(b.y)), rx: 36, ry: 20, fill: C.snowTop }, bumps);
      }
    }

    // Trail and upcoming line
    const L = [];
    const R = [];
    const inner = []; // per sample: which ski was inside (0 = left, 1 = right)
    for (let t = st.t - trailTime; t <= st.t + 1e-6; t += STEP) {
      const s = model.state(t);
      const [pl, pr] = skiPositions(s);
      L.push([pl[0], sy(pl[1])]);
      R.push([pr[0], sy(pr[1])]);
      inner.push(s.sign > 0 ? 1 : 0);
    }
    const [cl, cr] = skiPositions(st);
    L.push([cl[0], sy(cl[1])]);
    R.push([cr[0], sy(cr[1])]);
    inner.push(st.sign > 0 ? 1 : 0);
    const bw = model.slip ? SKI_L * 0.9 : 3 + clamp(model.trailSkid ?? 0.4) * 12;
    band.forEach((b, i) => set(b, { points: pts(i ? R : L), 'stroke-width': f(bw) }));
    line.forEach((b, i) => set(b, { points: pts(i ? R : L) }));

    // Only the stretches where a ski was the inside ski are smeared.
    if (model.innerSmear) {
      let d = '';
      let open = -1;
      inner.forEach((side, j) => {
        const p = (side ? R : L)[j];
        d += `${open === side ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`;
        open = side;
      });
      set(smear, { d, 'stroke-width': f(4 + model.innerSmear * 12) });
    }

    const A = [];
    for (let t = st.t; t <= st.t + aheadTime; t += STEP) {
      const s = model.state(t);
      A.push([CX + s.x - camX, sy(s.y)]);
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
    const center = [CX + st.x - camX, CY];
    const body = add(center, n, st.lean * 22);
    set(shadow, { cx: f(body[0] + 4), cy: f(body[1] + 5) });
    const z = 1.25; // draw the skier a bit larger than the track scale
    set(skier, { transform: `translate(${f(center[0] * (1 - z))} ${f(center[1] * (1 - z))}) scale(${z})` });
    const [pl, pr] = skiPositions(st);
    const press = [st.pL, st.pR];
    [pl, pr].forEach((p, i) => {
      const side = i === 0 ? -1 : 1;
      const a = st.skiHeading - side * (st.splay + (i === 0 ? st.yawL : st.yawR)); // tips point inwards in a snowplough
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
    const c = add([CX + st.x - camX, st.y], n, st.lean * 22);
    const tf = fwd(st.torso);
    const tn = right(st.torso);
    const rest = add(add(c, tn, side * 27), tf, -16);
    const plantAmt = st.pole.side === side ? st.pole.amt : 0;
    if (plantAmt <= 0) return rest;
    const sf = fwd(st.skiHeading);
    const sn = right(st.skiHeading);
    const plant = add(add([CX + st.x - camX, st.y], sf, 34), sn, side * 24);
    return [rest[0] + (plant[0] - rest[0]) * plantAmt, rest[1] + (plant[1] - rest[1]) * plantAmt];
  }

  return { svg, render };
}
