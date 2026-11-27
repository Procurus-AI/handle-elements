#!/usr/bin/env node
/**
 * Atomic Design levels, enforced from src/levels.json (spec v2).
 *
 * For every folder in src/components:
 *   - it is listed in levels.json exactly once;
 *   - every *.stories.tsx in it has a meta `title:` that starts with its level
 *     (`Atoms/`, `Molecules/`, `Organisms/`, `Templates/`);
 *   - its component .tsx files (stories excluded: they never ship) import no component
 *     folder from a higher level. Same-level and lower-level imports are fine.
 * Stories under src/pages and src/examples must use `Pages/` titles.
 *
 * A folder listed in levels.json but not present yet is a warning (components are still
 * being built); `--strict` turns it into a failure.
 *
 * Usage: node scripts/check-levels.mjs [--strict]
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const componentsDir = path.join(root, 'src', 'components');
const pageDirs = ['src/pages', 'src/examples'].map((d) => path.join(root, d));
const strict = process.argv.includes('--strict');

const LEVELS = ['atoms', 'molecules', 'organisms', 'templates'];
const titlePrefix = (level) => level[0].toUpperCase() + level.slice(1) + '/';

const problems = [];
const warnings = [];
const rel = (p) => path.relative(root, p);

// ---- levels.json shape and uniqueness -------------------------------------------------
const levels = JSON.parse(readFileSync(path.join(root, 'src', 'levels.json'), 'utf8'));
for (const key of Object.keys(levels)) {
  if (!LEVELS.includes(key)) problems.push(`src/levels.json: unknown level "${key}"`);
}
const levelOf = new Map(); // folder -> level index
const seen = new Map(); // folder -> [levels]
for (const [i, level] of LEVELS.entries()) {
  for (const name of levels[level] ?? []) {
    seen.set(name, [...(seen.get(name) ?? []), level]);
    levelOf.set(name, i);
  }
}
for (const [name, where] of seen) {
  if (where.length > 1) problems.push(`src/levels.json: "${name}" listed ${where.length} times (${where.join(', ')})`);
}

// ---- helpers -------------------------------------------------------------------------
const filesIn = (dir) => {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...filesIn(p));
    else out.push(p);
  }
  return out;
};

/** The CSF meta title: the first `title:` after `const meta` / `export default {`. */
const metaTitle = (source) => {
  const start = source.search(/const\s+meta\b|export\s+default\s*\{/);
  if (start < 0) return null;
  const m = source.slice(start).match(/\btitle:\s*(['"`])([^'"`]+)\1/);
  return m ? m[2] : null;
};

/** Component folder names imported by a file under src/components/<Self>/. */
const importedFolders = (file, source) => {
  const out = [];
  const re = /(?:\bfrom|\bimport)\s*\(?\s*(['"])(\.{1,2}\/[^'"]+)\1/g;
  for (const m of source.matchAll(re)) {
    const target = path.resolve(path.dirname(file), m[2]);
    const r = path.relative(componentsDir, target);
    if (r.startsWith('..') || path.isAbsolute(r)) continue;
    const folder = r.split(path.sep)[0];
    if (folder) out.push({ folder, spec: m[2] });
  }
  return out;
};

const checkTitle = (file, expectedPrefix) => {
  const title = metaTitle(readFileSync(file, 'utf8'));
  if (!title) problems.push(`${rel(file)}: no meta title (expected "${expectedPrefix}...")`);
  else if (!title.startsWith(expectedPrefix)) {
    problems.push(`${rel(file)}: title "${title}" must start with "${expectedPrefix}"`);
  }
};

// ---- component folders ---------------------------------------------------------------
const folders = readdirSync(componentsDir).filter((n) => statSync(path.join(componentsDir, n)).isDirectory());
for (const name of seen.keys()) {
  if (!folders.includes(name)) {
    (strict ? problems : warnings).push(`src/levels.json: "${name}" has no folder in src/components yet`);
  }
}

for (const folder of folders) {
  const dir = path.join(componentsDir, folder);
  const lvl = levelOf.get(folder);
  if (lvl === undefined) {
    problems.push(`src/components/${folder}: not listed in src/levels.json`);
    continue;
  }
  const files = filesIn(dir);
  for (const file of files.filter((f) => f.endsWith('.stories.tsx') || f.endsWith('.stories.ts'))) {
    checkTitle(file, titlePrefix(LEVELS[lvl]));
  }
  for (const file of files.filter((f) => /\.tsx?$/.test(f) && !/\.stories\.tsx?$/.test(f))) {
    for (const { folder: dep, spec } of importedFolders(file, readFileSync(file, 'utf8'))) {
      if (dep === folder) continue;
      const depLvl = levelOf.get(dep);
      if (depLvl === undefined) {
        problems.push(`${rel(file)}: imports '${spec}' (folder ${dep} is not in levels.json)`);
      } else if (depLvl > lvl) {
        problems.push(
          `${rel(file)}: ${LEVELS[lvl]} component imports ${LEVELS[depLvl]} '${spec}' (higher level)`,
        );
      }
    }
  }
}

// ---- pages ---------------------------------------------------------------------------
for (const dir of pageDirs) {
  for (const file of filesIn(dir).filter((f) => /\.stories\.tsx?$/.test(f))) checkTitle(file, 'Pages/');
}

// ---- report --------------------------------------------------------------------------
for (const w of warnings) console.warn('warning: ' + w);
if (problems.length) {
  console.error(`[check-levels] ${problems.length} problem(s):`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(
  `[check-levels] OK: ${folders.length} component folders, ${seen.size} listed` +
    (warnings.length ? `, ${warnings.length} warning(s)` : ''),
);
