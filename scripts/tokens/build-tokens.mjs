#!/usr/bin/env node
/**
 * Generates src/styles/tokens.css from the Figma snapshot in tokens/figma/tokens.json.
 *
 * Source of truth: the variable-bound fills of Kevin's "Handle Platform UI — Foundations"
 * file (primitives_from_fills, semantic_from_fills). The typed labels on that page drift
 * from the live variables; the fills are what the components render with.
 *
 * Three layers, all CSS custom properties:
 *   1. Primitives   --he-gray-150, --he-success-500, --he-verde ...   (raw values)
 *   2. Semantic     --he-bg-app, --he-text-primary, --he-status-success-text ...
 *                   (light in :root, dark under [data-theme='dark'] / .he-theme-dark)
 *   3. Legacy 0.x   --he-bg, --he-text-dim, --he-ok ... re-pointed at layer 2 so handle-v2
 *                   keeps resolving. Scales whose names would collide (radius, spacing,
 *                   type sizes) keep their 0.x values; v1 scales use new names.
 *
 * Accessibility adjustments: a semantic text token that misses WCAG AA (4.5:1) against
 * the surfaces it sits on is moved toward a darker (light mode) or lighter (dark mode)
 * target by the smallest step that passes. Each adjustment is listed in
 * tokens/aa-adjustments.json and shown on the Foundations page for design sign-off.
 *
 * Usage: node scripts/tokens/build-tokens.mjs           write tokens.css + report
 *        node scripts/tokens/build-tokens.mjs --check   exit 1 if tokens.css is stale
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const figma = JSON.parse(readFileSync(resolve(root, 'tokens/figma/tokens.json'), 'utf8'));
const OUT_CSS = resolve(root, 'src/styles/tokens.css');
const OUT_AA = resolve(root, 'tokens/aa-adjustments.json');

// ---------- colour math ----------
const hex = (h) => h.replace('#', '').toUpperCase();
const rgb = (h) => [0, 2, 4].map((i) => parseInt(hex(h).slice(i, i + 2), 16));
const toHex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const lum = (h) => {
  const [r, g, b] = rgb(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const mix = (a, b, t) => toHex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));

// ---------- naming ----------
const FAMILY = { Gray: 'gray', 'Neutral (warm)': 'neutral', Success: 'success', Warning: 'warning', Danger: 'danger' };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const semName = (key) => '--he-' + key.split('/').map(slug).join('-'); // bg/app -> --he-bg-app

// ---------- primitives ----------
const prim = {}; // cssName -> hex
for (const [fam, steps] of Object.entries(figma.primitives_from_fills)) {
  for (const [step, value] of Object.entries(steps)) {
    if (FAMILY[fam]) prim[`--he-${FAMILY[fam]}-${step}`] = value;
    else if (fam === 'Brand') prim[`--he-${slug(step)}`] = value;
    else if (fam === 'Chart base') prim[`--he-chart-base-${step}`] = value;
    else throw new Error(`unknown primitive family ${fam}`);
  }
}
const primByValue = new Map();
for (const [k, v] of Object.entries(prim)) if (!primByValue.has(v)) primByValue.set(v, k);
const refOrLiteral = (value, preferRef) => {
  // Prefer the primitive the designer named, if its value matches; else any primitive with
  // that value; else the literal (Figma variables whose primitive has no swatch).
  if (preferRef) {
    const [fam, step] = preferRef.split('/');
    const name = fam === 'brand' ? `--he-${slug(step)}` : `--he-${fam}-${step}`;
    if (prim[name] === value) return `var(${name})`;
  }
  return primByValue.has(value) ? `var(${primByValue.get(value)})` : value.toLowerCase();
};

// ---------- semantic + AA ----------
const sem = {}; // cssName -> {light, dark, light_ref, dark_ref}
for (const rows of Object.values(figma.semantic_from_fills))
  for (const [key, v] of Object.entries(rows)) sem[semName(key)] = { ...v };

// Text tokens and the surfaces each must read on. Disabled text is exempt (WCAG 1.4.3).
const AA_RULES = [
  { token: '--he-text-tertiary', on: ['--he-bg-surface', '--he-bg-panel'], toward: '--he-text-primary' },
  { token: '--he-text-secondary', on: ['--he-bg-surface', '--he-bg-panel', '--he-bg-app'], toward: '--he-text-primary' },
  ...['success', 'warning', 'danger', 'idle'].map((t) => ({
    token: `--he-status-${t}-text`,
    on: [`--he-status-${t}-surface`, '--he-bg-surface'],
    toward: '--he-text-primary',
  })),
];
const aa = [];
for (const mode of ['light', 'dark']) {
  for (const rule of AA_RULES) {
    const s = sem[rule.token];
    const surfaces = rule.on.map((n) => sem[n][mode]);
    const worst = (c) => Math.min(...surfaces.map((bg) => contrast(c, bg)));
    const original = s[mode];
    if (worst(original) >= 4.5) continue;
    const target = sem[rule.toward][mode];
    let t = 0;
    while (t < 1 && worst(mix(original, target, t)) < 4.5) t += 0.01;
    const adjusted = mix(original, target, t);
    s[mode] = adjusted;
    s[`${mode}_ref`] = null;
    aa.push({
      token: rule.token, mode, figma: original, adjusted,
      before: +worst(original).toFixed(2), after: +worst(adjusted).toFixed(2),
      against: rule.on, step: +t.toFixed(2),
    });
  }
}

// ---------- type, spacing, radius, elevation ----------
const FONT = {
  Sentient: "'Sentient', Georgia, 'Times New Roman', serif",
  Inter: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  'IBM Plex Mono': "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace",
};
const fontVar = { Sentient: 'var(--he-font-display)', Inter: 'var(--he-font-sans)', 'IBM Plex Mono': 'var(--he-font-mono)' };
const typeLines = [];
for (const [name, t] of Object.entries(figma.type)) {
  const k = '--he-type-' + slug(name.replace(/—.*$/, '').replace(/restricted/i, ''));
  typeLines.push(
    `  ${k}-family: ${fontVar[t.fontFamily]};`,
    `  ${k}-size: ${+t.fontSize.toFixed(2)}px;`,
    `  ${k}-line: ${+t.lineHeightPx.toFixed(2)}px;`,
    `  ${k}-weight: ${t.fontWeight};`,
    `  ${k}-tracking: ${+t.letterSpacing.toFixed(2)}px;`,
  );
}
const px = (v) => v.replace(/\s/g, '');
const spacing = Object.entries(figma.spacing).map(([k, v]) => `  --he-spacing-${k}: ${px(v)};`);
const corners = [...Object.entries(figma.radius).map(([k, v]) => `  --he-corner-${k}: ${px(v)};`), '  --he-corner-full: 999px;'];
const shadow = (list, tint) =>
  list.map((e) => {
    const a = e.color.length > 7 ? parseInt(e.color.slice(7, 9), 16) / 255 : 1;
    const c = tint ?? rgb(e.color.slice(0, 7)).join(' ');
    return `${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread}px rgb(${c} / ${(tint ? Math.min(1, a * 3.5) : a).toFixed(2)})`;
  }).join(', ');
const elev = (tint) => Object.entries(figma.effects).map(([k, v]) => `  --he-elevation-${slug(k.split('/').pop())}: ${shadow(v, tint)};`);

// ---------- legacy 0.x aliases (root-owned map) ----------
// Colour roles re-point at semantic tokens. --he-action keeps its 0.x non-inverting
// midnight pill so existing consumer CSS keeps its polarity; v1 Button uses --he-accent-*.
const LEGACY_COMMON = {
  '--he-bg': 'var(--he-bg-app)',
  '--he-surface': 'var(--he-bg-surface)',
  '--he-surface-2': 'var(--he-bg-subtle)',
  '--he-text': 'var(--he-text-primary)',
  '--he-text-dim': 'var(--he-text-secondary)',
  '--he-text-faint': 'var(--he-text-tertiary)',
  '--he-border': 'var(--he-border-default)',
  '--he-accent': 'var(--he-accent-default)',
  '--he-on-accent': 'var(--he-accent-on-accent)',
  '--he-focus': 'var(--he-border-focus)',
  '--he-ok': 'var(--he-status-success-text)',
  '--he-ok-bg': 'var(--he-status-success-surface)',
  '--he-warn': 'var(--he-status-warning-text)',
  '--he-warn-bg': 'var(--he-status-warning-surface)',
  '--he-error': 'var(--he-status-danger-text)',
  '--he-error-bg': 'var(--he-status-danger-surface)',
  '--he-neutral': 'var(--he-status-idle-text)',
  '--he-neutral-bg': 'var(--he-status-idle-surface)',
  '--he-chart-ink': 'var(--he-text-primary)',
  '--he-chart-grid': 'var(--he-border-subtle)',
  '--he-chart-axis': 'var(--he-text-tertiary)',
  '--he-chart-track': 'var(--he-bg-subtle)',
  '--he-chart-accent': 'var(--he-accent-default)',
  '--he-chart-pos': 'var(--he-status-success-solid)',
  '--he-chart-neg': 'var(--he-status-danger-solid)',
  '--he-shadow-card': 'var(--he-elevation-panel)',
  '--he-shadow-lift': 'var(--he-elevation-popover)',
  ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`--he-series-${n}`, `var(--he-chart-${n})`])),
};
// Values that stay exactly as in 0.4.5 (scales whose names v1 does not reuse).
const LEGACY_LIGHT = {
  '--he-white': '#fafafa', '--he-gray-light': '#f2f2f2', '--he-black': '#141414',
  '--he-accent-line': '#6f8f28',
  '--he-action': 'var(--he-midnight)', '--he-action-hover': '#2a2f3d', '--he-on-action': '#fafafa', '--he-action-border': 'transparent',
  '--he-heat-0': 'var(--he-bg-subtle)', '--he-heat-1': '#eef6d6', '--he-heat-2': '#ddefab', '--he-heat-3': '#c3e474', '--he-heat-4': '#a6d047',
  '--he-display-1': '56px', '--he-display-2': '40px', '--he-title': '28px', '--he-heading': '20px', '--he-body': '15px',
  '--he-body-sm': '13px', '--he-caption': '11.5px', '--he-micro': '9px', '--he-tracking-caps': '0.14em',
  '--he-space-1': '4px', '--he-space-2': '8px', '--he-space-3': '12px', '--he-space-4': '16px', '--he-space-5': '24px', '--he-space-6': '32px', '--he-space-7': '48px',
  '--he-radius-xs': '4px', '--he-radius-sm': '8px', '--he-radius-md': '12px', '--he-radius-lg': '16px', '--he-radius-full': '999px',
  '--he-scrim': 'rgb(20 20 20 / 0.45)', '--he-scrim-soft': 'rgb(20 20 20 / 0.34)',
  '--he-transition-fast': '150ms ease', '--he-transition-base': '200ms ease',
};
const LEGACY_DARK = {
  '--he-accent-line': '#a7d24e',
  '--he-action': 'var(--he-midnight)', '--he-action-hover': '#262b38', '--he-on-action': '#fafafa', '--he-action-border': '#2a2f3d',
  '--he-heat-0': 'var(--he-bg-subtle)', '--he-heat-1': '#2f3a24', '--he-heat-2': '#45592f', '--he-heat-3': '#6d8b3a', '--he-heat-4': '#a7d24e',
  '--he-scrim': 'rgb(0 0 0 / 0.62)', '--he-scrim-soft': 'rgb(0 0 0 / 0.5)',
};

// ---------- emit ----------
const semLines = (mode) =>
  Object.entries(sem).map(([k, v]) => `  ${k}: ${refOrLiteral(v[mode], v[`${mode}_ref`])};`);
const chart = (mode) =>
  [1, 2, 3, 4, 5, 6].map((n) =>
    // Chart 1 is midnight; in dark it would vanish on the canvas, so it follows text/primary.
    mode === 'dark' && n === 1 ? `  --he-chart-1: var(--he-text-primary);` : `  --he-chart-${n}: var(--he-chart-base-${n});`,
  );
const block = (obj) => Object.entries(obj).map(([k, v]) => `  ${k}: ${v};`);
const src = figma.source;
const css = `/* GENERATED by scripts/tokens/build-tokens.mjs — do not edit by hand.
 * Source: Figma "${src.file}" (${src.key}), version ${src.version}, modified ${src.lastModified}.
 * Values are the variable-bound fills (live Figma variables). AA adjustments: tokens/aa-adjustments.json.
 *
 * Dark theme follows the attribute model: the app sets data-theme="dark" on <html>
 * (or .he-theme-dark on a subtree). Never key on prefers-color-scheme. A subtree class does
 * not reach portalled surfaces (Menu, Modal, Drawer, Tooltip, Toast), so prefer the attribute.
 */

:root {
  color-scheme: light;

  /* ---- 1. primitives ---- */
${Object.entries(prim).map(([k, v]) => `  ${k}: ${v.toLowerCase()};`).join('\n')}

  /* ---- 2. semantic (light) — components use only these ---- */
${semLines('light').join('\n')}
${chart('light').join('\n')}
  --he-icon-stroke: var(--he-text-secondary);

  /* ---- type ---- */
  --he-font-display: ${FONT.Sentient};
  --he-font-sans: ${FONT.Inter};
  --he-font-mono: ${FONT['IBM Plex Mono']};
${typeLines.join('\n')}

  /* ---- spacing (scale of 4), corners, density ---- */
${spacing.join('\n')}
${corners.join('\n')}
  --he-border-width: 1px;
  --he-row-height: 40px;
  --he-row-header-height: 36px;
  --he-stat-height: 88px;

  /* ---- elevation: nothing else casts a shadow ---- */
${elev().join('\n')}

  /* ---- motion ---- */
  --he-motion-fast: 120ms cubic-bezier(0.2, 0, 0, 1);
  --he-motion-base: 180ms cubic-bezier(0.2, 0, 0, 1);

  /* ---- 3. legacy 0.x names (deprecated; see MIGRATION.md) ---- */
${block(LEGACY_COMMON).join('\n')}
${block(LEGACY_LIGHT).join('\n')}
}

[data-theme='dark'],
.he-theme-dark {
  color-scheme: dark;
${semLines('dark').join('\n')}
${chart('dark').join('\n')}
  --he-icon-stroke: var(--he-text-secondary);
${elev('0 0 0').join('\n')}
${block(LEGACY_DARK).join('\n')}
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --he-motion-fast: 0ms linear;
    --he-motion-base: 0ms linear;
  }
}
`;

const report = JSON.stringify({ rule: 'WCAG 2.1 AA 4.5:1 for text; disabled text exempt', adjustments: aa }, null, 2) + '\n';
if (process.argv.includes('--check')) {
  const stale = readFileSync(OUT_CSS, 'utf8') !== css || readFileSync(OUT_AA, 'utf8') !== report;
  if (stale) {
    console.error('[tokens] src/styles/tokens.css or tokens/aa-adjustments.json is stale or hand-edited. Run: npm run tokens');
    process.exit(1);
  }
  console.log(`[tokens] up to date: ${Object.keys(prim).length} primitives, ${Object.keys(sem).length} semantic x 2 modes, ${aa.length} AA adjustments`);
} else {
  writeFileSync(OUT_CSS, css);
  writeFileSync(OUT_AA, report);
  console.log(`[tokens] wrote tokens.css: ${Object.keys(prim).length} primitives, ${Object.keys(sem).length} semantic x 2 modes, ${aa.length} AA adjustments`);
}
