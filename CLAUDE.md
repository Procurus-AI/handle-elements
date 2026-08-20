# Handle Elements — conventions

Shared design-system package (`@ponchodelosrios98/handle-elements`). Plain global CSS +
design tokens, React 19 peer, zero runtime deps. Source of truth for visuals is the Handle
Brand Book (Sentient / Neue Haas Unica / IBM Plex Mono; Midnight, Borealis Green, neutrals).

## Token rules

- All color/size/font values in component CSS come from `--he-*` tokens defined in
  `src/styles/tokens.css`. Never hardcode hex/rgb/hsl in `src/components/**/*.css` —
  `npm run check:tokens` enforces this (escape hatch: `/* tokens-ok */` on the line).
- Dark theme is keyed on `html[data-theme='dark']` (alias class `.he-theme-dark`).
  Never use `@media (prefers-color-scheme)`.
- `--he-action` surfaces (primary buttons) are non-inverting: dark pill with light text in
  both themes. Don't repurpose `--he-text`/`--he-bg` for filled actions.
- Hover states lift (shadow/lighter surface), never darken.
- Borealis Green (`--he-accent`) is a fill or dark-background accent. Never use it as text
  on light backgrounds (fails contrast); pair fills with `--he-on-accent` (midnight).
- Sandstone maps to faint text only on light backgrounds.

## Component rules

- One directory per component: `Component.tsx` + `Component.css` + `Component.stories.tsx`.
  Register new CSS files in `src/styles/styles.css` and exports in `src/index.ts`.
- Class naming is BEM-lite with the `he-` prefix: `.he-card`, `.he-card--clickable`,
  `.he-stat__label`. Compose with the internal `cx()` helper; always pass through
  `className` last.
- No runtime dependencies. Icons are small inline SVGs, not lucide-react.
- Components extend the native element's props (`ButtonHTMLAttributes`, etc.) and spread rest.

## Build

- `npm run build` = tsup (ESM+CJS+d.ts, `'use client'` banner) + `scripts/build-css.mjs`
  (lightningcss bundles `styles.css`/`tokens.css`/`fonts.css` into `dist/`, copies fonts,
  rewrites font urls `../fonts/` → `./fonts/`).
- Only `dist/` ships (`files` field). Stories and `.storybook/` must never reach the tarball —
  CI asserts this via `npm pack --dry-run`.
- Neue Haas Unica woff2 files are licensed and intentionally absent; the build warns but
  must not fail without them.
