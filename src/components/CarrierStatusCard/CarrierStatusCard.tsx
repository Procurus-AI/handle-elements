import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Badge } from '../Badge/Badge';
import { Icon } from '../Icon/Icon';

export type CarrierStatusCardTone = 'success' | 'warning' | 'idle';

export interface CarrierStatusCardProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Carrier name. */
  name: string;
  /** Text inside the badge, e.g. `Al día`. */
  status: ReactNode;
  tone?: CarrierStatusCardTone;
  /** Value of the "Credenciales" field. */
  credentials: ReactNode;
  /** Value of the "Último sync" field. */
  lastSync: ReactNode;
  /** Picked card: a focus-colour border. Reflected as `aria-pressed` when clickable. */
  selected?: boolean;
  /** Makes the card a button. Without it the card is a plain container. */
  onClick?: () => void;
}

/** A carrier's connection health. Clickable as a toggle button when `onClick` is given. */
export function CarrierStatusCard({
  name,
  status,
  tone = 'success',
  credentials,
  lastSync,
  selected = false,
  onClick,
  className,
  ...rest
}: CarrierStatusCardProps) {
  const classes = cx(
    'he-carrier-card',
    `he-carrier-card--${tone}`,
    selected && 'he-carrier-card--selected',
    onClick && 'he-carrier-card--clickable',
    className,
  );
  const body = (
    <>
      <span className="he-carrier-card__head">
        <Icon name="building-2" size={20} className="he-carrier-card__icon" />
        <span className="he-carrier-card__name">{name}</span>
      </span>
      <Badge tone={tone} dot className="he-carrier-card__badge">
        {status}
      </Badge>
      <span className="he-carrier-card__fields">
        <span className="he-carrier-card__field">
          <span className="he-carrier-card__field-label">Credenciales</span>
          <span className="he-carrier-card__field-value">{credentials}</span>
        </span>
        <span className="he-carrier-card__field">
          <span className="he-carrier-card__field-label">Último sync</span>
          <span className="he-carrier-card__field-value">{lastSync}</span>
        </span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        aria-pressed={selected}
        onClick={onClick}
        {...(rest as HTMLAttributes<HTMLButtonElement>)}
      >
        {body}
      </button>
    );
  }
  return (
    <div className={classes} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {body}
    </div>
  );
}
