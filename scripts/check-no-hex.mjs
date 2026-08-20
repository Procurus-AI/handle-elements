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
        if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(line) && !line.includes('tokens-ok')) {
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
