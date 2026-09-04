import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';

export type SectionTier = 'section' | 'sub';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Heading text. */
  title: ReactNode;
  /**
   * Quiet tabular count printed after the title. Omit it when the number is
   * already restated by the section's own children.
   */
  count?: ReactNode;
  /** Right-aligned trailing control — use `SectionLink`. */
  action?: ReactNode;
  /** `section` (default) is the bold-sans block head; `sub` is the mono-caps sub-head. */
  tier?: SectionTier;
  /** Heading level. Defaults: section → h2, sub → h3. */
  as?: 'h2' | 'h3' | 'h4';
  /** One dim line rendered INSTEAD of children when there is nothing to show. */
  empty?: ReactNode;
  /** Bleed the body to the containing surface's inset so hairline rows span it edge to edge. */
  flush?: boolean;
}

/**
 * A borderless titled block: heading + optional count + optional trailing
 * action. Deliberately NOT a surface — a Section inside a Panel or a Drawer adds
 * no border, no background and no padding, so grouping content never becomes
 * cards inside cards. Panel is the bordered version of the same shape.
 */
export function Section({
  title,
  count,
  action,
  tier = 'section',
  as,
  empty,
  flush = false,
  className,
  children,
  ...rest
}: SectionProps) {
  const Heading = as ?? (tier === 'sub' ? 'h3' : 'h2');
  const showEmpty = empty != null && (children == null || children === false);

  return (
    <section
      className={cx('he-section', `he-section--${tier}`, flush && 'he-section--flush', className)}
      {...rest}
    >
      <div className="he-section__head">
        <Heading className="he-section__title">{title}</Heading>
        {count != null && <span className="he-section__count">{count}</span>}
        {action != null && <div className="he-section__action">{action}</div>}
      </div>
      {showEmpty ? (
        <p className="he-section__empty">{empty}</p>
      ) : (
        <div className="he-section__body">{children}</div>
      )}
    </section>
  );
}

export interface SectionLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement> & ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  href?: string;
  /** Trailing glyph. Default 'arrow'; use 'none' for an action like "Add document". */
  glyph?: 'arrow' | 'none';
}

/**
 * The quiet trailing control for a Section head. Not `Button variant="link"`
 * (underlined) and not `ghost size="xs"` (a 25px pill): this is a caps-adjacent
 * text link with an optional arrow, sized to sit on a section heading baseline.
 */
export function SectionLink({ href, glyph = 'arrow', className, children, ...rest }: SectionLinkProps) {
  const content = (
    <>
      {children}
      {glyph === 'arrow' && (
        <svg
          className="he-section__link-glyph"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path
            d="M2.5 6h7M6.5 3l3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  if (href != null) {
    return (
      <a href={href} className={cx('he-section__link', className)} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={cx('he-section__link', className)} {...rest}>
      {content}
    </button>
  );
}
