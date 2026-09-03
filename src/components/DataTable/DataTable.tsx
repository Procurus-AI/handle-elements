import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';

export type DataTableAlign = 'start' | 'center' | 'end';

export type SortDirection = 'asc' | 'desc';

/** `fixed` switches the table to `table-layout: fixed`, making `column.width` binding. */
export type DataTableLayout = 'auto' | 'fixed';

/** Where empty sort values land. `auto` is the legacy behaviour (direction-dependent). */
export type DataTableNulls = 'first' | 'last' | 'auto';

export interface DataTableSort {
  key: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** Stable identifier — also the object key used for default sort/cell access. */
  key: string;
  header: ReactNode;
  /** Custom cell renderer. Falls back to `String(row[key])`. */
  render?: (row: T, index: number) => ReactNode;
  /** Enable click-to-sort on this column's header. */
  sortable?: boolean;
  /**
   * Value used for comparison when sorting (defaults to `row[key]`). A `Date`
   * is compared by timestamp — without this it would reach `String()` and sort
   * by the spelling of its day name.
   */
  sortValue?: (row: T) => string | number | boolean | Date | null | undefined;
  /**
   * Where null/undefined sort values land, INDEPENDENT of direction. Default
   * `auto` keeps today's behaviour (nulls lead on asc, trail on desc). Use
   * `last` for suspect/absent data that must never head the view.
   */
  nulls?: DataTableNulls;
  align?: DataTableAlign;
  /** Any valid CSS width (e.g. '120px', '20%'). */
  width?: string;
  /**
   * Clip + ellipsise this column's cells instead of letting them grow. Under the
   * default `layout='auto'` the column may still exceed `width`, but the table
   * stops overflowing its container (measured) and the ellipsis engages; use
   * `layout='fixed'` for an exact budget.
   */
  truncate?: boolean;
  /** Extra class on every cell + header in this column. */
  className?: string;
}

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Stable React key per row. Defaults to the row index. */
  rowKey?: (row: T, index: number) => string | number;
  onRowClick?: (row: T, index: number) => void;
  /** Controlled sort. Omit for internal (uncontrolled) sorting. */
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Initial sort for uncontrolled mode. */
  defaultSort?: DataTableSort | null;
  /** Wrap the table in a bordered Card surface (default true). */
  card?: boolean;
  /** Tighter row padding. */
  dense?: boolean;
  /** Shown in the tbody when `data` is empty. */
  emptyState?: ReactNode;
  /** Optional heading row above the table (title, actions…). */
  toolbar?: ReactNode;
  /**
   * Client-side text filter. Rows are kept when the query is found in any
   * `filterKeys` column (or every column's raw value when `filterKeys` is
   * omitted). Case-insensitive. Leave undefined to filter in the app instead.
   */
  globalFilter?: string;
  /** Restrict which columns the `globalFilter` searches. */
  filterKeys?: string[];
  /** Custom predicate — overrides the default substring match. */
  filterFn?: (row: T, query: string) => boolean;
  /** Notified with the filtered (pre-sort) rows — drive a ResultCount from it. */
  onFilteredChange?: (rows: T[]) => void;
  /**
   * Pin the header while the body scrolls. Requires `maxHeight`; the card root
   * is `overflow: hidden`, so without a scroll ceiling there is nothing for the
   * header to stick against.
   */
  stickyHeader?: boolean;
  /** Scroll ceiling on the inner scroller. A number is treated as px. */
  maxHeight?: number | string;
  /** Row rendered under the table, inside the card frame — e.g. pagination. */
  footer?: ReactNode;
  /** `fixed` makes every `column.width` binding; slack goes to the unset columns. */
  layout?: DataTableLayout;
  /** 1-based page, applied AFTER filter and sort. Ignored unless `pageSize` is set. */
  page?: number;
  /**
   * Rows per page. Omit for no paging. Paging lives here rather than in the
   * caller because DataTable owns the sort — slicing upstream would sort only
   * the visible page.
   */
  pageSize?: number;
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  sort: controlledSort,
  onSortChange,
  defaultSort = null,
  card = true,
  dense = false,
  emptyState = 'No data',
  toolbar,
  globalFilter,
  filterKeys,
  filterFn,
  onFilteredChange,
  stickyHeader = false,
  maxHeight,
  footer,
  layout = 'auto',
  page = 1,
  pageSize,
  className,
  ...rest
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<DataTableSort | null>(defaultSort);
  const isControlled = controlledSort !== undefined;
  const sort = isControlled ? controlledSort : internalSort;

  const columnByKey = useMemo(() => {
    const map = new Map<string, DataTableColumn<T>>();
    for (const col of columns) map.set(col.key, col);
    return map;
  }, [columns]);

  const filteredData = useMemo(() => {
    const query = (globalFilter ?? '').trim().toLowerCase();
    if (!query) return data;
    const keys = filterKeys ?? columns.map((c) => c.key);
    return data.filter((row) => {
      if (filterFn) return filterFn(row, query);
      return keys.some((k) => {
        const value = (row as Record<string, unknown>)[k];
        return value != null && String(value).toLowerCase().includes(query);
      });
    });
  }, [data, globalFilter, filterKeys, filterFn, columns]);

  // The callback is held in a ref and kept out of the dep array on purpose: an
  // inline arrow is a new identity every render, so depending on it turns any
  // caller that sets state here into an infinite loop.
  const filteredCb = useRef(onFilteredChange);
  filteredCb.current = onFilteredChange;
  useEffect(() => {
    filteredCb.current?.(filteredData);
  }, [filteredData]);

  const sortedData = useMemo(() => {
    if (!sort) return filteredData;
    const col = columnByKey.get(sort.key);
    if (!col) return filteredData;
    const accessor = col.sortValue ?? ((row: T) => (row as Record<string, unknown>)[col.key] as never);
    const dir = sort.direction === 'asc' ? 1 : -1;
    const nulls = col.nulls ?? 'auto';
    return [...filteredData].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (nulls !== 'auto') {
        // Deliberately NOT multiplied by `dir`: the whole point is that empty /
        // suspect values keep their side of the table across an asc↔desc flip.
        const an = av == null;
        const bn = bv == null;
        if (an && bn) return 0;
        if (an) return nulls === 'last' ? 1 : -1;
        if (bn) return nulls === 'last' ? -1 : 1;
      }
      return defaultCompare(av, bv) * dir;
    });
  }, [filteredData, sort, columnByKey]);

  const pagedData = useMemo(() => {
    if (!pageSize || pageSize <= 0) return sortedData;
    const start = (Math.max(1, Math.floor(page) || 1) - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    let next: DataTableSort | null;
    if (!sort || sort.key !== col.key) next = { key: col.key, direction: 'asc' };
    else if (sort.direction === 'asc') next = { key: col.key, direction: 'desc' };
    else next = null;
    if (!isControlled) setInternalSort(next);
    onSortChange?.(next);
  };

  return (
    <div
      className={cx(
        'he-table',
        card && 'he-table--card',
        dense && 'he-table--dense',
        stickyHeader && 'he-table--sticky',
        layout === 'fixed' && 'he-table--fixed',
        className,
      )}
      {...rest}
    >
      {toolbar != null && <div className="he-table__toolbar">{toolbar}</div>}
      <div
        className="he-table__scroll"
        style={maxHeight != null ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        <table className="he-table__el">
          <thead className="he-table__head">
            <tr>
              {columns.map((col) => {
                const active = sort?.key === col.key;
                const ariaSort = !col.sortable
                  ? undefined
                  : active
                    ? sort!.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none';
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    style={col.width ? { width: col.width } : undefined}
                    className={cx(
                      'he-table__th',
                      col.align && `he-table__cell--${col.align}`,
                      col.sortable && 'he-table__th--sortable',
                      active && 'he-table__th--active',
                      col.truncate && 'he-table__th--truncate',
                      col.className,
                    )}
                  >
                    {col.sortable ? (
                      <button type="button" className="he-table__sort" onClick={() => toggleSort(col)}>
                        <span>{col.header}</span>
                        <span aria-hidden className="he-table__sort-glyph">
                          {active ? (sort!.direction === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="he-table__body">
            {pagedData.length === 0 ? (
              <tr className="he-table__empty-row">
                <td className="he-table__empty" colSpan={columns.length}>
                  {emptyState}
                </td>
              </tr>
            ) : (
              pagedData.map((row, index) => (
                <tr
                  key={rowKey ? rowKey(row, index) : index}
                  className={cx('he-table__row', onRowClick && 'he-table__row--clickable')}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  // Keyboard access for row-click-to-drawer: focusable rows that
                  // activate on Enter/Space, so the pattern is not mouse-only.
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e: KeyboardEvent<HTMLTableRowElement>) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(row, index);
                          }
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cx(
                        'he-table__td',
                        col.align && `he-table__cell--${col.align}`,
                        col.truncate && 'he-table__td--truncate',
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(row, index)
                        : ((row as Record<string, unknown>)[col.key] as ReactNode) ?? null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Sibling of the scroller, not a child: it stays visible while the body scrolls. */}
      {footer != null && <div className="he-table__footer">{footer}</div>}
    </div>
  );
}

export interface TableCellProps {
  /** Leading slot — avatar, rank badge, status dot, icon. */
  media?: ReactNode;
  /** Primary line. Falls back to `children`. */
  primary?: ReactNode;
  /** Secondary line under the primary (dim). */
  secondary?: ReactNode;
  /** Trailing node pinned to the cell's end (delta, chevron, menu…). */
  trailing?: ReactNode;
  align?: DataTableAlign;
  /** Tabular numerals for the primary line (metrics/amounts). */
  mono?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Composite cell for nested table content — leading media + a stacked
 * primary/secondary label + an optional trailing node. Use inside a column's
 * `render` to build leaderboard-style rows without bespoke markup.
 */
export function TableCell({
  media,
  primary,
  secondary,
  trailing,
  align,
  mono = false,
  className,
  children,
}: TableCellProps) {
  return (
    <div
      className={cx(
        'he-table__cell',
        align && `he-table__cell--${align}`,
        mono && 'he-table__cell--mono',
        className,
      )}
    >
      {media != null && <span className="he-table__cell-media">{media}</span>}
      <span className="he-table__cell-body">
        <span className="he-table__cell-primary">{primary ?? children}</span>
        {secondary != null && <span className="he-table__cell-secondary">{secondary}</span>}
      </span>
      {trailing != null && <span className="he-table__cell-trailing">{trailing}</span>}
    </div>
  );
}
