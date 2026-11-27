#!/usr/bin/env node
/**
 * Fidelity captures (spec v2 outcome gate O1).
 *
 * Reads scripts/capture-manifest.json and, for each entry and theme, screenshots the story at
 * viewport 1440x900, DPR 2 (the Figma PNGs are @2x), fonts loaded, motion off, into
 * .results/fidelity/<name>-<theme>.png. Component stories are clipped to the rendered content;
 * `fullscreen` entries (pages) are captured as the viewport. When the entry has a Figma PNG
 * ($FIGMA_EXPORT/<figma>), .results/fidelity/<name>-compare.png puts Figma on the left and the
 * light capture on the right, both scaled to the same height (PIL through python3).
 *
 * Missing stories are reported, not fatal; `--strict` makes them (and render errors) fatal.
 * Usage: node scripts/capture.mjs [--build] [--strict]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { openStorybook, root } from './storybook-run.mjs';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const FIGMA_EXPORT = process.env.FIGMA_EXPORT ?? '/home/ec2-user/data/dev/figma-handle-platform-ui-2026-11-27';
const outDir = path.join(root, '.results', 'fidelity');
mkdirSync(outDir, { recursive: true });

const { entries } = JSON.parse(readFileSync(path.join(root, 'scripts', 'capture-manifest.json'), 'utf8'));

// Side by side, same height, labelled; transparent Figma boards are flattened onto a
// grey checkerboard. Run with -E -P (no env vars, no script dir or cwd on
// sys.path) rather than -I, because Pillow lives in the user site-packages here.
const COMPOSE_PY = `
import sys
from PIL import Image, ImageDraw
left_path, right_path, out_path = sys.argv[1:4]
def flat(p):
    # Transparent boards go on a grey checkerboard so light and dark marks both stay visible.
    im = Image.open(p).convert('RGBA')
    bg = Image.new('RGBA', im.size, (190, 190, 190, 255))
    draw = ImageDraw.Draw(bg)
    for y in range(0, im.height, 16):
        for x in range((y // 16) % 2 * 16, im.width, 32):
            draw.rectangle((x, y, x + 15, y + 15), fill=(160, 160, 160, 255))
    return Image.alpha_composite(bg, im).convert('RGB')
left, right = flat(left_path), flat(right_path)
h = min(max(left.height, right.height), 2400)
def fit(im):
    return im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)
left, right = fit(left), fit(right)
pad, head = 40, 56
canvas = Image.new('RGB', (left.width + right.width + pad * 3, h + head + pad), (236, 236, 236))
canvas.paste(left, (pad, head))
canvas.paste(right, (left.width + pad * 2, head))
draw = ImageDraw.Draw(canvas)
draw.text((pad, 20), 'Figma', fill=(20, 20, 20), font_size=24)
draw.text((left.width + pad * 2, 20), 'Storybook', fill=(20, 20, 20), font_size=24)
canvas.save(out_path)
`;

const compose = (figmaPng, storyPng, outPng) => {
  const r = spawnSync('python3', ['-E', '-P', '-c', COMPOSE_PY, figmaPng, storyPng, outPng], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`composite failed: ${(r.stderr || r.stdout).trim().split('\n').pop()}`);
};

const sb = await openStorybook({
  build: args.includes('--build'),
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const known = new Set(sb.stories.map((s) => s.id));
const missing = entries.filter((e) => !known.has(e.story));
const present = entries.filter((e) => known.has(e.story));

const summary = [];
const renderErrors = [];
for (const entry of present) {
  const results = await sb.forEachStory(
    async ({ page, theme }) => {
      const file = path.join(outDir, `${entry.name}-${theme}.png`);
      if (entry.fullscreen) {
        await page.screenshot({ path: file });
        return file;
      }
      // Tight box around what the story paints: text runs plus elements that draw something
      // (fill, border, shadow, replaced content). Full-width layout wrappers do not count.
      const box = await page.evaluate(() => {
        const wrap = document.querySelector('#storybook-root .he-root') ?? document.querySelector('#storybook-root');
        const rects = [];
        const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (n.nodeType === Node.TEXT_NODE) {
            if (!n.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            rects.push(range.getBoundingClientRect());
            continue;
          }
          if (n.closest('svg') && n.tagName.toLowerCase() !== 'svg') continue;
          const cs = getComputedStyle(n);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          const paints =
            /^(svg|img|canvas|video|input|select|textarea|button|hr)$/i.test(n.tagName) ||
            cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
            cs.backgroundImage !== 'none' ||
            cs.boxShadow !== 'none' ||
            ['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(cs['border' + s + 'Width']) > 0);
          if (paints) rects.push(n.getBoundingClientRect());
        }
        const live = rects.filter((r) => r.width && r.height);
        if (!live.length) return null;
        const m = 16;
        const x = Math.max(0, Math.min(...live.map((r) => r.left)) - m);
        const y = Math.max(0, Math.min(...live.map((r) => r.top)) - m);
        return {
          x: x + window.scrollX,
          y: y + window.scrollY,
          width: Math.ceil(Math.max(...live.map((r) => r.right)) + m - x),
          height: Math.ceil(Math.max(...live.map((r) => r.bottom)) + m - y),
        };
      });
      await page.screenshot(box ? { path: file, clip: box, fullPage: true } : { path: file });
      return file;
    },
    { ids: [entry.story], themes: entry.themes ?? ['light'] },
  );
  for (const r of results) if (r.error) renderErrors.push(`${entry.name} ${entry.story} (${r.theme}): ${r.error}`);

  const light = results.find((r) => r.theme === 'light' && r.result);
  let compare = null;
  if (entry.figma && light) {
    const figmaPng = path.join(FIGMA_EXPORT, entry.figma);
    if (!existsSync(figmaPng)) {
      renderErrors.push(`${entry.name}: Figma PNG not found at ${figmaPng}`);
    } else {
      compare = path.join(outDir, `${entry.name}-compare.png`);
      compose(figmaPng, light.result, compare);
    }
  }
  summary.push({
    name: entry.name,
    story: entry.story,
    captures: results.filter((r) => r.result).map((r) => path.relative(root, r.result)),
    compare: compare && path.relative(root, compare),
    figma: entry.figma ?? null,
    note: entry.figmaNote,
  });
}
await sb.close();

writeFileSync(
  path.join(outDir, 'capture.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), figmaExport: FIGMA_EXPORT, captured: summary, missing, renderErrors }, null, 2) + '\n',
);

for (const s of summary) {
  console.log(`captured ${s.name} (${s.story}): ${s.captures.join(', ')}${s.compare ? `; compare ${s.compare}` : ''}${s.note ? `; ${s.note}` : ''}`);
}
for (const m of missing) console.warn(`missing story: ${m.name} -> ${m.story}${m.figma ? '' : ` (${m.figmaNote ?? 'no Figma PNG'})`}`);
for (const e of renderErrors) console.error(`error: ${e}`);
console.log(
  `\n[capture] ${summary.length}/${entries.length} entries captured, ${missing.length} missing story, ${renderErrors.length} error(s). ` +
    'Index: .results/fidelity/capture.json',
);
process.exit(strict && (missing.length || renderErrors.length) ? 1 : 0);
