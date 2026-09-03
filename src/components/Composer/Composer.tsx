import type { CSSProperties, KeyboardEvent, ReactNode, TextareaHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import { Badge, type BadgeTone } from '../Badge/Badge';
import { Button } from '../Button/Button';

export interface ComposerSuggestion {
  /** Stable React key and callback identity. */
  id: string;
  label: ReactNode;
  /** Optional trailing count badge (e.g. 270). */
  count?: ReactNode;
  /** Badge tone for `count`. Default `accent`. */
  countTone?: BadgeTone;
  disabled?: boolean;
}

export type ComposerAlign = 'start' | 'center';
export type ComposerSize = 'md' | 'lg';
export type ComposerSubmitVariant = 'solid' | 'ghost';

/**
 * `...rest` (including `style`) targets the <textarea>; `className`, `maxWidth`,
 * `align` and `size` target the shell.
 */
export interface ComposerProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Left side of the toolbar row (attach button, mode toggles…). */
  toolbarStart?: ReactNode;
  /** Right side of the toolbar row (model select…); the mic and submit render after it. */
  toolbarEnd?: ReactNode;
  /** Enables the circular submit button and Enter-to-submit (Shift+Enter inserts a newline). */
  onSubmit?: () => void;
  submitDisabled?: boolean;
  /** Chrome for the submit control — `ghost` is the bare arrow of the hero composer. */
  submitVariant?: ComposerSubmitVariant;
  /** aria-label for the submit control. Default `Submit`. */
  submitLabel?: string;
  /** Renders the library-owned mic button before the submit control. */
  onMic?: () => void;
  micActive?: boolean;
  micLabel?: string;
  /** Prompt chips rendered under the shell — pass data, not markup. */
  suggestions?: ComposerSuggestion[];
  onSuggestionSelect?: (suggestion: ComposerSuggestion, index: number) => void;
  /** aria-label on the suggestions group. Default `Suggestions`. */
  suggestionsLabel?: string;
  /** Centers the shell and its suggestions — the hero greeting layout. */
  align?: ComposerAlign;
  /** Caps the shell (not the textarea) — a number (px) or any CSS length. */
  maxWidth?: number | string;
  /** `lg` is the airier hero box. Default `md`. */
  size?: ComposerSize;
  /** className lands on the container; use inputClassName for the textarea. */
  inputClassName?: string;
}

export function Composer({
  toolbarStart,
  toolbarEnd,
  onSubmit,
  submitDisabled = false,
  submitVariant = 'solid',
  submitLabel,
  onMic,
  micActive,
  micLabel,
  suggestions,
  onSuggestionSelect,
  suggestionsLabel,
  align = 'start',
  maxWidth,
  size = 'md',
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

  const hasToolbar =
    toolbarStart != null || toolbarEnd != null || onSubmit != null || onMic != null;

  const shell = (
    <div className={cx('he-composer', size === 'lg' && 'he-composer--lg', className)}>
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
            {onMic && (
              <button
                type="button"
                className={cx('he-composer__mic', micActive && 'he-composer__mic--active')}
                onClick={onMic}
                aria-label={micLabel ?? 'Voice input'}
                aria-pressed={micActive ?? false}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                  <rect
                    x="5.6"
                    y="1.6"
                    width="3.8"
                    height="7.4"
                    rx="1.9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M3.6 7.1v.6a3.9 3.9 0 0 0 7.8 0v-.6M7.5 11.6v1.8"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
            {onSubmit && (
              <button
                type="button"
                className={cx(
                  'he-composer__submit',
                  submitVariant === 'ghost' && 'he-composer__submit--ghost',
                )}
                onClick={onSubmit}
                disabled={submitDisabled}
                aria-label={submitLabel ?? 'Submit'}
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

  // Only wrap when a field-level concern is in play, so existing renders stay identical.
  const needsField = (suggestions?.length ?? 0) > 0 || align === 'center' || maxWidth != null;
  if (!needsField) return shell;

  return (
    <div
      className={cx('he-composer-field', align === 'center' && 'he-composer-field--center')}
      style={
        {
          '--he-composer-max':
            maxWidth == null ? undefined : typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        } as CSSProperties
      }
    >
      {shell}
      {suggestions?.length ? (
        <div
          className="he-composer-field__suggestions"
          role="group"
          aria-label={suggestionsLabel ?? 'Suggestions'}
        >
          {suggestions.map((s, i) => (
            <Button
              key={s.id}
              type="button"
              variant="outline"
              size="xs"
              disabled={s.disabled}
              onClick={() => onSuggestionSelect?.(s, i)}
            >
              {s.label}
              {s.count != null && <Badge tone={s.countTone ?? 'accent'}>{s.count}</Badge>}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
