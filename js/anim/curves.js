// Small math helpers for phase-based animation curves.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (x) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
export const mod = (x, m) => ((x % m) + m) % m;

// Signed shortest difference a - b between two angles (radians).
export const angDiff = (a, b) => mod(a - b + Math.PI, 2 * Math.PI) - Math.PI;

// Piecewise smooth interpolation over a turn phase v in [0, 1].
// pts: [[v, value], ...] sorted, first at 0, last at 1.
export function keys(v, pts) {
  for (let i = 1; i < pts.length; i++) {
    if (v <= pts[i][0]) {
      const [a, va] = pts[i - 1];
      const [b, vb] = pts[i];
      const k = b === a ? 1 : (v - a) / (b - a);
      return lerp(va, vb, smooth(k));
    }
  }
  return pts[pts.length - 1][1];
}

// Cyclic window: 1 inside [a, b] (may wrap past 1), soft edges of width e.
export function win(v, a, b, e = 0.04) {
  const len = mod(b - a, 1) || 1;
  const d = mod(v - a, 1);
  if (d > len) return 0;
  return smooth(d / e) * smooth((len - d) / e);
}
