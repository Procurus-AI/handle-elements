# Migrating from 0.4.x to 1.0.0

1.0.0 keeps every 0.4.5 export, prop and type (`npm run check:compat`; two waivers in
`compat-exceptions.json`, both from `BadgeTone` gaining values). What changes is the look, a few
defaults, and some DOM details. Most apps upgrade with a version bump and a visual check.

## Steps for handle-v2

1. Bump `@procurus-ai/handle-elements` to `1.0.0` in `web/package.json`.
2. Delete the `--he-font-sans` override in `web/src/app/globals.css`: the package now ships Inter.
3. Review the `.he-switch--checked` dark patch and the Borealis focus-ring override in
   `globals.css`. The class still exists; the patch may now be redundant.
4. Search for exhaustive `switch` statements over `BadgeTone`: it now also has `success`,
   `warning`, `danger` and `idle`.
5. Run the app in light and dark and check the screens listed under "Visual changes".

## Tokens

`src/styles/tokens.css` is generated from Kevin's Figma variables. It has three layers:
primitives (`--he-gray-150`, `--he-success-500`, ...), semantic tokens (`--he-bg-app`,
`--he-text-primary`, `--he-status-success-text`, ...) and the 0.x names.

| 0.x name | 1.0.0 |
|---|---|
| `--he-bg`, `--he-surface`, `--he-surface-2` | `--he-bg-app`, `--he-bg-surface`, `--he-bg-subtle` |
| `--he-text`, `--he-text-dim`, `--he-text-faint` | `--he-text-primary`, `--he-text-secondary`, `--he-text-tertiary` |
| `--he-border`, `--he-border-strong` | `--he-border-default`, `--he-border-strong` |
| `--he-accent`, `--he-on-accent`, `--he-focus` | `--he-accent-default`, `--he-accent-on-accent`, `--he-border-focus` |
| `--he-ok`, `--he-warn`, `--he-error`, `--he-neutral` (+ `-bg`) | `--he-status-{success,warning,danger,idle}-{text,surface}` |
| `--he-series-1..6` | `--he-chart-1..6` |
| `--he-shadow-card`, `--he-shadow-lift` | `--he-elevation-panel`, `--he-elevation-popover` |
| `--he-action*` | unchanged values (midnight pill); v1 `Button` uses `--he-accent-*` |
| `--he-space-1..7`, `--he-radius-*`, `--he-display-1` ... `--he-micro` | unchanged values; v1 scales are `--he-spacing-*`, `--he-corner-*`, `--he-type-*` |

The 0.x names stay defined in both themes for the 1.x line and are deprecated. New CSS should use
the semantic names only.

## Fonts

Neue Haas Unica is gone (its files were never shipped). Inter is the UI face, Sentient is for page
titles only, IBM Plex Mono is for machine identifiers only. Components that used Sentient or
uppercase mono for headings, eyebrows or captions now use Inter type styles.

## Visual changes

- Canvas is Linear-style cool gray instead of warm off-white; dark mode uses the Figma navy scale.
- `Button` default/primary is Borealis with midnight text; `outline` looks like Kevin's secondary.
- Status colours follow Figma, with five contrast adjustments documented on the
  Foundations › Deviations page.
- `Tabs` `underline` and `pills` both render the soft-fill style. `Segmented` ignores its tone
  props and hugs its content unless `block` is set.
- `Card` and flat panels lose their shadow (only panel, popover and modal elevations exist);
  clickable cards show a stronger border on hover.
- `PageHeader` has no bottom divider by default (`divider` still works) and a new `tabs` slot.
- `Sidebar` is 208px wide by default and its items render like `NavItem`.
- `DataTable` row actions are always visible; the empty state replaces the whole table.
- `Money` uses Inter with tabular figures instead of Plex Mono.
- `Modal` shows a close button in the header.

## Defaults and DOM details

- Default strings in `Pagination`, `DataTable`, `Modal`, `Toast` and `Calendar` are Spanish.
  Every one stays overridable through the component's `labels` or label props.
- `Pagination` prev/next are text buttons; `.he-pagination__arrow` is gone.
- `Calendar` renders `role="grid"` rows and cells; `.he-cal__grid > .he-calendar-day` became
  `.he-cal__cell > .he-calendar-day`.
- `Meter`, `RadialGauge`, `Sparkline`, charts and `Avatar` gained accessible names.
- Kept on purpose for handle-v2's CSS: `.he-switch--checked`, `.he-pill--neutral`,
  `.he-pill--soft`, `.he-sidebar-item`, `.he-sidebar-item--active`.

## Removed

Nothing. Heatmap, Histogram, RadialGauge and Treemap are not imported by handle-v2 today; they
stay in 1.x and may be removed in 2.0.
