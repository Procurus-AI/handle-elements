import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Select } from '../Input/Select';

/* Same chevrons the Calendar header uses — kept local so each component owns
 * its glyphs (no shared icon module in this package). */
const ChevronLeft = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
    <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
    <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface PageRange {
  page: number;
  pageCount: number;
  from: number;
  to: number;
}

/**
 * The one place the page arithmetic lives — exported so a caller can slice its
 * own array (`rows.slice(from - 1, to)`) with the exact numbers the footer prints.
 */
export function pageRange(page: number, pageSize: number, total: number): PageRange {
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  return { page: current, pageCount, from, to };
}

export interface PaginationLabels {
  /** Default: `1–50 of 4,592` (en dash, Intl grouping); `0 of 0` when empty. */
  range?: (from: number, to: number, total: number) => ReactNode;
  /** Default: `50 / page`. */
  pageSize?: (size: number) => ReactNode;
  /** Compact readout between the arrows. Default: `1 / 92`. */
  page?: (page: number, pageCount: number) => ReactNode;
  /** aria-label on the `<nav>`. Default `Pagination`. */
  nav?: string;
  /** aria-label on the page-size `<select>`. Default `Rows per page`. */
  pageSizeAria?: string;
  /** Default `Previous page`. */
  previous?: string;
  /** Default `Next page`. */
  next?: string;
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** 1-based, controlled. Clamped to `[1, pageCount]` for display only — never calls back to correct it. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
  /** Default `[25, 50, 100]`. Pass `[]` to hide the select entirely. */
  pageSizeOptions?: number[];
  /** Does NOT reset `page` — the caller owns that. */
  onPageSizeChange?: (size: number) => void;
  labels?: PaginationLabels;
  /** Number-grouping locale for the default label functions. */
  locale?: string;
  /** Drop the range readout and the page-size select; keep `p / n` between the arrows. */
  compact?: boolean;
  /** 25px arrows / 14px glyphs — matches a `dense` DataTable footer. */
  dense?: boolean;
  disabled?: boolean;
}

/**
 * Record-index footer: `1–50 of 4,592`, a rows-per-page select and prev/next.
 * Driven purely by `(page, pageSize, total)`, so it works the same over a
 * client-side array or a server cursor.
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions = [25, 50, 100],
  onPageSizeChange,
  labels,
  locale,
  compact = false,
  dense = false,
  disabled = false,
  className,
  ...rest
}: PaginationProps) {
  const { page: current, pageCount, from, to } = pageRange(page, pageSize, total);
  const nf = (n: number) => new Intl.NumberFormat(locale).format(n);

  const rangeNode = labels?.range
    ? labels.range(from, to, total)
    : total === 0
      ? '0 of 0'
      : `${nf(from)}–${nf(to)} of ${nf(total)}`;
  const pageNode = labels?.page ? labels.page(current, pageCount) : `${nf(current)} / ${nf(pageCount)}`;
  const sizeLabel = (n: number) => (labels?.pageSize ? labels.pageSize(n) : `${nf(n)} / page`);

  const atStart = disabled || current <= 1;
  const atEnd = disabled || current >= pageCount;

  return (
    <nav
      className={cx(
        'he-pagination',
        compact && 'he-pagination--compact',
        dense && 'he-pagination--dense',
        className,
      )}
      aria-label={labels?.nav ?? 'Pagination'}
      {...rest}
    >
      {/* The live region: paging swaps rows, which AT never re-reads — the
       * readout changing is the announcement, and it takes no focus. */}
      {!compact && (
        <span className="he-pagination__range" aria-live="polite" aria-atomic="true">
          {rangeNode}
        </span>
      )}
      <div className="he-pagination__controls">
        {!compact && pageSizeOptions.length > 0 && (
          <Select
            variant="ghost"
            size="sm"
            aria-label={labels?.pageSizeAria ?? 'Rows per page'}
            value={pageSize}
            disabled={disabled}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {sizeLabel(n)}
              </option>
            ))}
          </Select>
        )}
        <button
          type="button"
          className="he-pagination__arrow"
          aria-label={labels?.previous ?? 'Previous page'}
          disabled={atStart}
          onClick={() => {
            if (!atStart) onPageChange?.(current - 1);
          }}
        >
          {ChevronLeft}
        </button>
        {compact && (
          <span className="he-pagination__page" aria-live="polite" aria-atomic="true">
            {pageNode}
          </span>
        )}
        <button
          type="button"
          className="he-pagination__arrow"
          aria-label={labels?.next ?? 'Next page'}
          disabled={atEnd}
          onClick={() => {
            if (!atEnd) onPageChange?.(current + 1);
          }}
        >
          {ChevronRight}
        </button>
      </div>
    </nav>
  );
}
