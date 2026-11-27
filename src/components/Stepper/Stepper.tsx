import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export type StepState = 'complete' | 'current' | 'upcoming';

export interface StepperStep {
  /** Step name, e.g. "Credenciales". */
  label: ReactNode;
  /** Secondary line under the label (Caption, tertiary). */
  description?: ReactNode;
  /** Overrides the state derived from `current`. */
  state?: StepState;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  steps: StepperStep[];
  /** Zero-based index of the current step. Earlier steps are complete, later ones upcoming. */
  current: number;
  orientation?: 'vertical' | 'horizontal';
  /**
   * Content of the current step (the one decision of this step). Vertical: under the current
   * step; horizontal: under the whole list.
   */
  children?: ReactNode;
  /** Visually hidden suffix for a completed step. Default "completado". */
  completeLabel?: string;
}

/**
 * Credential and MFA flows: one decision per step. The current step is a soft fill with
 * `aria-current="step"`; completed steps show a check on `status/success`.
 */
export function Stepper({
  steps,
  current,
  orientation = 'vertical',
  children,
  completeLabel = 'completado',
  className,
  ...rest
}: StepperProps) {
  const stateOf = (step: StepperStep, i: number): StepState =>
    step.state ?? (i < current ? 'complete' : i === current ? 'current' : 'upcoming');
  const horizontal = orientation === 'horizontal';

  return (
    <div className={cx('he-stepper', `he-stepper--${orientation}`, className)}>
      <ol className="he-stepper__list" {...rest}>
        {steps.map((step, i) => {
          const state = stateOf(step, i);
          return (
            <li
              key={i}
              className={cx('he-stepper__step', `he-stepper__step--${state}`)}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <div className="he-stepper__row">
                <span className="he-stepper__marker" aria-hidden="true">
                  {state === 'complete' ? <Icon name="check" size={12} /> : i + 1}
                </span>
                <span className="he-stepper__text">
                  <span className="he-stepper__label">
                    {step.label}
                    {state === 'complete' && <span className="he-stepper__sr"> ({completeLabel})</span>}
                  </span>
                  {step.description != null && <span className="he-stepper__desc">{step.description}</span>}
                </span>
              </div>
              {!horizontal && state === 'current' && children != null && (
                <div className="he-stepper__content">{children}</div>
              )}
            </li>
          );
        })}
      </ol>
      {horizontal && children != null && <div className="he-stepper__content">{children}</div>}
    </div>
  );
}
