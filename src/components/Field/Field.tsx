import { Children, cloneElement, createElement, isValidElement, useId, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Checkbox } from '../Checkbox/Checkbox';
import { Icon } from '../Icon/Icon';
import { RadioGroup } from '../Radio/Radio';

type ControlProps = { id?: string; 'aria-labelledby'?: string; 'aria-label'?: string; label?: ReactNode; children?: ReactNode; 'aria-describedby'?: string; 'aria-invalid'?: boolean | 'true' | 'false'; 'aria-required'?: boolean };

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
  /**
   * A single control that accepts `id` and `aria-*`: Input, Textarea, Select, RadioGroup, or a
   * Checkbox. Field is for controls without a label of their own; a Checkbox that already has
   * `label`/children/`aria-label` keeps it and Field's text becomes a plain caption.
   */
  children: ReactElement<ControlProps>;
}

/**
 * Label, hint and error around one control. Field wires `htmlFor`/`id`, `aria-describedby` and
 * `aria-invalid` onto the child with `cloneElement`, so the control must forward those props to
 * its focusable element (Input, Textarea and Select do). A RadioGroup is not a labelable element,
 * so it is named with `aria-labelledby` pointing at the Field label instead of `htmlFor`.
 *
 * Field wraps controls that have no label of their own. Checkbox renders its own `<label>`: when it
 * has none, Field passes its label in so there is one accessible name; when it already has one,
 * Field's label is a plain caption and is not associated, so the name is never doubled.
 */
export function Field({ label, hint, error, required = false, controlId, className, children, ...rest }: FieldProps) {
  const generated = useId();
  const child = Children.only(children);
  if (!isValidElement<ControlProps>(child)) throw new Error('Field expects exactly one control element');

  const id = controlId ?? child.props.id ?? `${generated}-control`;
  const hintId = hint != null ? `${id}-hint` : undefined;
  const errorId = error != null ? `${id}-error` : undefined;
  const describedBy = [child.props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined;

  const labelId = `${id}-label`;
  const isGroup = child.type === RadioGroup;
  const isCheckbox = child.type === Checkbox;
  const checkboxNamed =
    isCheckbox &&
    (child.props.label != null || child.props.children != null || child.props['aria-label'] != null || child.props['aria-labelledby'] != null);
  const labelAsCheckboxText = isCheckbox && !checkboxNamed;

  const control = cloneElement(child, {
    id,
    ...(isGroup && !child.props['aria-labelledby'] && !child.props['aria-label'] ? { 'aria-labelledby': labelId } : {}),
    ...(labelAsCheckboxText
      ? {
          label: (
            <>
              {label}
              {required && <span aria-hidden> *</span>}
            </>
          ),
        }
      : {}),
    'aria-describedby': describedBy,
    'aria-invalid': error != null ? true : child.props['aria-invalid'],
    'aria-required': required || undefined,
  });

  return (
    <div className={cx('he-field', error != null && 'he-field--invalid', className)} {...rest}>
      {!labelAsCheckboxText &&
        createElement(
          isGroup || checkboxNamed ? 'span' : 'label',
          { className: 'he-field__label', id: labelId, ...(isGroup || checkboxNamed ? {} : { htmlFor: id }) },
          label,
          required && (
            <span className="he-field__required" aria-hidden>
              {' '}*
            </span>
          ),
        )}
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
