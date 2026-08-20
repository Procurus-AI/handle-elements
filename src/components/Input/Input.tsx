import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type InputVariant = 'default' | 'pill';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** `pill` is the fully-rounded search style. */
  variant?: InputVariant;
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon slot (e.g. a search glyph). */
  icon?: ReactNode;
  /** Trailing slot (e.g. a shortcut hint or clear button). */
  end?: ReactNode;
  /** Fill the available width and flex-grow (e.g. a search field in a toolbar). */
  grow?: boolean;
  /** className lands on the wrapper; use inputClassName for the field itself. */
  inputClassName?: string;
}

export function Input({
  variant = 'default',
  size = 'md',
  icon,
  end,
  grow = false,
  className,
  inputClassName,
  ...rest
}: InputProps) {
  return (
    <span
      className={cx('he-input', `he-input--${variant}`, `he-input--${size}`, grow && 'he-input--grow', className)}
    >
      {icon != null && <span className="he-input__icon">{icon}</span>}
      <input className={cx('he-input__field', inputClassName)} {...rest} />
      {end != null && <span className="he-input__end">{end}</span>}
    </span>
  );
}
