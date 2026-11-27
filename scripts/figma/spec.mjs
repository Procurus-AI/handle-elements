#!/usr/bin/env node
/**
 * Prints a compact build spec for one Figma node from the snapshot export, with colours
 * mapped to v1 semantic token names (light mode).
 *
 *   node scripts/figma/spec.mjs "Button"                 # component set on page 02
 *   node scripts/figma/spec.mjs "App shell — Light"      # top-level frame on any page
 *   node scripts/figma/spec.mjs --list                   # list top-level nodes per page
 *   node scripts/figma/spec.mjs "Button" --depth 3
 *
 * Reads FIGMA_EXPORT (default /home/ec2-user/data/dev/figma-handle-platform-ui-2026-11-27).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const exportDir = process.env.FIGMA_EXPORT ?? '/home/ec2-user/data/dev/figma-handle-platform-ui-2026-11-27';
const file = JSON.parse(readFileSync(resolve(exportDir, 'raw/file-full.json'), 'utf8'));
const tokens = JSON.parse(readFileSync(resolve(root, 'tokens/figma/tokens.json'), 'utf8'));

const hex = (c, o = 1) => {
  const a = (c.a ?? 1) * o;
  const h = '#' + ['r', 'g', 'b'].map((k) => Math.round(c[k] * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  return a < 0.999 ? `${h}@${a.toFixed(2)}` : h;
};
// value -> token name (semantic first, then primitive)
const byValue = new Map();
for (const rows of Object.values(tokens.semantic_from_fills))
  for (const [k, v] of Object.entries(rows)) if (!byValue.has(v.light)) byValue.set(v.light, `--he-${k.replaceAll('/', '-')}`);
const FAM = { Gray: 'gray', 'Neutral (warm)': 'neutral', Success: 'success', Warning: 'warning', Danger: 'danger', Brand: '', 'Chart base': 'chart-base' };
for (const [fam, steps] of Object.entries(tokens.primitives_from_fills))
  for (const [s, v] of Object.entries(steps)) if (!byValue.has(v)) byValue.set(v, `--he-${FAM[fam] ? FAM[fam] + '-' : ''}${s}`);
const tok = (h) => (byValue.has(h.split('@')[0]) ? `${byValue.get(h.split('@')[0])}${h.includes('@') ? '@' + h.split('@')[1] : ''}` : h);

const paints = (list = []) =>
  list.filter((p) => p.visible !== false && p.type === 'SOLID').map((p) => tok(hex(p.color, p.opacity ?? 1)));

function describe(n) {
  const b = n.absoluteBoundingBox ?? {};
  const parts = [`${n.type} "${n.name}" ${Math.round(b.width ?? 0)}x${Math.round(b.height ?? 0)}`];
  if (n.layoutMode && n.layoutMode !== 'NONE') {
    parts.push(`auto-layout ${n.layoutMode.toLowerCase()} gap ${n.itemSpacing ?? 0}`);
    const pad = [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map((x) => x ?? 0);
    if (pad.some(Boolean)) parts.push(`pad ${pad.join('/')}`);
    if (n.primaryAxisAlignItems) parts.push(`main ${n.primaryAxisAlignItems.toLowerCase()}`);
    if (n.counterAxisAlignItems) parts.push(`cross ${n.counterAxisAlignItems.toLowerCase()}`);
  }
  if (n.layoutSizingHorizontal) parts.push(`w:${n.layoutSizingHorizontal.toLowerCase()}`);
  if (n.layoutSizingVertical) parts.push(`h:${n.layoutSizingVertical.toLowerCase()}`);
  const fill = paints(n.fills);
  if (fill.length && n.type !== 'TEXT') parts.push(`fill ${fill.join(',')}`);
  const stroke = paints(n.strokes);
  if (stroke.length) parts.push(`stroke ${stroke.join(',')} ${n.strokeWeight ?? 1}px${n.strokeAlign ? ' ' + n.strokeAlign.toLowerCase() : ''}`);
  if (n.cornerRadius) parts.push(`radius ${n.cornerRadius}`);
  else if (n.rectangleCornerRadii) parts.push(`radii ${n.rectangleCornerRadii.join('/')}`);
  const fx = (n.effects ?? []).filter((e) => e.visible !== false);
  if (fx.length) parts.push(`effects ${fx.map((e) => `${e.type.toLowerCase()} ${e.offset?.x ?? 0},${e.offset?.y ?? 0} r${e.radius} s${e.spread ?? 0}`).join('; ')}`);
  if (n.opacity != null && n.opacity < 1) parts.push(`opacity ${n.opacity}`);
  if (n.type === 'TEXT') {
    const s = n.style ?? {};
    parts.push(`"${(n.characters ?? '').replace(/\n/g, ' / ').slice(0, 80)}"`);
    parts.push(`${s.fontFamily} ${s.fontWeight} ${s.fontSize}/${Math.round(s.lineHeightPx ?? 0)} ls ${(s.letterSpacing ?? 0).toFixed(2)} color ${paints(n.fills).join(',')}${s.textCase && s.textCase !== 'ORIGINAL' ? ' ' + s.textCase.toLowerCase() : ''}`);
  }
  if (n.componentProperties) parts.push(`props ${Object.entries(n.componentProperties).map(([k, v]) => `${k.replace(/#.*/, '')}=${v.value}`).join(', ')}`);
  return parts.join(' | ');
}

function print(n, depth, max, out) {
  out.push('  '.repeat(depth) + describe(n));
  if (depth < max) for (const c of n.children ?? []) if (c.visible !== false) print(c, depth + 1, max, out);
}

const args = process.argv.slice(2);
if (args[0] === '--list') {
  for (const p of file.document.children) {
    console.log(`# ${p.name}`);
    for (const c of p.children ?? []) console.log(`  ${c.type} "${c.name}" (${c.id})`);
  }
  process.exit(0);
}
const name = args[0];
const di = args.indexOf('--depth');
const max = di >= 0 ? Number(args[di + 1]) : 6;
const matches = [];
const walk = (n, page) => {
  if (n.name === name || n.id === name) matches.push({ n, page });
  for (const c of n.children ?? []) if (n.type !== 'INSTANCE') walk(c, page);
};
for (const p of file.document.children) for (const c of p.children ?? []) walk(c, p.name);
if (!matches.length) {
  console.error(`no node named "${name}"; try --list`);
  process.exit(1);
}
const { n, page } = matches[0];
const out = [`# ${page} › ${n.name} (${n.id})${matches.length > 1 ? ` — ${matches.length} nodes share this name, showing the first` : ''}`];
const desc = file.componentSets?.[n.id]?.description || file.components?.[n.id]?.description;
if (desc) out.push(`description: ${desc}`);
print(n, 0, max, out);
console.log(out.join('\n'));
