import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Segmented } from '../Segmented/Segmented';
import { Tooltip } from '../Tooltip/Tooltip';
import type { ThemeMode } from '../../lib/theme';

/* `HTMLAttributes<HTMLElement>`, not `<HTMLDivElement>`: `iconOnly` renders a
 * <button>, and the props a consumer passes must survive the rail collapsing. */
export interface ThemeSwitchProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Fully controlled. The host owns the <html> attribute and persistence (see src/lib/theme.ts). */
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  /** Accessible name on the group (default 'Theme'). */
  label?: string;
  /** Option labels (default { light: 'Light', dark: 'Dark' }). */
  labels?: { light: ReactNode; dark: ReactNode };
  size?: 'sm' | 'md';
  /** Fills the rail's content box (default true). */
  block?: boolean;
  /** Collapsed 56px rail: one ghost icon button instead of a two-up group. */
  iconOnly?: boolean;
}

/* Both glyphs on ONE 15-unit grid at ONE weight — stroke-width 1.4, round caps,
 * matching the Sidebar section chevron (Sidebar.tsx) and the rail's own icon set.
 * The old control's sun was visibly heavier than its moon. */
const SunGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
    <circle cx="7.5" cy="7.5" r="3.1" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M7.5 1.5v1.7M7.5 11.8v1.7M13.5 7.5h-1.7M3.2 7.5H1.5M11.7 3.3l-1.2 1.2M4.5 10.5l-1.2 1.2M11.7 11.7l-1.2-1.2M4.5 4.5 3.3 3.3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const MoonGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
    <path
      d="M12.4 9.3A5.3 5.3 0 0 1 5.7 2.6a5.4 5.4 0 1 0 6.7 6.7Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Light / Dark, two committed states — no System segment and no monitor glyph.
 * A visible System option makes the control misreport itself (monitor shown while
 * the app renders dark) and a third labelled segment truncates at rail width;
 * `systemTheme()` seeds the first-run default in JS instead.
 */
export function ThemeSwitch({
  value,
  onChange,
  label = 'Theme',
  labels = { light: 'Light', dark: 'Dark' },
  size = 'md',
  block = true,
  iconOnly = false,
  className,
  ...rest
}: ThemeSwitchProps) {
  if (iconOnly) {
    // The icon reports the CURRENT appearance; the action lives in the name.
    const name =
      value === 'light' ? `${label}: ${labels.light} → ${labels.dark}` : `${label}: ${labels.dark} → ${labels.light}`;
    return (
      <Tooltip content={name} placement="right">
        <button
          type="button"
          {...rest}
          aria-label={name}
          onClick={() => onChange(value === 'light' ? 'dark' : 'light')}
          className={cx('he-theme-switch__toggle', className)}
        >
          {value === 'light' ? <SunGlyph /> : <MoonGlyph />}
        </button>
      </Tooltip>
    );
  }

  return (
    // `{...rest}` FIRST, `className` last — the same ordering as the iconOnly
    // branch above and as Section/DescriptionList/Feed/Segmented. Consumer props
    // never sit downstream of the props this component owns.
    <Segmented<ThemeMode>
      {...rest}
      label={label}
      block={block}
      size={size}
      value={value}
      onChange={onChange}
      options={[
        { value: 'light', label: labels.light, icon: <SunGlyph /> },
        { value: 'dark', label: labels.dark, icon: <MoonGlyph /> },
      ]}
      className={cx('he-theme-switch', className)}
    />
  );
}
