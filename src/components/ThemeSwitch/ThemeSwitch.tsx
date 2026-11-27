import { useEffect, type HTMLAttributes, type KeyboardEvent } from 'react';
import { cx } from '../../lib/cx';
import { applyTheme, resolveTheme, watchResolvedTheme, type ThemePreference } from '../../lib/theme';
import { Icon, type IconName } from '../Icon/Icon';

export type ThemeSwitchValue = ThemePreference;

const MODES: { value: ThemeSwitchValue; icon: IconName; label: string }[] = [
  { value: 'light', icon: 'sun', label: 'Claro' },
  { value: 'system', icon: 'monitor', label: 'Sistema' },
  { value: 'dark', icon: 'moon', label: 'Oscuro' },
];

export interface ThemeSwitchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The user's preference. Controlled: there is no internal state. */
  value: ThemeSwitchValue;
  onChange?: (value: ThemeSwitchValue) => void;
  /**
   * Also write the resolved theme to `<html>` (`applyTheme`) and follow the OS while the
   * preference is `system`. Off by default: the host usually owns the attribute. The switch
   * never persists anything either way; saving the preference is the host's job.
   */
  applyToDocument?: boolean;
  /** Accessible name of the group. */
  label?: string;
}

/**
 * Sun / monitor / moon segmented icon buttons (the App shell sidebar footer). A radiogroup:
 * one tab stop, arrow keys move and select.
 */
export function ThemeSwitch({
  value,
  onChange,
  applyToDocument = false,
  label = 'Tema',
  className,
  onKeyDown,
  ...rest
}: ThemeSwitchProps) {
  useEffect(() => {
    if (!applyToDocument) return;
    applyTheme(resolveTheme(value));
    return watchResolvedTheme(
      () => value,
      (mode) => applyTheme(mode),
    );
  }, [applyToDocument, value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const at = MODES.findIndex((m) => m.value === value);
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = MODES[(at + step + MODES.length) % MODES.length];
    onChange?.(next.value);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('he-theme-switch', className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {MODES.map((mode) => {
        const checked = mode.value === value;
        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={mode.label}
            title={mode.label}
            data-value={mode.value}
            tabIndex={checked ? 0 : -1}
            className={cx('he-theme-switch__mode', checked && 'he-theme-switch__mode--checked')}
            onClick={() => onChange?.(mode.value)}
          >
            <Icon name={mode.icon} size={14} />
          </button>
        );
      })}
    </div>
  );
}
