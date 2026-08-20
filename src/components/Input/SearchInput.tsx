import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Input, type InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'icon' | 'type' | 'end' | 'onChange'> {
  /** Fires with the new query text (debounced when `debounceMs` > 0). */
  onValueChange?: (value: string) => void;
  /** Native change passthrough (fires immediately, undebounced). */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Show a clear (×) button while there is text (default true). */
  clearable?: boolean;
  /** Debounce for `onValueChange`, in ms (default 0 = immediate). */
  debounceMs?: number;
  /** Custom leading icon (defaults to a search glyph). */
  icon?: ReactNode;
}

function SearchGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SearchInput({
  value,
  defaultValue,
  onValueChange,
  onChange,
  clearable = true,
  debounceMs = 0,
  icon,
  variant = 'pill',
  placeholder = 'Search…',
  className,
  ...rest
}: SearchInputProps) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState(String(defaultValue ?? ''));
  const current = isControlled ? String(value ?? '') : inner;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const emit = (next: string) => {
    if (!onValueChange) return;
    if (debounceMs > 0) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => onValueChange(next), debounceMs);
    } else {
      onValueChange(next);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (!isControlled) setInner(next);
    onChange?.(event);
    emit(next);
  };

  const clear = () => {
    if (!isControlled) setInner('');
    clearTimeout(timer.current);
    onValueChange?.('');
  };

  return (
    <Input
      type="search"
      variant={variant}
      placeholder={placeholder}
      className={cx('he-searchinput', className)}
      value={current}
      onChange={handleChange}
      icon={icon ?? <SearchGlyph />}
      end={
        clearable && current ? (
          <button type="button" className="he-searchinput__clear" onClick={clear} aria-label="Clear search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ) : undefined
      }
      {...rest}
    />
  );
}
