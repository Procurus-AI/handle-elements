# Changelog

## 0.4.0

### Added

- `EmailComposer` — a responsive, channel-aware drafting window with editable recipients,
  subject and message content; consumer-provided WhatsApp, email, phone or custom channel icons;
  clipboard copy feedback; workflow action slots; and light/dark theme support.
- Built-in rich-text controls for bold, italic, underline, bulleted lists and numbered lists,
  including active formatting states and clean plain-text copying.
- Full and compact Storybook examples based on the Handle email review workflow.

## 0.3.3

### Added

- AI-native workspace primitives: `AgentWorkspace`, `AgentResponse`, `FindingList`,
  `ActivityTrail`, `AgentEvidenceDisclosure`, `InboxList`, `ReviewWorkspace`,
  `ReviewConclusion`, `ReviewField` and `EvidencePreview`.
- A reusable KYC agent example covering an intelligent inbox, an agent answer and a
  three-pane document review flow.

### Changed

- `Composer` gains an input-first agent dock with integrated activity and contextual suggestions.
- `DataTable` gains an accessible caption, minimum table width and reusable sorting support for
  compact operational views.
- `PageHeader`, `Sidebar`, `StatusPill` and `Card` gain compact variants and slots used by agent
  workspaces, including responsive actions and quiet semantic states.
- The default canvas and supporting surfaces use Handle's warmer, lower-chrome visual treatment.

## 0.3.2

### Fixed

- `Card` no longer fights the consumer over `display`. Its `display: block` default now lives in a
  zero-specificity `:where(.he-card)` rule, so a consumer's single-class `display: flex` / `grid`
  wins regardless of stylesheet load order. Before, `.he-card { display: block }` tied on specificity
  with the consumer's module rule and Next's production bundle loaded it later, silently turning a
  flex-column card back into a block — a scrolling list inside the card grew past `max-height` and
  was clipped instead of scrolling (handle-v2 account switcher). No visual change for cards that do
  not override `display`.

## 0.3.1

Released as a patch deliberately: `ThemeSwitch` shipped in 0.3.0 the same day and had no
adopters, so the export removal below could not break an installed consumer. Treat it as
breaking if you pinned 0.3.0 and used it.

### Breaking

- **Removed `ThemeSwitch` / `ThemeSwitchProps`,** and with them the `.he-theme-switch` and
  `.he-theme-switch__toggle` rules in `dist/handle-elements.css`. The component was named after a
  USE CASE, not a shape, and baked in a two-option model with product labels. Migration: compose the
  picker from generic parts — a `MenuSub` whose children are one `MenuItem checked` per option, with
  the current value in the sub-trigger's `sublabel` (see the App Shell example). For a two-option
  strip in place, `<Segmented>` is the drop-in.
- `Avatar` with `status` (or the new `badge`) now renders the marker as a SIBLING of `.he-avatar`
  inside a `.he-avatar-badged` wrapper, so it escapes the disc's `overflow: hidden` — the status dot
  previously rendered as a ~2px sliver. Migration: a stylesheet targeting `.he-avatar .he-avatar__status`
  becomes `.he-avatar-badged .he-avatar__status`. Avatars without `status`/`badge` are unchanged.

### Added

- `MenuSub` — nested menus: hover intent, ArrowRight/ArrowLeft, per-level Escape, `right-start`
  placement flipping to `left-start`, and full APG ARIA on the trigger row.
- `MenuStatic` — a non-interactive row on the menu row grid, for an identity block in `header`.
- `MenuItem` `trailing` slot; `Avatar` `badge` slot; `SidebarFooterRow`; `SidebarFooterItem`
  `chevron="updown"`.
- `ThemePreference` (`light | dark | system`), `resolveTheme(preference)` and
  `watchResolvedTheme(getPreference, cb)`. `ThemeMode` is unchanged and still means the RESOLVED
  theme that `applyTheme` writes. `themeBootScript` already handled a stored `"system"`; the
  contract is now documented.
- `PopoverPlacement` gains the four horizontal values; `Popover` gains `crossOffset` and `actionsRef`.

### Fixed

- A portalled surface nested inside another no longer dismisses its parent: the outside-click,
  focus-in and Escape tests now walk a surface OWNER CHAIN instead of a single `contains()`.
- `.he-menu__item--rich` rows without a sublabel no longer collapse to 27.6px beside 32px text rows.
- `.he-menu__separator` starts at the icon column, so a band groups rows instead of cutting the card.
