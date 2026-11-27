import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export type CarrierChipState = 'ok' | 'warning' | 'error' | 'idle';

export interface CarrierChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Carrier name. */
  name: string;
  /** Connection state, painted on the trailing dot. */
  state?: CarrierChipState;
  /** Text read by assistive tech for the state dot. Defaults to a Spanish label. */
  stateLabel?: string;
}

const STATE_LABEL: Record<CarrierChipState, string> = {
  ok: 'Conectada',
  warning: 'Con aviso',
  error: 'Con error',
  idle: 'Sin conectar',
};

/** Names a carrier and its connection state. Borderless: it is a label, not a control. */
export function CarrierChip({ name, state = 'idle', stateLabel, className, ...rest }: CarrierChipProps) {
  return (
    <span className={cx('he-carrier-chip', `he-carrier-chip--${state}`, className)} {...rest}>
      <Icon name="building-2" size={14} className="he-carrier-chip__icon" />
      <span className="he-carrier-chip__name">{name}</span>
      <span className="he-carrier-chip__dot" aria-hidden />
      <span className="he-carrier-chip__state">{stateLabel ?? STATE_LABEL[state]}</span>
    </span>
  );
}
