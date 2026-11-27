import { createContext, useContext, useState, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface RadioGroupContext {
  name: string;
  value: string;
  disabled: boolean;
  select: (value: string) => void;
}

const GroupContext = createContext<RadioGroupContext | null>(null);

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label. `children` works the same; without either, pass `aria-label`. */
  label?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** className lands on the wrapping label. */
  className?: string;
}

/**
 * Native radio, visually restyled. Inside a `RadioGroup` the name, selection and disabled state
 * come from the group; on its own it takes the native `name`, `checked`/`defaultChecked`, `onChange`.
 */
export function Radio({ label, description, className, children, disabled, value, ...rest }: RadioProps) {
  const group = useContext(GroupContext);
  const grouped =
    group && value !== undefined
      ? {
          name: group.name,
          checked: group.value === String(value),
          onChange: () => group.select(String(value)),
        }
      : {};
  const isDisabled = disabled ?? group?.disabled;
  const text = label ?? children;
  return (
    <label className={cx('he-radio', isDisabled && 'he-radio--disabled', className)}>
      <input
        {...rest}
        {...grouped}
        value={value}
        type="radio"
        className="he-radio__input"
        disabled={isDisabled}
      />
      <span className="he-radio__box" aria-hidden>
        <span className="he-radio__dot" />
      </span>
      {(text != null || description != null) && (
        <span className="he-radio__text">
          {text != null && <span className="he-radio__label">{text}</span>}
          {description != null && <span className="he-radio__description">{description}</span>}
        </span>
      )}
    </label>
  );
}

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Shared `name` for the native inputs. */
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  children: ReactNode;
}

/** `role="radiogroup"`; name it with `aria-label` or `aria-labelledby`. Arrow keys come from the native inputs. */
export function RadioGroup({
  name,
  value,
  defaultValue = '',
  onValueChange,
  disabled = false,
  orientation = 'vertical',
  className,
  children,
  ...rest
}: RadioGroupProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const select = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };
  return (
    <GroupContext.Provider value={{ name, value: current, disabled, select }}>
      <div
        role="radiogroup"
        className={cx('he-radio-group', `he-radio-group--${orientation}`, className)}
        {...rest}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}
