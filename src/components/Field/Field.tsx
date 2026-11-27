import { Children, cloneElement, isValidElement, useId, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

type ControlProps = { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean | 'true' | 'false'; 'aria-required'?: boolean };

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode;
  /** Helper text under the control. */
  hint?: ReactNode;
  /** Error message. Marks the control `aria-invalid` and replaces nothing: the hint stays. */
  error?: ReactNode;
  /** Adds the required marker and `aria-required` on the control. */
  required?: boolean;
  /** Overrides the generated control id. */
  controlId?: string;
  /** A single control (Input, Textarea, Select, Checkbox, RadioGroup) that accepts `id` and `aria-*`. */
  children: ReactElement<ControlProps>;
}

/**
 * Label, hint and error around one control. Field wires `htmlFor`/`id`, `aria-describedby` and
 * `aria-invalid` onto the child with `cloneElement`, so the control must forward those props to
 * its focusable element (Input, Textarea and Select do).
 */
export function Field({ label, hint, error, required = false, controlId, className, children, ...rest }: FieldProps) {
  const generated = useId();
  const child = Children.only(children);
  if (!isValidElement<ControlProps>(child)) throw new Error('Field expects exactly one control element');

  const id = controlId ?? child.props.id ?? `${generated}-control`;
  const hintId = hint != null ? `${id}-hint` : undefined;
  const errorId = error != null ? `${id}-error` : undefined;
  const describedBy = [child.props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = cloneElement(child, {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error != null ? true : child.props['aria-invalid'],
    'aria-required': required || undefined,
  });

  return (
    <div className={cx('he-field', error != null && 'he-field--invalid', className)} {...rest}>
      <label className="he-field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="he-field__required" aria-hidden>
            {' '}*
          </span>
        )}
      </label>
      {control}
      {hint != null && (
        <p className="he-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error != null && (
        <p className="he-field__error" id={errorId}>
          <Icon name="circle-alert" size={14} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
