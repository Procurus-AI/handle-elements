import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type TextSize = 'caption' | 'sm' | 'body' | 'heading';
/** Only tones that pass contrast as text on light surfaces (never accent). */
export type TextTone = 'default' | 'dim' | 'faint';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'small' | 'label';
  /** Font size step. Default `body`. */
  size?: TextSize;
  /** Text color. Default `default`. */
  tone?: TextTone;
  weight?: 'regular' | 'medium';
  /** Render in the mono family. */
  mono?: boolean;
  align?: 'start' | 'center' | 'end';
}

/**
 * Typographic text — captions, notes, mini-headings. Keeps prose out of raw
 * `<p>`/`<span>` tags with hardcoded sizes so type stays on the token scale.
 */
export function Text({
  as: Tag = 'p',
  size = 'body',
  tone = 'default',
  weight,
  mono = false,
  align,
  className,
  style,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={cx(
        'he-text',
        `he-text--${size}`,
        tone !== 'default' && `he-text--${tone}`,
        weight === 'medium' && 'he-text--medium',
        mono && 'he-text--mono',
        className,
      )}
      style={align ? ({ textAlign: align, ...style } as CSSProperties) : style}
      {...rest}
    />
  );
}
