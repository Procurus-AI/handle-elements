import { useEffect, useRef, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label. `children` works the same; without either, pass `aria-label`. */
  label?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** Mixed state for "select all" parents. Set through the DOM property, as native checkboxes require. */
  indeterminate?: boolean;
  /** className lands on the wrapping label. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

/** Native checkbox, visually restyled. Controlled (`checked` + `onChange`) or uncontrolled (`defaultChecked`). */
export function Checkbox({
  label,
  description,
  indeterminate = false,
  className,
  children,
  disabled,
  ref,
  ...rest
}: CheckboxProps) {
  const inner = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const text = label ?? children;
  return (
    <label className={cx('he-checkbox', disabled && 'he-checkbox--disabled', className)}>
      <input
        {...rest}
        ref={(node) => {
          inner.current = node;
          assignRef(ref, node);
        }}
        type="checkbox"
        className="he-checkbox__input"
        disabled={disabled}
      />
      <span className="he-checkbox__box" aria-hidden>
        <Icon name="check" size={12} className="he-checkbox__check" />
        <span className="he-checkbox__dash" />
      </span>
      {(text != null || description != null) && (
        <span className="he-checkbox__text">
          {text != null && <span className="he-checkbox__label">{text}</span>}
          {description != null && <span className="he-checkbox__description">{description}</span>}
        </span>
      )}
    </label>
  );
}
