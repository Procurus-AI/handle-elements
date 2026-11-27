# Handle Elements

Handle's single design system: tokens, fonts and React components, organised by Atomic Design
and styled to Kevin's Figma "Handle Platform UI — Foundations". Inter for all UI text, Sentient for
page titles only, IBM Plex Mono for machine identifiers only; Linear-style grays, Borealis
`#E0FEA2` for the primary action (never a status), four status tones, light and dark.

Tokens are generated from the Figma variables (`npm run tokens`); see Storybook
Introduction and Foundations for the rules, the benchmarks behind them (Primer, Carbon,
Atlassian, GOV.UK, Atomic Design) and the deviations from Figma.

Plain global CSS + CSS custom properties (`--he-*`), zero runtime dependencies, React 19 peer.
Works unchanged in Next.js (App Router) and Vite apps, with or without Tailwind.

## Install

The package is published to GitHub Packages. In the consuming repo, add to `.npmrc`:

```
@procurus-ai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

```sh
npm install @procurus-ai/handle-elements
```

Optionally alias to a friendlier name in `package.json`:

```json
"@handle/elements": "npm:@procurus-ai/handle-elements@^0.1.0"
```

## Usage

Import the stylesheets once in the app root (e.g. `app/layout.tsx`):

```tsx
import '@procurus-ai/handle-elements/fonts.css';
import '@procurus-ai/handle-elements/styles.css';
```

Then use components anywhere:

```tsx
import { PageHeader, StatCard, Button, StatusPill } from '@procurus-ai/handle-elements';

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
  `@procurus-ai/handle-elements/tokens.css` and reference `var(--he-*)`.

## Fonts

Inter (variable, OFL), Sentient (Fontshare free license) and IBM Plex Mono (OFL) are vendored with
their licences. The build fails if `fonts.css` points at a missing file.

## Development

```sh
npm install
npm run storybook        # component workbench with light/dark toolbar toggle
npm run build            # dist/: ESM + CJS + d.ts + styles.css/tokens.css/fonts.css + fonts/
npm run typecheck
npm run tokens           # regenerate src/styles/tokens.css from tokens/figma/tokens.json
npm run check:tokens     # no raw colours in component/page CSS; tokens.css not hand-edited
npm run check:levels     # every component in one atomic level; no upward imports
npm run check:compat     # 0.4.5 exports, props and types still compile
npm run check:a11y       # axe on every story, light and dark (needs a local Chromium)
npm run capture          # screenshots of the Figma components next to Kevin's renders
```

## Hosted Storybook

https://handle-elements-storybook-695023505931.us-central1.run.app — sign in with a
usehandle.ai Google account (Cloud Run behind IAP, project `handle-v2-development`).
`.github/workflows/storybook.yml` redeploys it on every push to `main`; the one-time GCP
setup is `deploy/storybook/setup-gcp.sh` (needs `roles/iap.admin` for the access binding).

## Publishing

Bump + tag: `npm version minor && git push --follow-tags`. CI publishes tags matching `v*`
to GitHub Packages.

## Components

Organised by level in Storybook (`src/levels.json` is the source):

- **Atoms:** Icon, Text, Button, Badge, StatusPill, Count, Chip, Input (Textarea, Select, SearchInput), Checkbox, Radio, Switch, Avatar, Logo (Wordmark, Brandmark), Spinner, Skeleton, Meter, Money, DateText, Layout, Tooltip.
- **Molecules:** Tabs, NavItem, Segmented, FilterChip, CarrierChip, Pagination, EmptyState, Field, StatCell (StatStrip), StatCard, StatToggle, CarrierStatusCard, CalendarDay, ChoiceCard, Stepper, Toast, ThemeSwitch, Menu, DescriptionList, List, Toolbar, Section, Sparkline, SegmentBar.
- **Organisms:** Sidebar, PageHeader, Panel, Card, DataTable, Modal, Drawer, Calendar, Composer, EmailComposer, AgentResponse, ReviewField, ReviewWorkspace, InboxList, Feed, Timeline, EvidencePreview and the charts.
- **Templates:** AppShell, ListPage, AgentWorkspace.
- **Pages (Storybook only):** App shell, Validación de pagos, Registros, a Configuración proposal and the earlier examples.

Upgrading from 0.x: see MIGRATION.md.
