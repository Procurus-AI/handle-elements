# Migrating from 0.4.x to 1.0.0

1.0.0 keeps every 0.4.5 export, prop, type and function signature (`npm run check:compat`; two
waivers in `compat-exceptions.json`, both from `BadgeTone` gaining values). handle-v2 at
`origin/main` type-checks against 1.0.0 with no new errors. What changes is the look, some default
strings and a few DOM details, listed below.

## Steps for handle-v2

1. Bump `@procurus-ai/handle-elements` to `1.0.0` in `web/package.json`.
2. Delete the `--he-font-sans` override in `web/src/app/globals.css`: the package now ships Inter.
3. Review the three dark-mode patches on `.he-switch--checked`
   (`insurance/reconciliation/page.module.css`, `records/v2/_table/table.module.css`,
   `records/v2/_table/filters/RecordsV2FiltersModal.module.css`). The class still exists; the
   Switch now draws a midnight thumb on the accent track in both themes, so the patches can go.
4. Search for exhaustive `switch` statements over `BadgeTone`: it now also has `success`,
   `warning`, `danger` and `idle`.
5. Kevin's shell is opt-in: `AppShell` / `ListPage`, `<Sidebar flat>` and `<PageHeader inset>`.
   Without them, Sidebar and PageHeader keep their 0.4.5 geometry.
6. Run the app in light and dark and check the screens listed under "Visual changes".

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
| `--he-action*`, `--he-accent-line`, `--he-heat-*`, `--he-scrim*` | unchanged values |
| `--he-space-1..7`, `--he-radius-*`, `--he-display-1` ... `--he-micro` | unchanged values; v1 scales are `--he-spacing-*`, `--he-corner-*`, `--he-type-*` |

The 0.x names stay defined in both themes for the 1.x line and are deprecated. Component CSS in
this package uses semantic tokens only (`npm run check:tokens`). Consumer hooks kept:
`--he-segmented-selected`, `--he-sidebar-width`.

## Fonts

Neue Haas Unica is gone (its files were never shipped). Inter is the UI face, Sentient is for page
titles only, IBM Plex Mono is for machine identifiers only. Components that used Sentient or
uppercase mono for headings, eyebrows, captions or amounts now use Inter type styles.

## Visual changes

- Canvas is Linear-style cool gray instead of warm off-white; dark mode uses the Figma navy scale.
- `Button`: default/primary is Borealis with midnight text; corners are 6px instead of a pill;
  default height is 32px. `outline` looks like Kevin's secondary.
- Status colours follow Figma, with five contrast adjustments documented on the
  Foundations › Deviations page.
- `Tabs` `underline` and `pills` both render the soft-fill style. `Segmented` ignores its tone
  props and hugs its content unless `block` is set.
- `Card` and flat panels lose their shadow (only panel, popover and modal elevations exist);
  clickable cards show a stronger border on hover. Accent rings on Card, List and StatCard use
  `--he-border-strong`.
- `DataTable` row actions are always visible; the empty state replaces the whole table.
- `Money` and calendar panel amounts use Inter with tabular figures instead of Plex Mono.
- `Modal` shows a close button in the header (`hideCloseButton` removes it).
- `Switch` thumbs changed colour for 3:1 contrast against the track.

## Behaviour and DOM details

- `DataTable`: without `rowKey`, selection and expansion keys are the row's index in the original
  `data` array (they were page positions, so a selection moved between records when paging or
  sorting). `rowKey(row, index)` now receives that original index. New `actionsLabel`.
- `Field`: a `RadioGroup` child is named through `aria-labelledby`; a `Checkbox` without its own
  label takes the Field label as its text.
- `ChoiceCardGroup` and `Segmented` skip disabled options when moving focus or cycling.
- `Modal`'s focus trap wraps at the first and last tabbable element.
- `Menu` returns focus to its trigger when the element that held focus at open time is gone.
- `Tooltip` with a Fragment child puts `aria-describedby` on its anchor span.
- `Calendar`: new `labels` prop (`previousMonth`, `nextMonth`, `today`); `todayLabel` still works.
  The day grid now uses `role="grid"` rows and cells, so 0.4.5 overrides on
  `.he-cal__grid > .he-cal__day` and the old marker classes need the new `.he-cal__cell` and
  `.he-calendar-day` classes. Calendar's `accent` marker status still compiles and renders as
  neutral; `CalendarDay` events have no `accent` status (accent is never a status).
- `Badge` emits both class sets: `.he-badge--neutral/ok/warn/error` and
  `.he-badge--idle/success/warning/danger`.
- `Pagination` prev/next are text buttons; `.he-pagination__arrow` is gone. Page buttons are named
  `Página N`; a custom `labels.pageButton` must contain the visible number.
- `Meter`, `RadialGauge`, `Sparkline`, charts and `Avatar` gained accessible names.
- Kept for handle-v2's CSS: `.he-switch--checked`, `.he-pill--neutral`, `.he-pill--soft`,
  `.he-sidebar-item`, `.he-sidebar-item--active`.

## Default strings

Defaults are Spanish in `Pagination`, `DataTable`, `Modal` / `ConfirmDialog` (`Cerrar`,
`Confirmar`, `Cancelar`), `Drawer`, `Toast`, `Calendar`, `SearchInput` (`Buscar…`,
`Limpiar búsqueda`) and `Spinner` (`Cargando`). Each one has a prop to override it.

## Removed

Nothing. Heatmap, Histogram, RadialGauge and Treemap are not imported by handle-v2 today; they
stay in 1.x and may be removed in 2.0.
