import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  lines?: number;
  animated?: boolean;
}

type SkeletonStyle = CSSProperties & {
  '--he-skeleton-width'?: string;
  '--he-skeleton-height'?: string;
};

/**
 * `width`/`height` land in a CUSTOM PROPERTY, and React only appends `px` to
 * known CSS properties — never to a `--*` one. So `height={34}` emitted
 * `--he-skeleton-height: 34`, which makes `height: var(--he-skeleton-height)`
 * invalid at computed-value time: the element fell back to `height: auto` and
 * an empty span rendered 0px tall. Every numeric-sized skeleton in the app was
 * therefore invisible (a loading panel that read as blank). `CSSProperties`
 * admits `number`, so TypeScript never flagged it.
 */
function cssLength(value: CSSProperties['width' | 'height']): string | undefined {
  if (value == null) return undefined;
  return typeof value === 'number' ? `${value}px` : String(value);
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  animated = true,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const skeletonStyle: SkeletonStyle = {
    '--he-skeleton-width': cssLength(width),
    '--he-skeleton-height': cssLength(height),
    ...style,
  };

  if (lines <= 1) {
    return (
      <span
        aria-hidden
        className={cx(
          'he-skeleton',
          `he-skeleton--${variant}`,
          animated && 'he-skeleton--animated',
          className,
        )}
        style={skeletonStyle}
        {...rest}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cx('he-skeleton-group', animated && 'he-skeleton-group--animated', className)}
      style={style}
      {...rest}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <span
          key={index}
          className={cx('he-skeleton', 'he-skeleton--text', animated && 'he-skeleton--animated')}
          style={{
            '--he-skeleton-width': index === lines - 1 ? '72%' : cssLength(width),
            '--he-skeleton-height': cssLength(height),
          } as SkeletonStyle}
        />
      ))}
    </span>
  );
}
