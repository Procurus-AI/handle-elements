# Handle Elements

The shared Handle design system: brand tokens, fonts, and React components, styled to the
[Handle Brand Book](docs) — Sentient for display, Neue Haas Unica for body, IBM Plex Mono for
captions; Midnight `#191D27`, Borealis Green `#E0FEA2`, and the neutral white/gray/sandstone palette.

Plain global CSS + CSS custom properties (`--he-*`), zero runtime dependencies, React 19 peer.
Works unchanged in Next.js (App Router) and Vite apps, with or without Tailwind.

## Install

The package is published to GitHub Packages. In the consuming repo, add to `.npmrc`:

```
@ponchodelosrios98:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_PACKAGES_TOKEN}
```

```sh
npm install @ponchodelosrios98/handle-elements
```

Optionally alias to a friendlier name in `package.json`:

```json
"@handle/elements": "npm:@ponchodelosrios98/handle-elements@^0.1.0"
```

## Usage

Import the stylesheets once in the app root (e.g. `app/layout.tsx`):

```tsx
import '@ponchodelosrios98/handle-elements/fonts.css';
import '@ponchodelosrios98/handle-elements/styles.css';
```

Then use components anywhere:

```tsx
import { PageHeader, StatCard, Button, StatusPill } from '@ponchodelosrios98/handle-elements';

<PageHeader
  eyebrow="Operations"
  title="Renewals"
  lede="Every policy approaching its renewal window."
  aside={<Button size="sm">New renewal</Button>}
/>
```

- **Page surface**: add the `he-root` class to `<body>` (or a wrapper) to get brand
  background, text color, and typography. The library never styles `body` itself.
- **Dark theme**: set `data-theme="dark"` on `<html>` (or `he-theme-dark` on a subtree).
  There is no provider and no JS involved.
- **Tokens only** (e.g. Tailwind apps that just want the palette): import
  `@ponchodelosrios98/handle-elements/tokens.css` and reference `var(--he-*)`.

## Fonts

Sentient (Fontshare free license) and IBM Plex Mono (OFL) are vendored. **Neue Haas Unica is a
licensed Monotype font and is not committed** — see `src/fonts/neue-haas-unica/README.md` for the
exact filenames to drop in. Until then a Helvetica fallback renders.

## Development

```sh
npm install
npm run storybook        # component workbench with light/dark toolbar toggle
npm run build            # dist/: ESM + CJS + d.ts + styles.css/tokens.css/fonts.css + fonts/
npm run typecheck
npm run check:tokens     # forbids raw colors in component CSS
```

## Publishing

Bump + tag: `npm version minor && git push --follow-tags`. CI publishes tags matching `v*`
to GitHub Packages.

## Components

Button · Chip · StatusPill · Card · StatCard · PageHeader — see Storybook for props and
variants. Next up (PR 2): SegmentedControl, FilterToolbar, DataTable, Drawer, Loader/ErrorView.
