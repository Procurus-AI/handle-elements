#!/usr/bin/env node
/**
 * API compatibility with 0.4.5 (commit a182a46), spec v2 gate E6.
 *
 * 1. A git worktree of a182a46 lives outside the repo (HE_COMPAT_DIR, default
 *    <os tmpdir>/he-compat-0.4.5) and is kept as a cache. It gets a symlink to this repo's
 *    node_modules and a `tsup --dts-only` build, so dist/index.d.ts is the shipped 0.4.5 API.
 * 2. The TypeScript API lists the old exports of each public entry (`.` and `./format`).
 * 3. A generated .tsx fixture imports `* as Old` (0.4.5 d.ts) and `* as New` (this tree's src)
 *    and asserts, one line per check:
 *      (a) every old named export exists in New;
 *      (b) every old component accepts its old props: `<New.X {...oldProps} />` compiles;
 *      (c) every old exported type is assignable to the new one (generic types are
 *          instantiated with `any`, so for them only the shape is checked).
 * 4. tsc runs on the fixture; errors are mapped back to the check that produced them.
 *
 * Exit 1 on any failure. The worktree is reused on the next run; remove it with
 * `git worktree remove <dir>` after deleting the generated dist/, compat/ and node_modules link.
 *
 * In CI the checkout needs history (`fetch-depth: 0`) so a182a46 resolves.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const OLD_COMMIT = 'a182a46';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const wt = path.resolve(process.env.HE_COMPAT_DIR ?? path.join(os.tmpdir(), 'he-compat-0.4.5'));
const ENTRIES = [
  { name: '.', oldDts: 'dist/index.d.ts', newSrc: 'src/index' },
  { name: './format', oldDts: 'dist/format/index.d.ts', newSrc: 'src/format/index' },
];

const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
const log = (msg) => console.log(`[check-compat] ${msg}`);

// ---- 1. worktree + 0.4.5 declarations ------------------------------------------------
const wantSha = git('rev-parse', `${OLD_COMMIT}^{commit}`);
if (!existsSync(wt)) {
  mkdirSync(path.dirname(wt), { recursive: true });
  log(`adding worktree ${wt} at ${OLD_COMMIT}`);
  git('worktree', 'add', '--detach', wt, OLD_COMMIT);
} else {
  const haveSha = execFileSync('git', ['-C', wt, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (haveSha !== wantSha) {
    console.error(`[check-compat] ${wt} exists but is at ${haveSha}, not ${OLD_COMMIT}. Move it or set HE_COMPAT_DIR.`);
    process.exit(2);
  }
  log(`reusing worktree ${wt}`);
}
const nm = path.join(wt, 'node_modules');
try {
  lstatSync(nm);
} catch {
  symlinkSync(path.join(root, 'node_modules'), nm, 'dir');
}
if (!ENTRIES.every((e) => existsSync(path.join(wt, e.oldDts)))) {
  log('building 0.4.5 declarations (tsup --dts-only)');
  const r = spawnSync(path.join(root, 'node_modules/.bin/tsup'), ['--dts-only'], { cwd: wt, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error('[check-compat] tsup failed in the 0.4.5 worktree');
    process.exit(2);
  }
}

// ---- 2. old exports ------------------------------------------------------------------
const baseOptions = (() => {
  const cfg = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
  return ts.convertCompilerOptionsFromJson(cfg.config.compilerOptions, root).options;
})();

const oldProgram = ts.createProgram(
  ENTRIES.map((e) => path.join(wt, e.oldDts)),
  { ...baseOptions, noEmit: true },
);
const checker = oldProgram.getTypeChecker();

const COMPONENT_TYPE = /ExoticComponent|FunctionComponent|\bFC\b|ComponentType|ComponentClass/;
const ELEMENT_RETURN = /Element|ReactNode|ReactPortal/;

/** @returns {{name:string, value:boolean, component:boolean, type:boolean, typeParams:number}[]} */
const exportsOf = (dtsPath) => {
  const sf = oldProgram.getSourceFile(dtsPath);
  const mod = checker.getSymbolAtLocation(sf);
  return checker.getExportsOfModule(mod).filter((s) => s.name !== 'default').map((s) => {
    const sym = s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
    const value = (sym.flags & ts.SymbolFlags.Value) !== 0;
    const type = (sym.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Enum)) !== 0;
    let component = false;
    if (value && /^[A-Z]/.test(s.name)) {
      const t = checker.getTypeOfSymbol(sym);
      const typeName = checker.typeToString(t, undefined, ts.TypeFormatFlags.NoTruncation);
      const returnsElement = t
        .getCallSignatures()
        .some((sig) => ELEMENT_RETURN.test(checker.typeToString(sig.getReturnType())));
      component = COMPONENT_TYPE.test(typeName) || returnsElement;
    }
    let typeParams = 0;
    if (type) {
      const decl = sym.declarations?.find((d) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d));
      // Parameters without a default need an argument.
      typeParams = decl?.typeParameters?.filter((p) => !p.default).length ?? 0;
    }
    return { name: s.name, value, component, type, typeParams };
  });
};

// ---- 3. fixture ----------------------------------------------------------------------
const fixtureDir = path.join(wt, 'compat');
mkdirSync(fixtureDir, { recursive: true });
const lines = [
  '// Generated by scripts/check-compat.mjs. Do not edit.',
  "import type * as React from 'react';",
];
const checks = []; // index = line number (1-based) -> label
const emit = (code, label) => {
  lines.push(code);
  checks[lines.length] = label;
};
const counts = { exports: 0, components: 0, types: 0 };

ENTRIES.forEach((entry, i) => {
  const O = `Old${i}`;
  const N = `New${i}`;
  lines.push(`import * as ${O} from ${JSON.stringify(path.join(wt, entry.oldDts).replace(/\.d\.ts$/, ''))};`);
  lines.push(`import * as ${N} from ${JSON.stringify(path.join(root, entry.newSrc))};`);
});
lines.push('type Assert<T extends U, U> = T;');

ENTRIES.forEach((entry, i) => {
  const O = `Old${i}`;
  const N = `New${i}`;
  const where = (n) => (entry.name === '.' ? n : `${entry.name}:${n}`);
  for (const ex of exportsOf(path.join(wt, entry.oldDts))) {
    counts.exports++;
    const id = `${i}_${ex.name}`;
    if (ex.value) emit(`type _a_${id} = typeof ${N}.${ex.name};`, `(a) export ${where(ex.name)} missing`);
    else emit(`type _a_${id} = ${N}.${ex.name}${ex.typeParams ? `<${Array(ex.typeParams).fill('any').join(', ')}>` : ''};`, `(a) type export ${where(ex.name)} missing`);
    if (ex.component) {
      counts.components++;
      emit(
        `export const _b_${id} = <${N}.${ex.name} {...(null as unknown as React.ComponentProps<typeof ${O}.${ex.name}>)} />;`,
        `(b) <${where(ex.name)}> rejects 0.4.5 props`,
      );
    }
    if (ex.type) {
      counts.types++;
      const args = ex.typeParams ? `<${Array(ex.typeParams).fill('any').join(', ')}>` : '';
      emit(
        `type _c_${id} = Assert<${O}.${ex.name}${args}, ${N}.${ex.name}${args}>;`,
        `(c) type ${where(ex.name)} (0.4.5) not assignable to the new one`,
      );
    }
  }
});

const fixture = path.join(fixtureDir, 'compat.tsx');
writeFileSync(fixture, lines.join('\n') + '\n');
writeFileSync(
  path.join(fixtureDir, 'tsconfig.json'),
  JSON.stringify(
    {
      extends: path.join(root, 'tsconfig.json'),
      compilerOptions: { noEmit: true, noUnusedLocals: false },
      include: [],
      files: ['compat.tsx'],
    },
    null,
    2,
  ),
);

// ---- 4. type-check -------------------------------------------------------------------
log(`checking ${counts.exports} exports, ${counts.components} components, ${counts.types} types`);
const tsc = spawnSync(path.join(root, 'node_modules/.bin/tsc'), ['-p', path.join(fixtureDir, 'tsconfig.json'), '--pretty', 'false'], {
  encoding: 'utf8',
  cwd: fixtureDir,
});
const out = (tsc.stdout ?? '') + (tsc.stderr ?? '');
const failures = new Map(); // label -> [messages]
const other = [];
let last = null; // continuation lines (indented) belong to the previous error
for (const line of out.split('\n').filter(Boolean)) {
  const m = line.match(/^(.*?)\((\d+),\d+\): error (TS\d+: .*)$/);
  if (m && path.resolve(fixtureDir, m[1]) === fixture && checks[Number(m[2])]) {
    const label = checks[Number(m[2])];
    if (!failures.has(label)) failures.set(label, []);
    last = failures.get(label);
    last.push(m[3]);
  } else if (/^\s/.test(line) && last) {
    last.push(line.trim());
  } else {
    other.push(line);
    last = other;
  }
}

// Root-owned waivers: label must match and the messages must name the stated cause.
const waived = [];
const exceptionsFile = path.join(root, 'compat-exceptions.json');
if (existsSync(exceptionsFile)) {
  for (const ex of JSON.parse(readFileSync(exceptionsFile, 'utf8')).exceptions ?? []) {
    const msgs = failures.get(ex.label);
    if (msgs && msgs.join('\n').includes(ex.mustMention)) {
      failures.delete(ex.label);
      waived.push(`${ex.label} — ${ex.reason}`);
    }
  }
}
for (const w of waived) log(`waived: ${w}`);
const onlyWaived = tsc.status !== 0 && !failures.size && !other.length && waived.length;

if (failures.size || other.length || (tsc.status !== 0 && !onlyWaived)) {
  console.error(`[check-compat] ${failures.size} incompatibilit${failures.size === 1 ? 'y' : 'ies'} with 0.4.5:`);
  for (const [label, msgs] of failures) {
    console.error(`  ${label}`);
    for (const msg of msgs) console.error(`      ${msg.length > 400 ? msg.slice(0, 400) + '...' : msg}`);
  }
  if (other.length) {
    console.error('  other tsc errors (fixture or source):');
    for (const l of other) console.error('    ' + l);
  }
  process.exit(1);
}
log(`OK: the current tree is compatible with 0.4.5 (${counts.exports} exports, ${counts.components} components, ${counts.types} types)`);
