import type { CSSProperties, KeyboardEvent, ReactNode, Ref, TextareaHTMLAttributes } from 'react';
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
export type ComposerSize = 'sm' | 'md' | 'lg';
export type ComposerSubmitVariant = 'solid' | 'ghost';
export type ComposerSuggestionPlacement = 'before' | 'after';
export type ComposerLayout = 'stacked' | 'inline';
export type ComposerVariant = 'default' | 'dock';

/**
 * `...rest` (including `style`) targets the <textarea>; `className` and `size`
 * target the input shell. `align` and `maxWidth` target the composed field when
 * one is present.
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
  /** Prompt chips rendered around the shell — pass data, not markup. */
  suggestions?: ComposerSuggestion[];
  onSuggestionSelect?: (suggestion: ComposerSuggestion, index: number) => void;
  /** aria-label on the suggestions group. Default `Suggestions`. */
  suggestionsLabel?: string;
  /**
   * Places prompt chips around the shell. In `dock`, this positions the unified
   * activity + suggestions band. Default `after`.
   */
  suggestionPlacement?: ComposerSuggestionPlacement;
  /**
   * Optional agent activity or execution context. `ActivityTrail` is the
   * recommended value; the slot stays generic so products can provide their
   * own status semantics.
   */
  activity?: ReactNode;
  /**
   * Toolbar placement. `inline` keeps the input and actions in one compact row,
   * intended for a persistent agent dock. Default `stacked` (`inline` in `dock`).
   */
  layout?: ComposerLayout;
  /**
   * `dock` groups activity, shortcuts and input into one compact surface. It
   * leads with the input and follows with one support band by default; its
   * toolbar defaults to `inline`. Explicit placement/layout props still win.
   * Default `default`.
   */
  variant?: ComposerVariant;
  /** Centers the shell and its suggestions — the hero greeting layout. */
  align?: ComposerAlign;
  /** Caps the composed surface (not the textarea) — a number (px) or any CSS length. */
  maxWidth?: number | string;
  /** `sm` is the inline comment box — square corners, no shadow, 13px input.
   *  `lg` is the airier hero box. Default `md`. */
  size?: ComposerSize;
  /** className lands on the container; use inputClassName for the textarea. */
  inputClassName?: string;
  /**
   * Ref to the underlying <textarea>. A caller that drafts text into the
   * composer from somewhere else on the screen needs a handle to focus it and
   * scroll it into view — text that lands off-screen reads as a control that
   * did nothing.
   */
  inputRef?: Ref<HTMLTextAreaElement>;
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
  suggestionPlacement,
  activity,
  layout,
  variant = 'default',
  align = 'start',
  maxWidth,
  size = 'md',
  className,
  inputClassName,
  inputRef,
  onKeyDown,
  rows = 1,
  ...rest
}: ComposerProps) {
  const resolvedSuggestionPlacement = suggestionPlacement ?? 'after';
  const resolvedLayout = layout ?? (variant === 'dock' ? 'inline' : 'stacked');

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (
      onSubmit &&
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.defaultPrevented &&
      !event.nativeEvent.isComposing &&
      event.nativeEvent.keyCode !== 229
    ) {
      event.preventDefault();
      if (!submitDisabled) onSubmit();
    }
  };

  const hasToolbar =
    toolbarStart != null || toolbarEnd != null || onSubmit != null || onMic != null;

  const shell = (
    <div
      className={cx(
        'he-composer',
        size === 'sm' && 'he-composer--sm',
        size === 'lg' && 'he-composer--lg',
        resolvedLayout === 'inline' && 'he-composer--inline',
        className,
      )}
    >
      <textarea
        ref={inputRef}
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
  const needsField =
    variant === 'dock' ||
    activity != null ||
    (suggestions?.length ?? 0) > 0 ||
    align === 'center' ||
    maxWidth != null;
  if (!needsField) return shell;

  const suggestionList = suggestions?.length ? (
    <div
      className={cx(
        'he-composer-field__suggestions',
        resolvedSuggestionPlacement === 'before' && 'he-composer-field__suggestions--before',
        resolvedSuggestionPlacement === 'after' && 'he-composer-field__suggestions--after',
      )}
      role="group"
      aria-label={suggestionsLabel ?? 'Suggestions'}
    >
      {suggestions.map((s, i) => (
        <Button
          key={s.id}
          type="button"
          variant={variant === 'dock' ? 'ghost' : 'outline'}
          size={variant === 'dock' ? 'xs' : resolvedSuggestionPlacement === 'before' ? 'sm' : 'xs'}
          disabled={s.disabled}
          onClick={() => onSuggestionSelect?.(s, i)}
        >
          {s.label}
          {s.count != null && <Badge tone={s.countTone ?? 'accent'}>{s.count}</Badge>}
        </Button>
      ))}
    </div>
  ) : null;

  const activityNode =
    activity != null ? <div className="he-composer-field__activity">{activity}</div> : null;

  const fieldStyle = {
    '--he-composer-max':
      maxWidth == null ? undefined : typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  } as CSSProperties;

  if (variant === 'dock') {
    const hasSupport = activityNode != null || suggestionList != null;
    const support = hasSupport ? (
      <div
        className={cx(
          'he-composer-field__support',
          resolvedSuggestionPlacement === 'after' && 'he-composer-field__support--after',
        )}
      >
        {activityNode}
        {suggestionList}
      </div>
    ) : null;

    return (
      <div
        className={cx(
          'he-composer-field',
          'he-composer-field--dock',
          align === 'center' && 'he-composer-field--center',
        )}
        style={fieldStyle}
      >
        {resolvedSuggestionPlacement === 'before' && support}
        {shell}
        {resolvedSuggestionPlacement === 'after' && support}
      </div>
    );
  }

  return (
    <div
      className={cx('he-composer-field', align === 'center' && 'he-composer-field--center')}
      style={fieldStyle}
    >
      {activityNode}
      {resolvedSuggestionPlacement === 'before' && suggestionList}
      {shell}
      {resolvedSuggestionPlacement === 'after' && suggestionList}
    </div>
  );
}
