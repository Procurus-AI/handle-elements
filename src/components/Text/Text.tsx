import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

/** 0.4.5 size steps. Each maps onto a Figma type style (see `SIZE_VARIANT`). */
export type TextSize = 'caption' | 'sm' | 'body' | 'heading';

/** The 16 Figma type styles. */
export type TextVariant =
  | 'display'
  | 'display-sm'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'body-md'
  | 'body-md-emphasis'
  | 'body-sm'
  | 'body-sm-emphasis'
  | 'label-md'
  | 'label-sm'
  | 'caption'
  | 'metric-xl'
  | 'metric-lg'
  | 'metric-md'
  | 'mono-sm';

/** Only tones that pass contrast as text (never accent). `secondary` = `dim`, `tertiary` = `faint`. */
export type TextTone = 'default' | 'dim' | 'faint' | 'secondary' | 'tertiary';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'small' | 'label';
  /** Figma type style. Wins over `size`. */
  variant?: TextVariant;
  /** 0.4.5 font size step, used when `variant` is not set. Default `body`. */
  size?: TextSize;
  /** Text color. Default `default`. */
  tone?: TextTone;
  weight?: 'regular' | 'medium';
  /** Render in the mono family. */
  mono?: boolean;
  align?: 'start' | 'center' | 'end';
}

const SIZE_VARIANT: Record<TextSize, TextVariant> = {
  caption: 'caption',
  sm: 'body-sm',
  body: 'body-md',
  heading: 'heading-md',
};

/** Typographic text on the v1 type scale: captions, notes, headings, metrics. */
export function Text({
  as: Tag = 'p',
  variant,
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
        `he-text--${variant ?? SIZE_VARIANT[size]}`,
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
