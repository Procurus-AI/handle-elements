// Component CSS must use --he-* tokens only — raw colors belong in src/styles/tokens.css.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const componentsDir = path.join(root, 'src', 'components');

const offenders = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.css')) {
      const lines = readFileSync(p, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (line.includes('tokens-ok')) return;
        // Literal color syntaxes. `color-mix()` is allowed only when every one
        // of its operands is a var(--he-*) — that is how component CSS derives
        // a status hairline without introducing a raw value.
        const literal = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|(?:oklch|oklab|lab|lch|color|light-dark)\(/;
        const mix = /color-mix\(/;
        let bad = literal.test(line);
        if (!bad && mix.test(line)) {
          // strip `in <colorspace>` and percentages, then require var(--he-*) operands
          const inner = line.slice(line.indexOf('color-mix(') + 10);
          const operands = inner
            .replace(/in\s+[\w-]+(\s+[\w-]+\s+hue)?\s*,/, '')
            .split(',')
            .map((s2) => s2.replace(/[\d.]+%/g, '').trim())
            .filter(Boolean);
          bad = operands.some((o) => !o.startsWith('var(--he-'));
        }
        if (bad) {
          offenders.push(`${path.relative(root, p)}:${i + 1}: ${line.trim()}`);
        }
      });
    }
  }
};
walk(componentsDir);

if (offenders.length) {
  console.error('Raw color values found in component CSS (use --he-* tokens):');
  for (const o of offenders) console.error('  ' + o);
  process.exit(1);
}
console.log('[check-no-hex] component CSS is token-clean');
