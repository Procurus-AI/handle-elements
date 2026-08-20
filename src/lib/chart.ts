/* Shared chart primitives for Handle Elements graph components.
 *
 * Zero-dependency, framework-agnostic math: scales, nice ticks, SVG path
 * builders, polar/arc geometry, and a squarified-treemap layout. Keep this pure
 * (no React, no DOM) so every chart component can share one source of truth.
 *
 * The visual language is Perplexity-restrained: charts draw into a normalized
 * SVG viewBox and let CSS tokens carry all color. Nothing here emits color. */

export interface Point {
  x: number;
  y: number;
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Round a number to at most `digits` decimals, dropping trailing zeros. */
export const round = (value: number, digits = 2): number => {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
};

/** Extent [min, max] of a numeric list, safe on empty input. */
export function extent(values: readonly number[]): [number, number] {
  if (values.length === 0) return [0, 1];
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [0, 1];
  return [lo, hi];
}

/** Largest value in a list, treating empty/non-finite as 0. */
export function maxValue(values: readonly number[]): number {
  let hi = 0;
  for (const v of values) if (Number.isFinite(v) && v > hi) hi = v;
  return hi;
}

export function sum(values: readonly number[]): number {
  let total = 0;
  for (const v of values) if (Number.isFinite(v)) total += v;
  return total;
}

export interface NiceScale {
  /** Rounded lower bound. */
  min: number;
  /** Rounded upper bound. */
  max: number;
  /** Evenly spaced tick values from min to max inclusive. */
  ticks: number[];
  /** Step between ticks. */
  step: number;
}

/**
 * Produce human-friendly axis bounds and ticks covering [min, max].
 * Uses the classic 1/2/5×10ⁿ rounding so gridlines land on readable numbers.
 */
export function niceScale(min: number, max: number, tickCount = 4): NiceScale {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    const span = base === 0 ? 1 : Math.abs(base);
    min = base - span;
    max = base + span;
  }
  if (min > max) [min, max] = [max, min];
  const range = niceNum(max - min, false);
  const step = niceNum(range / Math.max(1, tickCount - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) ticks.push(round(v, 6));
  return { min: niceMin, max: niceMax, ticks, step };
}

function niceNum(range: number, roundIt: boolean): number {
  if (range === 0) return 1;
  const exp = Math.floor(Math.log10(range));
  const frac = range / 10 ** exp;
  let nice: number;
  if (roundIt) {
    if (frac < 1.5) nice = 1;
    else if (frac < 3) nice = 2;
    else if (frac < 7) nice = 5;
    else nice = 10;
  } else {
    if (frac <= 1) nice = 1;
    else if (frac <= 2) nice = 2;
    else if (frac <= 5) nice = 5;
    else nice = 10;
  }
  return nice * 10 ** exp;
}

/** Map a value from [d0,d1] onto [r0,r1]. */
export const scaleLinear =
  (d0: number, d1: number, r0: number, r1: number) =>
  (v: number): number => {
    if (d1 === d0) return (r0 + r1) / 2;
    return r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
  };

/**
 * Convert a series of points to an SVG path. When `smooth` is true, uses a
 * monotone-ish Catmull-Rom → cubic-Bézier conversion so lines curve without
 * overshooting. Returns an empty string for < 2 points.
 */
export function linePath(points: readonly Point[], smooth = false): string {
  const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${r(pts[0].x)},${r(pts[0].y)}`;
  if (!smooth) return 'M' + pts.map((p) => `${r(p.x)},${r(p.y)}`).join('L');

  let d = `M${r(pts[0].x)},${r(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${r(c1x)},${r(c1y)} ${r(c2x)},${r(c2y)} ${r(p2.x)},${r(p2.y)}`;
  }
  return d;
}

/**
 * Closed area path under a line, filled down to `baseline` (in the same y-space
 * as the points, e.g. the chart's zero or bottom edge).
 */
export function areaPath(points: readonly Point[], baseline: number, smooth = false): string {
  const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (pts.length < 2) return '';
  const top = linePath(pts, smooth);
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${top}L${r(last.x)},${r(baseline)}L${r(first.x)},${r(baseline)}Z`;
}

const r = (n: number): number => round(n, 3);

/** Polar → cartesian, angle in degrees measured clockwise from 12 o'clock. */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): Point {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
}

/**
 * SVG arc path along a circle, from `startAngle` to `endAngle` (degrees,
 * clockwise from top). Used for gauges and donut rings.
 */
export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1;
  const sweep = endAngle >= startAngle ? 0 : 1;
  return `M${r(start.x)},${r(start.y)}A${r(radius)},${r(radius)} 0 ${largeArc} ${sweep} ${r(end.x)},${r(end.y)}`;
}

/** Circumference of a circle — handy for stroke-dasharray ring progress. */
export const circumference = (radius: number): number => 2 * Math.PI * radius;

export interface TreemapRect<T> {
  item: T;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Squarified treemap layout (Bruls, Huizing, van Wijk). Packs `items` into the
 * given rectangle so tile area is proportional to value and aspect ratios stay
 * close to 1. Values ≤ 0 are dropped. Returns absolute rects in the input space.
 */
export function squarify<T>(
  items: readonly T[],
  getValue: (item: T) => number,
  width: number,
  height: number,
): TreemapRect<T>[] {
  const nodes = items
    .map((item) => ({ item, value: Math.max(0, getValue(item) || 0) }))
    .filter((n) => n.value > 0)
    .sort((a, b) => b.value - a.value);
  if (nodes.length === 0 || width <= 0 || height <= 0) return [];

  const total = nodes.reduce((acc, n) => acc + n.value, 0);
  const scale = (width * height) / total;
  const scaled = nodes.map((n) => ({ ...n, area: n.value * scale }));

  const out: TreemapRect<T>[] = [];
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;
  let row: typeof scaled = [];
  let i = 0;

  const shortest = () => Math.min(w, h);
  const worst = (candidate: typeof scaled) => {
    const side = shortest();
    const areaSum = candidate.reduce((acc, n) => acc + n.area, 0);
    let max = -Infinity;
    let min = Infinity;
    for (const n of candidate) {
      if (n.area > max) max = n.area;
      if (n.area < min) min = n.area;
    }
    const s2 = side * side;
    const sum2 = areaSum * areaSum;
    return Math.max((s2 * max) / sum2, sum2 / (s2 * min));
  };

  const layoutRow = () => {
    const areaSum = row.reduce((acc, n) => acc + n.area, 0);
    const horizontal = w >= h;
    if (horizontal) {
      const rowW = areaSum / h;
      let oy = y;
      for (const n of row) {
        const rh = n.area / rowW;
        out.push({ item: n.item, value: n.value, x, y: oy, width: rowW, height: rh });
        oy += rh;
      }
      x += rowW;
      w -= rowW;
    } else {
      const rowH = areaSum / w;
      let ox = x;
      for (const n of row) {
        const rw = n.area / rowH;
        out.push({ item: n.item, value: n.value, x: ox, y, width: rw, height: rowH });
        ox += rw;
      }
      y += rowH;
      h -= rowH;
    }
  };

  while (i < scaled.length) {
    const next = scaled[i];
    if (row.length === 0 || worst([...row, next]) <= worst(row)) {
      row.push(next);
      i++;
    } else {
      layoutRow();
      row = [];
    }
  }
  if (row.length) layoutRow();
  return out;
}

/** CSS var reference for categorical series color N (1-based, wraps at 6). */
export const seriesColor = (index: number): string =>
  `var(--he-series-${((index % 6) + 6) % 6 || 6})`;

/** CSS var for heat ramp bucket 0–4 given a 0..1 intensity. */
export const heatColor = (intensity: number): string => {
  const bucket = clamp(Math.ceil(clamp(intensity, 0, 1) * 4), 0, 4);
  return `var(--he-heat-${bucket})`;
};
