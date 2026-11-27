import {
  Children,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';
import { Badge } from '../Badge/Badge';
import { Icon, type IconName } from '../Icon/Icon';

interface ChoiceGroupContext {
  value: string | undefined;
  select: (value: string) => void;
  /**
   * Card that holds the tab stop when the value is missing or names a disabled/unknown card:
   * the first enabled one. `null` = the selection is usable, `undefined` = the group could not
   * read its cards (wrapped children), so every card stays reachable while nothing is selected.
   */
  fallbackValue: string | null | undefined;
}

const GroupContext = createContext<ChoiceGroupContext | null>(null);

export interface ChoiceCardGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Selected choice. Controlled. */
  value: string | undefined;
  onChange?: (value: string) => void;
  /** Accessible name of the group (the question being answered). Required. */
  label: string;
  children: ReactNode;
}

/**
 * Radiogroup of ChoiceCards. Arrow keys move and select. When the value is missing or
 * names a disabled card, the first enabled card is the tab stop; otherwise the selected card is.
 */
export function ChoiceCardGroup({ value, onChange, label, className, children, onKeyDown, ...rest }: ChoiceCardGroupProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const step =
      event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    const cards = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'));
    const at = cards.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    event.preventDefault();
    const next = cards[(at + step + cards.length) % cards.length];
    next.focus();
    next.click();
  };

  // Read cards through Fragments too, so the fallback tab stop works for `<>{cards}</>`.
  const collect = (nodes: ReactNode): ChoiceCardProps[] =>
    Children.toArray(nodes).flatMap((child) => {
      if (!isValidElement(child)) return [];
      if (child.type === Fragment) return collect((child.props as { children?: ReactNode }).children);
      return child.type === ChoiceCard ? [child.props as ChoiceCardProps] : [];
    });
  const cards = collect(children);
  const fallbackValue =
    cards.length === 0
      ? undefined
      : cards.some((card) => !card.disabled && card.value === value)
        ? null
        : (cards.find((card) => !card.disabled)?.value ?? null);

  return (
    <GroupContext.Provider value={{ value, select: (v) => onChange?.(v), fallbackValue }}>
      <div
        role="radiogroup"
        aria-label={label}
        className={cx('he-choice-group', className)}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}

export interface ChoiceCardProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'title'> {
  /** Value reported to the group's `onChange`. */
  value: string;
  title: ReactNode;
  description?: ReactNode;
  /** Shows the "Recomendado" badge. */
  recommended?: boolean;
  /** Badge text. Default "Recomendado". */
  recommendedLabel?: string;
  icon?: IconName;
  disabled?: boolean;
}

/** A selectable card for one choice, e.g. "Conectar bandeja" vs "Reenviar correos". Lives in a ChoiceCardGroup. */
export function ChoiceCard({
  value,
  title,
  description,
  recommended = false,
  recommendedLabel = 'Recomendado',
  icon,
  disabled,
  className,
  onClick,
  ...rest
}: ChoiceCardProps) {
  const group = useContext(GroupContext);
  if (!group) throw new Error('ChoiceCard must be rendered inside a ChoiceCardGroup');
  const checked = group.value === value;
  const noSelection = group.value === undefined || group.value === '';
  const tabStop = checked || group.fallbackValue === value || (group.fallbackValue === undefined && noSelection);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      tabIndex={tabStop ? 0 : -1}
      className={cx('he-choice-card', checked && 'he-choice-card--checked', className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) group.select(value);
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={20} className="he-choice-card__icon" />}
      <span className="he-choice-card__text">
        <span className="he-choice-card__head">
          <span className="he-choice-card__title">{title}</span>
          {recommended && (
            <Badge tone="ok" size="sm">
              {recommendedLabel}
            </Badge>
          )}
        </span>
        {description != null && <span className="he-choice-card__desc">{description}</span>}
      </span>
      <span className="he-choice-card__check" aria-hidden="true">
        {checked && <Icon name="check" size={14} />}
      </span>
    </button>
  );
}
