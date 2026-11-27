import {
  createContext,
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
 * Radiogroup of ChoiceCards. Arrow keys move and select. With nothing selected every enabled
 * card is a tab stop; once one is selected it is the only one.
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

  return (
    <GroupContext.Provider value={{ value, select: (v) => onChange?.(v) }}>
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
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      tabIndex={checked || noSelection ? 0 : -1}
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
