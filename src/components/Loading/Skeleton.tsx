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
  '--he-skeleton-width'?: CSSProperties['width'];
  '--he-skeleton-height'?: CSSProperties['height'];
};

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
    '--he-skeleton-width': width,
    '--he-skeleton-height': height,
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
            '--he-skeleton-width': index === lines - 1 ? '72%' : width,
            '--he-skeleton-height': height,
          } as SkeletonStyle}
        />
      ))}
    </span>
  );
}
