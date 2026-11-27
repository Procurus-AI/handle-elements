import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import { Select } from '../Input/Select';

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
  /** Default: `1–50 de 4,592` (en dash, Intl grouping); `0 de 0` when empty. */
  range?: (from: number, to: number, total: number) => ReactNode;
  /** Default: `50 / página`. */
  pageSize?: (size: number) => ReactNode;
  /** Compact readout between the arrows. Default: `1 / 92`. */
  page?: (page: number, pageCount: number) => ReactNode;
  /** aria-label on the `<nav>`. Default `Paginación`. */
  nav?: string;
  /** aria-label on the page-size `<select>`. Default `Filas por página`. */
  pageSizeAria?: string;
  /** aria-label of the previous button. Default `Página anterior`. */
  previous?: string;
  /** aria-label of the next button. Default `Página siguiente`. */
  next?: string;
  /** Visible text of the previous button. Default `Anterior`. */
  previousText?: string;
  /** Visible text of the next button. Default `Siguiente`. */
  nextText?: string;
  /** aria-label of a page button. Default `Página 3`. It must contain the visible number (grouped, e.g. `1,079`). */
  pageButton?: (page: number) => string;
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

/** Page numbers to show: first, last and the current page with its neighbours; gaps become `null`. */
export function pageItems(current: number, pageCount: number): (number | null)[] {
  const keep = new Set([1, pageCount, current - 1, current, current + 1]);
  if (current === 1) keep.add(2);
  const sorted = [...keep].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && n - prev === 2) out.push(n - 1);
    else if (prev !== undefined && n - prev > 2) out.push(null);
    out.push(n);
  });
  return out;
}

/**
 * Record-index footer (Figma "Pagination"): `1–50 de 4,592` on the left, then prev / pages / next., a rows-per-page select and prev/next.
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
      ? '0 de 0'
      : `${nf(from)}–${nf(to)} de ${nf(total)}`;
  const pageNode = labels?.page ? labels.page(current, pageCount) : `${nf(current)} / ${nf(pageCount)}`;
  const sizeLabel = (n: number) => (labels?.pageSize ? labels.pageSize(n) : `${nf(n)} / página`);

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
      aria-label={labels?.nav ?? 'Paginación'}
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
            aria-label={labels?.pageSizeAria ?? 'Filas por página'}
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
          className="he-pagination__step"
          aria-label={labels?.previous ?? 'Página anterior'}
          disabled={atStart}
          onClick={() => {
            if (!atStart) onPageChange?.(current - 1);
          }}
        >
          <Icon name="chevron-left" />
          {!compact && <span>{labels?.previousText ?? 'Anterior'}</span>}
        </button>
        {compact ? (
          <span className="he-pagination__page" aria-live="polite" aria-atomic="true">
            {pageNode}
          </span>
        ) : (
          <ol className="he-pagination__pages">
            {pageItems(current, pageCount).map((n, i) => (
              <li key={n ?? `gap-${i}`}>
                {n === null ? (
                  <span className="he-pagination__gap" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    className={cx('he-pagination__num', n === current && 'he-pagination__num--current')}
                    aria-label={labels?.pageButton ? labels.pageButton(n) : `Página ${nf(n)}`}
                    aria-current={n === current ? 'page' : undefined}
                    disabled={disabled}
                    onClick={() => {
                      if (n !== current) onPageChange?.(n);
                    }}
                  >
                    {nf(n)}
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
        <button
          type="button"
          className="he-pagination__step"
          aria-label={labels?.next ?? 'Página siguiente'}
          disabled={atEnd}
          onClick={() => {
            if (!atEnd) onPageChange?.(current + 1);
          }}
        >
          {!compact && <span>{labels?.nextText ?? 'Siguiente'}</span>}
          <Icon name="chevron-right" />
        </button>
      </div>
    </nav>
  );
}
