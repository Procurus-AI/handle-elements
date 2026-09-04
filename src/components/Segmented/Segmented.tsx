import { useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Tooltip } from '../Tooltip/Tooltip';

export type SegmentedTone = 'default' | 'ok' | 'warn' | 'error' | 'accent';

export interface SegmentedOption<T extends string = string> {
  value: T;
  /** REQUIRED. There is no icon-only escape hatch — an unlabelled glyph is a guess. */
  label: ReactNode;
  /** Reinforcing glyph left of the word; aria-hidden. 15x15, stroke-width 1.4. */
  icon?: ReactNode;
  /** 6px dot before the label — consequence, at the scale of a bullet. 'default' renders no dot. */
  tone?: SegmentedTone;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: SegmentedOption<T>[];
  /** Fully controlled — there is no defaultValue and no internal selection state. */
  value: T;
  onChange: (value: T) => void;
  /** REQUIRED accessible name on the group. */
  label: string;
  size?: 'sm' | 'md';
  /** Equal-width segments filling the container — the rail default. */
  block?: boolean;
  /**
   * Collapse to a single button showing the CURRENT option, advancing to the
   * next on click — the affordance for a 56px rail, where labelled segments
   * truncate to a letter. The full name moves into a tooltip and the accessible
   * name, so the state stays legible where the segments would not fit. Meant for
   * two options; with more, a Menu with a checked item is the right shape — that
   * is where the appearance picker went.
   */
  iconOnly?: boolean;
}

/**
 * One-of-N at row scale. `role="group"` + `aria-pressed` rather than a tablist
 * (which promises a tabpanel that does not exist) or a radiogroup (whose APG
 * pattern selects on arrow — unsafe for an environment switch sharing this
 * primitive). Arrows move focus only; Space/Enter commit.
 */
export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  block = false,
  iconOnly = false,
  className,
  onKeyDown,
  ...rest
}: SegmentedProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const firstEnabled = options.findIndex((option) => !option.disabled);
  const rovingIndex = selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : firstEnabled;

  const focusAt = (index: number) => {
    const buttons = ref.current?.querySelectorAll<HTMLButtonElement>('.he-segmented__option');
    buttons?.[index]?.focus();
  };

  const step = (from: number, delta: number) => {
    for (let hop = 1; hop <= options.length; hop += 1) {
      const next = (from + delta * hop + options.length * hop) % options.length;
      if (!options[next].disabled) return next;
    }
    return from;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('.he-segmented__option') ?? []);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;

    // Focus only — arrowing must never commit a change. It is what keeps you
    // from landing in production by holding an arrow key.
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') focusAt(step(current, 1));
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') focusAt(step(current, -1));
    else if (event.key === 'Home') focusAt(step(-1, 1));
    else if (event.key === 'End') focusAt(step(0, -1));
    else return;

    event.preventDefault();
  };

  if (iconOnly) {
    const current = options.find((option) => option.value === value) ?? options[0];
    const next = options[(options.findIndex((o) => o.value === value) + 1) % options.length] ?? current;
    // The glyph reports the CURRENT option; the action lives in the accessible
    // name ("Entorno: Live → Dev"), so a one-button cycle is never a guess.
    const name = `${label}: ${textOf(current?.label)} \u2192 ${textOf(next?.label)}`;
    return (
      <Tooltip content={name} placement="right">
        <button
          type="button"
          {...(rest as HTMLAttributes<HTMLButtonElement>)}
          aria-label={name}
          onClick={() => next && onChange(next.value)}
          className={cx('he-segmented__toggle', className)}
        >
          {current?.tone != null && current.tone !== 'default' && (
            <span className={cx('he-segmented__dot', `he-segmented__dot--${current.tone}`)} aria-hidden />
          )}
          {current?.icon ?? <span className="he-segmented__toggle-text">{textOf(current?.label).slice(0, 3)}</span>}
        </button>
      </Tooltip>
    );
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={cx('he-segmented', `he-segmented--${size}`, block && 'he-segmented--block', className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={cx('he-segmented__option', selected && 'he-segmented__option--selected')}
            aria-pressed={selected}
            tabIndex={index === rovingIndex ? 0 : -1}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
          >
            {option.tone != null && option.tone !== 'default' && (
              <span className={cx('he-segmented__dot', `he-segmented__dot--${option.tone}`)} aria-hidden />
            )}
            {option.icon != null && (
              <span className="he-segmented__icon" aria-hidden>
                {option.icon}
              </span>
            )}
            <span className="he-segmented__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Best-effort plain text from a ReactNode, for aria-labels and the collapsed glyph. */
function textOf(node: ReactNode): string {
  if (node == null || node === false || node === true) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return '';
}
