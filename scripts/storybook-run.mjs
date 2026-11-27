/**
 * Shared headless runner for the static Storybook (used by check-a11y.mjs and capture.mjs).
 *
 *   const sb = await openStorybook({ build: process.argv.includes('--build') });
 *   await sb.forEachStory(async ({ page, story, theme }) => { ... }, { themes: ['light', 'dark'] });
 *   await sb.close();
 *
 * - Serves storybook-static/ on a free localhost port (plain node http server). Builds it
 *   first when it is missing or when `build: true`.
 * - Chromium comes from $CHROMIUM_PATH, else the newest headless shell under
 *   ~/.cache/ms-playwright (either chrome-headless-shell-linux64/chrome-headless-shell or
 *   the older chrome-linux/headless_shell layout).
 * - Each story opens at iframe.html?id=<id>&viewMode=story&globals=theme:<theme>, then waits
 *   for #storybook-root content, document.fonts.ready and two animation frames, with
 *   animations and transitions disabled. A story that pins another theme through its own
 *   `globals` is reported as skipped for the requested theme.
 * - At most 4 pages at once (the machine is shared).
 */
import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

export const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const staticDir = path.join(root, 'storybook-static');
const MAX_CONCURRENCY = 4;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

export function findChromium() {
  if (process.env.CHROMIUM_PATH) {
    if (!existsSync(process.env.CHROMIUM_PATH)) throw new Error(`CHROMIUM_PATH does not exist: ${process.env.CHROMIUM_PATH}`);
    return process.env.CHROMIUM_PATH;
  }
  const cache = path.join(os.homedir(), '.cache', 'ms-playwright');
  const candidates = existsSync(cache)
    ? readdirSync(cache)
        .filter((d) => /^chromium_headless_shell-\d+$/.test(d))
        .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
        .flatMap((d) => [
          path.join(cache, d, 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
          path.join(cache, d, 'chrome-linux', 'headless_shell'),
        ])
    : [];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('No Chromium found: set CHROMIUM_PATH or install a playwright headless shell');
  return found;
}

function buildStorybook() {
  console.log('[storybook-run] building storybook-static (npm run build-storybook)');
  const r = spawnSync('npm', ['run', 'build-storybook', '--', '--quiet'], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) throw new Error('build-storybook failed');
}

function serve(dir) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let file = path.join(dir, decodeURIComponent(url.pathname));
    if (!file.startsWith(dir)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const NO_MOTION = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';

/**
 * @param {{ build?: boolean, viewport?: {width:number,height:number}, deviceScaleFactor?: number }} [opts]
 */
export async function openStorybook(opts = {}) {
  if (opts.build || !existsSync(path.join(staticDir, 'index.json'))) buildStorybook();
  const index = JSON.parse(readFileSync(path.join(staticDir, 'index.json'), 'utf8'));
  /** @type {{id:string,title:string,name:string,importPath:string,type:string,tags?:string[]}[]} */
  const stories = Object.values(index.entries).filter((e) => e.type === 'story');

  const server = await serve(staticDir);
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = findChromium();
  const browser = await chromium.launch({ executablePath, args: ['--disable-gpu', '--font-render-hinting=none'] });
  const context = await browser.newContext({
    viewport: opts.viewport ?? { width: 1280, height: 800 },
    deviceScaleFactor: opts.deviceScaleFactor ?? 1,
    reducedMotion: 'reduce',
  });

  /** Open one story and wait until it is settled; returns the theme on <html>. Throws on render errors or timeout. */
  async function openStory(page, id, theme) {
    const url = `${base}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=theme:${theme}`;
    await page.goto(url, { waitUntil: 'load' });
    await page.addStyleTag({ content: NO_MOTION });
    await page.waitForFunction(
      () => {
        const root = document.querySelector('#storybook-root');
        const err = document.querySelector('#error-message');
        const shown = document.body.classList.contains('sb-show-errordisplay');
        if (shown && err) throw new Error('story error: ' + err.textContent);
        return root && root.childElementCount > 0;
      },
      undefined,
      { timeout: 20000 },
    );
    // The theme actually on <html>: a story may pin its own `globals.theme`.
    return page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return document.documentElement.getAttribute('data-theme');
    });
  }

  /**
   * Run fn for every (story, theme) pair, at most 4 pages at once.
   * @param {(ctx:{page:import('playwright-core').Page, story:any, theme:string}) => Promise<any>} fn
   * @param {{ themes?: string[], filter?: (story:any) => boolean, ids?: string[] }} [o]
   * @returns {Promise<{story:any, theme:string, result?:any, error?:string, skipped?:string}[]>}
   */
  async function forEachStory(fn, o = {}) {
    const themes = o.themes ?? ['light'];
    let list = stories;
    if (o.ids) list = o.ids.map((id) => stories.find((s) => s.id === id)).filter(Boolean);
    if (o.filter) list = list.filter(o.filter);
    const jobs = list.flatMap((story) => themes.map((theme) => ({ story, theme })));
    const results = [];
    let next = 0;
    const worker = async () => {
      const page = await context.newPage();
      try {
        while (next < jobs.length) {
          const job = jobs[next++];
          try {
            const actual = await openStory(page, job.story.id, job.theme);
            if (actual !== job.theme) {
              // Story pins another theme; it is covered by that theme's run (or never, if
              // that theme was not requested).
              results.push({ ...job, skipped: `story pins theme ${actual}` });
              continue;
            }
            results.push({ ...job, result: await fn({ page, ...job }) });
          } catch (e) {
            results.push({ ...job, error: String(e?.message ?? e).split('\n')[0] });
          }
        }
      } finally {
        await page.close();
      }
    };
    await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, jobs.length) }, worker));
    return results;
  }

  async function close() {
    await context.close();
    await browser.close();
    await new Promise((r) => server.close(r));
  }

  return { base, stories, forEachStory, openStory, context, close };
}
