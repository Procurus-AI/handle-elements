#!/usr/bin/env node
/**
 * Accessibility gate (spec v2 E7): axe-core on every story, light and dark.
 *
 * - Rules: tags wcag2a, wcag2aa, wcag21a, wcag21aa.
 * - Waivers only from the root-owned a11y-exceptions.json:
 *     { "exceptions": [{ "storyId", "ruleId", "theme"?, "reason" }] }
 * - Fails when a story turns a11y off itself (`a11y: { test: 'off' }`, `disable: true`,
 *   or a `rules: [{ ..., enabled: false }]` override) anywhere under src/.
 * - Writes .results/a11y/report.json and prints a table (story, theme, rule, count).
 *
 * Usage: node scripts/check-a11y.mjs [--build] [--filter <substring of story id>]
 * Exit 1 on any violation not waived, a story that cannot render, or a self-disabled story.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { openStorybook, root } from './storybook-run.mjs';

const args = process.argv.slice(2);
const filterArg = args.includes('--filter') ? args[args.indexOf('--filter') + 1] : null;
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const THEMES = ['light', 'dark'];

// ---- 1. stories that disable a11y themselves -----------------------------------------
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mdx)$/.test(name)) out.push(p);
  }
  return out;
};
const selfDisabled = [];
for (const file of walk(path.join(root, 'src'))) {
  const src = readFileSync(file, 'utf8');
  const patterns = [
    /a11y\s*:\s*\{[\s\S]{0,600}?\btest\s*:\s*['"](off|todo)['"]/,
    /a11y\s*:\s*\{[\s\S]{0,600}?\bdisable\s*:\s*true/,
    /a11y\s*:\s*\{[\s\S]*?\benabled\s*:\s*false/,
    /a11y\s*:\s*\{[\s\S]*?\bdisableOtherRules\b/,
  ];
  for (const re of patterns) {
    const m = src.match(re);
    if (m) selfDisabled.push(`${path.relative(root, file)}:${src.slice(0, m.index).split('\n').length}: ${m[0].split('\n')[0].trim()}`);
  }
}

// ---- 2. waivers -----------------------------------------------------------------------
const exceptionsFile = path.join(root, 'a11y-exceptions.json');
const { exceptions = [] } = JSON.parse(readFileSync(exceptionsFile, 'utf8'));
for (const e of exceptions) {
  if (!e.storyId || !e.ruleId || !e.reason) {
    console.error(`[check-a11y] a11y-exceptions.json entry needs storyId, ruleId and reason: ${JSON.stringify(e)}`);
    process.exit(2);
  }
}
const waived = (storyId, ruleId, theme) =>
  exceptions.some((e) => e.storyId === storyId && e.ruleId === ruleId && (!e.theme || e.theme === theme));

// ---- 3. axe on every story ------------------------------------------------------------
const axeSource = readFileSync(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');
const sb = await openStorybook({ build: args.includes('--build') });
const results = await sb.forEachStory(
  async ({ page }) => {
    await page.addScriptTag({ content: axeSource });
    return page.evaluate(async (tags) => {
      // Whole document so portalled overlays (Modal, Drawer, Menu, Toast) are included;
      // Storybook's own chrome is excluded.
      const context = {
        exclude: ['#storybook-docs', '.sb-preparing-story', '.sb-preparing-docs', '.sb-nopreview', '.sb-errordisplay'],
      };
      // addon-a11y runs its own axe pass after each render; wait for it to finish.
      let r;
      for (let attempt = 0; ; attempt++) {
        try {
          // @ts-ignore axe is injected above
          r = await window.axe.run(context, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
          break;
        } catch (e) {
          if (!/already running/.test(String(e)) || attempt > 100) throw e;
          await new Promise((res) => setTimeout(res, 100));
        }
      }
      return r.violations.map((v) => ({
        ruleId: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => ({ target: n.target.join(' '), summary: n.failureSummary })),
      }));
    }, TAGS);
  },
  { themes: THEMES, filter: filterArg ? (s) => s.id.includes(filterArg) : undefined },
);
await sb.close();

function pinsTheme(story, theme) {
  if (!theme || !story.importPath || !story.exportName) return false;
  const src = readFileSync(path.join(root, story.importPath), 'utf8');
  const start = src.search(new RegExp(`export const ${story.exportName}\\b`));
  if (start < 0) return false;
  const next = src.slice(start + 1).search(/\nexport const /);
  const block = next < 0 ? src.slice(start) : src.slice(start, start + 1 + next);
  return new RegExp(`globals\\s*:\\s*\\{[^}]*theme\\s*:\\s*['"]${theme}['"]`).test(block);
}

// ---- 4. report ------------------------------------------------------------------------
const rows = [];
const waivedRows = [];
const renderErrors = [];
const skipped = [];
for (const r of results) {
  if (r.error) {
    renderErrors.push({ storyId: r.story.id, theme: r.theme, error: r.error });
    continue;
  }
  if (r.skipped) {
    // A skip is valid only when the story's own export pins that theme in `globals`;
    // otherwise the story ignored the requested theme, which is a broken decorator or story.
    const pinned = (r.skipped.match(/story pins theme (\w+)/) ?? [])[1];
    if (!pinsTheme(r.story, pinned)) {
      renderErrors.push({ storyId: r.story.id, theme: r.theme, error: `rendered ${pinned} without pinning it in globals` });
      continue;
    }
    skipped.push({ storyId: r.story.id, theme: r.theme, reason: r.skipped });
    continue;
  }
  for (const v of r.result) {
    const row = { storyId: r.story.id, theme: r.theme, ruleId: v.ruleId, impact: v.impact, count: v.nodes.length, help: v.help, nodes: v.nodes };
    (waived(row.storyId, row.ruleId, row.theme) ? waivedRows : rows).push(row);
  }
}
rows.sort((a, b) => a.storyId.localeCompare(b.storyId) || a.theme.localeCompare(b.theme) || a.ruleId.localeCompare(b.ruleId));

const scannedIds = new Set(results.filter((r) => r.result).map((r) => r.story.id));
const storiesChecked = scannedIds.size;
// Coverage: every story must be scanned in at least one theme. A skip is only valid when the
// story pins a theme that this run also scanned.
const unscanned = [...new Set(results.map((r) => r.story.id))].filter((id) => !scannedIds.has(id));
const report = {
  generatedAt: new Date().toISOString(),
  tags: TAGS,
  themes: THEMES,
  storiesChecked,
  runs: results.length,
  violations: rows,
  waived: waivedRows,
  renderErrors,
  skipped,
  selfDisabled,
  byRule: Object.fromEntries(
    [...new Set(rows.map((r) => r.ruleId))].map((id) => [id, rows.filter((r) => r.ruleId === id).reduce((n, r) => n + r.count, 0)]),
  ),
};
const outDir = path.join(root, '.results', 'a11y');
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n');

if (rows.length) {
  const w = [Math.max(5, ...rows.map((r) => r.storyId.length)), 5, Math.max(4, ...rows.map((r) => r.ruleId.length))];
  const line = (a, b, c, d) => `  ${a.padEnd(w[0])}  ${b.padEnd(w[1])}  ${c.padEnd(w[2])}  ${d}`;
  console.log(line('story', 'theme', 'rule', 'count'));
  for (const r of rows) console.log(line(r.storyId, r.theme, r.ruleId, String(r.count)));
  console.log('\nBy rule (nodes):');
  for (const [id, n] of Object.entries(report.byRule).sort((a, b) => b[1] - a[1])) console.log(`  ${id}: ${n}`);
}
for (const e of renderErrors) console.error(`render error: ${e.storyId} (${e.theme}): ${e.error}`);
for (const s of selfDisabled) console.error(`story disables a11y itself: ${s}`);
for (const id of unscanned) console.error(`story never scanned in any theme: ${id}`);

const nodes = rows.reduce((n, r) => n + r.count, 0);
console.log(
  `\n[check-a11y] ${storiesChecked} stories x ${THEMES.length} themes: ${rows.length} violation(s) ` +
    `(${nodes} nodes, ${new Set(rows.map((r) => r.storyId)).size} stories), ${waivedRows.length} waived, ` +
    `${renderErrors.length} render error(s), ${skipped.length} skipped (story pins its theme), ${selfDisabled.length} self-disabled, ${unscanned.length} unscanned. Report: .results/a11y/report.json`,
);
process.exit(rows.length || renderErrors.length || selfDisabled.length || unscanned.length || !storiesChecked ? 1 : 0);
