#!/usr/bin/env node
/**
 * Token usage rules for component and page CSS (spec v2, "Rules for every worker"):
 *   1. No primitives (`--he-gray-500`, `--he-verde`, ...): components bind to semantic tokens.
 *   2. No deprecated 0.x names (`--he-text-dim`, `--he-focus`, ...), except the few with no
 *      v1 equivalent listed in ALLOWED_LEGACY.
 *   3. Every `var(--he-*)` used anywhere in src resolves: defined in tokens.css, in a CSS
 *      declaration, or as an inline custom property in TSX.
 * Exit 1 with a list of problems.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tokensCss = readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8');

const section = (from, to) => {
  const a = tokensCss.indexOf(from);
  const b = to ? tokensCss.indexOf(to, a) : tokensCss.length;
  if (a < 0 || b < 0) throw new Error(`tokens.css section "${from}" not found; regenerate with npm run tokens`);
  return tokensCss.slice(a, b);
};
const names = (text) => new Set([...text.matchAll(/^\s*(--he-[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
const primitives = names(section('/* ---- 1. primitives', '/* ---- 2. semantic'));
const legacy = names(section('/* ---- 3. legacy', '}'));
// 0.x names with no v1 equivalent yet; documented in MIGRATION.md.
const ALLOWED_LEGACY = new Set(['--he-heat-0', '--he-heat-1', '--he-heat-2', '--he-heat-3', '--he-heat-4', '--he-scrim', '--he-scrim-soft']);

const walk = (dir, re, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, re, out);
    else if (re.test(name)) out.push(p);
  }
  return out;
};
const src = path.join(root, 'src');
const styled = [...walk(path.join(src, 'components'), /\.css$/), ...walk(path.join(src, 'pages'), /\.css$/)];
const allFiles = walk(src, /\.(css|tsx?|mdx)$/);

const defined = new Set(names(tokensCss));
for (const f of allFiles) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/(--he-[a-z0-9-]+)\s*:/g)) defined.add(m[1]); // CSS decl or TSX style key
  for (const m of text.matchAll(/['"`](--he-[a-z0-9-]+)['"`]\s*[:\]]/g)) defined.add(m[1]); // style={{ '--he-x': v }}
  for (const m of text.matchAll(/setProperty\(\s*['"`](--he-[a-z0-9-]+)/g)) defined.add(m[1]);
}

const problems = [];
const lineOf = (text, index) => text.slice(0, index).split('\n').length;
for (const f of styled) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/var\(\s*(--he-[a-z0-9-]+)/g)) {
    const at = `${path.relative(root, f)}:${lineOf(text, m.index)}`;
    if (primitives.has(m[1])) problems.push(`${at}: primitive ${m[1]} (use a semantic token)`);
    else if (legacy.has(m[1]) && !ALLOWED_LEGACY.has(m[1])) problems.push(`${at}: deprecated 0.x token ${m[1]}`);
  }
}
for (const f of allFiles) {
  const text = readFileSync(f, 'utf8');
  // A name ending in "-" is a template prefix (`var(--he-spacing-${n})`); a var with a
  // fallback (`var(--he-sidebar-width, 208px)`) is a consumer hook and needs no definition.
  for (const m of text.matchAll(/var\(\s*(--he-[a-z0-9-]+)\s*(,?)/g)) {
    if (m[1].endsWith('-') || m[2] === ',') continue;
    if (!defined.has(m[1])) problems.push(`${path.relative(root, f)}:${lineOf(text, m.index)}: ${m[1]} is never defined`);
  }
}

if (problems.length) {
  console.error(`[check-token-usage] ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`[check-token-usage] OK: ${styled.length} component/page CSS files use semantic tokens; every var(--he-*) in ${allFiles.length} files resolves`);
