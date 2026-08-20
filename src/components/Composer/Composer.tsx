import type { KeyboardEvent, ReactNode, TextareaHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export interface ComposerProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Left side of the toolbar row (attach button, mode toggles…). */
  toolbarStart?: ReactNode;
  /** Right side of the toolbar row (model select, mic…); the submit button renders after it. */
  toolbarEnd?: ReactNode;
  /** Enables the circular submit button and Enter-to-submit (Shift+Enter inserts a newline). */
  onSubmit?: () => void;
  submitDisabled?: boolean;
  /** className lands on the container; use inputClassName for the textarea. */
  inputClassName?: string;
}

export function Composer({
  toolbarStart,
  toolbarEnd,
  onSubmit,
  submitDisabled = false,
  className,
  inputClassName,
  onKeyDown,
  rows = 1,
  ...rest
}: ComposerProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (onSubmit && event.key === 'Enter' && !event.shiftKey && !event.defaultPrevented) {
      event.preventDefault();
      if (!submitDisabled) onSubmit();
    }
  };

  const hasToolbar = toolbarStart != null || toolbarEnd != null || onSubmit != null;

  return (
    <div className={cx('he-composer', className)}>
      <textarea
        className={cx('he-composer__input', inputClassName)}
        rows={rows}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {hasToolbar && (
        <div className="he-composer__bar">
          <div className="he-composer__start">{toolbarStart}</div>
          <div className="he-composer__end">
            {toolbarEnd}
            {onSubmit && (
              <button
                type="button"
                className="he-composer__submit"
                onClick={onSubmit}
                disabled={submitDisabled}
                aria-label="Submit"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                  <path
                    d="M7.5 12V3M7.5 3L3.5 7M7.5 3L11.5 7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
