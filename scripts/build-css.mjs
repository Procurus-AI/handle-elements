// Bundles the plain-CSS layer into dist/ alongside the tsup JS output.
//   dist/styles.css  <- src/styles/styles.css with @imports inlined (tokens, base, components)
//   dist/tokens.css  <- standalone token layer for token-only consumers (e.g. Tailwind apps)
//   dist/fonts.css   <- @font-face declarations, urls rewritten to ./fonts/*
//   dist/fonts/**    <- woff2 files copied from src/fonts
import { bundle, transform } from 'lightningcss';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
mkdirSync(dist, { recursive: true });

const targets = { chrome: 111 << 16, safari: (16 << 16) | (4 << 8), firefox: 113 << 16 };

const styles = bundle({
  filename: path.join(src, 'styles', 'styles.css'),
  minify: false,
  targets,
});
writeFileSync(path.join(dist, 'styles.css'), styles.code);

const tokens = transform({
  filename: 'tokens.css',
  code: readFileSync(path.join(src, 'styles', 'tokens.css')),
  minify: false,
  targets,
});
writeFileSync(path.join(dist, 'tokens.css'), tokens.code);

const missingFonts = ['NeueHaasUnica-Regular.woff2', 'NeueHaasUnica-Medium.woff2'].filter(
  (f) => !existsSync(path.join(src, 'fonts', 'neue-haas-unica', f)),
);

// fonts.css is authored with url('../fonts/...') relative to src/styles/;
// in dist it sits next to the fonts/ dir, so rewrite to ./fonts/. Licensed
// Neue Haas files are optional, so drop any @font-face block that points at a
// missing file instead of shipping broken CSS urls.
let fontsCss = readFileSync(path.join(src, 'styles', 'fonts.css'), 'utf8');
for (const file of missingFonts) {
  fontsCss = fontsCss.replace(
    new RegExp(`@font-face\\s*{[^}]*${file.replaceAll('.', '\\.')}[^}]*}\\s*`, 'g'),
    '',
  );
}
fontsCss = fontsCss.replaceAll('../fonts/', './fonts/');
const fonts = transform({ filename: 'fonts.css', code: Buffer.from(fontsCss), minify: false, targets });
writeFileSync(path.join(dist, 'fonts.css'), fonts.code);

cpSync(path.join(src, 'fonts'), path.join(dist, 'fonts'), { recursive: true });

if (missingFonts.length) {
  console.warn(
    `[build-css] Missing licensed font files (fallback stack will render until provided): ${missingFonts.join(', ')}`,
  );
}
console.log('[build-css] wrote dist/styles.css, dist/tokens.css, dist/fonts.css, dist/fonts/');
