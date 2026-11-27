import type { SVGProps } from 'react';
import { cx } from '../../lib/cx';
import { icons, type IconName } from './icons';

export type { IconName };
export { icons };

export type IconSize = 12 | 14 | 16 | 20 | 24;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'children'> {
  name: IconName;
  /** Rendered size in px. The stroke is rescaled so it stays 1.5px on screen. */
  size?: IconSize;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string;
}

export function Icon({ name, size = 16, label, className, ...rest }: IconProps) {
  const labelled = label !== undefined && label !== '';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={(1.5 * 24) / size}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? label : undefined}
      {...rest}
      className={cx('he-icon', className)}
      // Markup comes from the vendored, static icons record, never from user input.
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}
