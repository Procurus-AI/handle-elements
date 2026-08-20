import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
  labelPosition?: 'start' | 'end';
  rootClassName?: string;
}

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  size = 'md',
  labelPosition = 'end',
  rootClassName,
  className,
  disabled,
  onClick,
  ...rest
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={currentChecked}
      disabled={disabled}
      className={cx('he-switch', `he-switch--${size}`, currentChecked && 'he-switch--checked', className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;

        const next = !currentChecked;
        if (!isControlled) setInternalChecked(next);
        onCheckedChange?.(next);
      }}
      {...rest}
    >
      <span className="he-switch__thumb" aria-hidden />
    </button>
  );

  if (label == null && description == null) return control;

  return (
    <label
      className={cx(
        'he-switch-field',
        `he-switch-field--${labelPosition}`,
        disabled && 'he-switch-field--disabled',
        rootClassName,
      )}
    >
      {labelPosition === 'start' && control}
      <span className="he-switch-field__text">
        {label != null && <span className="he-switch-field__label">{label}</span>}
        {description != null && <span className="he-switch-field__description">{description}</span>}
      </span>
      {labelPosition === 'end' && control}
    </label>
  );
}
