# Changelog

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
