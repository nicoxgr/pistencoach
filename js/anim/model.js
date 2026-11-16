// Turn model: maps time to one skier state that every view renders from.
//
// The path is a sine wave down the slope. A "cycle" lasts one turn. Inside a
// cycle the phase v runs from 0 to 1; the edge change happens at v = cross,
// the fall line is crossed at v = cross + 0.5. Scenes shape the movement with
// functions of the phase object { v, sign, next, m }:
//   sign  current turn direction (+1 = turning right, skier's view)
//   next  direction of the turn that starts in this cycle
//   m     turn intensity, 0 at the edge change, 1 in the fall line

import { mod, angDiff } from './curves.js';

const FALL_LINE = Math.PI / 2; // straight down the screen

const defaults = {
  turnTime: 3, // seconds per turn
  turns: 2, // turns per loop
  amp: 95, // lateral swing in top-view px
  len: 210, // downhill distance per turn in top-view px
  cross: 0.12, // phase of the edge change
  leanMax: 0.42, // max body inclination (rad)
  edgeShape: 0.6, // < 1 makes the edge change snappier
  lean: () => 1, // extra lean scale
  splay: () => 0, // snowplough angle per ski (rad)
  width: () => 20, // stance width (top-view px)
  flex: () => 0.4, // 0 = tall, 1 = deep
  outer: () => 0.7, // share of weight on the outside ski
  torso: () => 0.5, // 0 = torso follows skis, 1 = faces fall line
  skid: () => 0.12, // ski angle vs. travel direction (rad)
  pole: () => 0, // pole plant amount 0..1
  fore: () => 0, // fore/aft balance, negative = back seat
  innerEdge: () => 1, // share of the edge angle the inside ski takes (0 = flat on the snow)
  innerYaw: () => 0, // inside ski lagging behind the turn, tip towards the outside ski (rad)
  innerLift: () => 0, // inside ski lifted off the snow, 0..1
  warp: (v) => v, // remaps the phase to path progress (speed changes); warp(0) = 0, warp(1) = 1
  angulation: () => 0.35, // share of lean the upper body takes back
  slope: 14, // slope angle (deg) for the side view
  piste: 'blue',
};

export function createTurnModel(cfg) {
  const c = { ...defaults, ...cfg };
  const duration = c.turnTime * c.turns;

  function state(t) {
    const s = t / c.turnTime;
    const k = Math.floor(s);
    const v = s - k;
    const next = mod(k, 2) === 0 ? 1 : -1;
    const sw = k + c.warp(v); // progress along the path
    const sp = sw - c.cross;
    const sinv = Math.sin(Math.PI * sp);
    const sign = c.side || Math.sign(sinv) || next; // `side` pins the edges to one side (traverse)
    const m = Math.abs(sinv);
    const ph = { v, sign, next, m };

    let x = c.amp * sinv;
    let y = c.len * sw;
    // `traverse` (rad off the fall line) fixes the heading for runs across the hill.
    const heading = c.traverse ? FALL_LINE + (c.side || 1) * c.traverse : Math.atan2(c.len, c.amp * Math.PI * Math.cos(Math.PI * sp));

    if (c.traverse) {
      // Across the hill: move along the heading, or straight down when side slipping.
      const travel = c.slip ? FALL_LINE : heading;
      x = c.len * sw * Math.cos(travel);
      y = c.len * sw * Math.sin(travel);
    }

    const lean = sign * c.leanMax * Math.pow(m, c.edgeShape) * c.lean(ph);
    const splay = c.splay(ph);
    // The inside ski can be edged less than the outside ski, drift and lift.
    const innerRight = sign > 0; // turning right: the right ski is inside
    const ie = c.innerEdge(ph);
    const iy = c.innerYaw(ph) * m;
    const il = c.innerLift(ph) * m;
    const edgeL = lean * (innerRight ? 1 : ie) + splay * 1.1;
    const edgeR = lean * (innerRight ? ie : 1) - splay * 1.1;

    const outer = c.outer(ph);
    const pL = sign > 0 ? outer : 1 - outer; // turning right: left ski is outside

    const q = c.torso(ph);
    const torso = heading + q * angDiff(FALL_LINE, heading);
    const skiHeading = heading + sign * c.skid(ph) * m;
    const upcoming = v < 0.5 ? next : -next;

    return {
      t, s, v, k, x, y, heading, sign, m,
      dist: sw * c.turnTime, // time-like distance, follows speed changes
      lean, splay, edgeL, edgeR,
      yawL: innerRight ? 0 : iy, yawR: innerRight ? iy : 0,
      liftL: innerRight ? 0 : il, liftR: innerRight ? il : 0,
      width: c.width(ph),
      flex: c.flex(ph),
      pL, pR: 1 - pL,
      torso, skiHeading,
      skid: c.skid(ph) * m,
      pole: { amt: c.pole(ph), side: upcoming },
      fore: c.fore(ph),
      angulation: c.angulation(ph),
    };
  }

  // Phase within a cycle where the pole is planted deepest (for snow marks).
  let plantV = null;
  let best = 0.5;
  for (let i = 0; i < 200; i++) {
    const v = i / 200;
    const a = c.pole({ v, sign: 1, next: 1, m: 0 });
    if (a > best) {
      best = a;
      plantV = v;
    }
  }

  return { ...c, duration, state, plantV, follow: !!c.traverse && !c.slip };
}
