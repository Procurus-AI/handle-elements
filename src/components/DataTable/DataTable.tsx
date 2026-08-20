import {
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';

export type DataTableAlign = 'start' | 'center' | 'end';

export type SortDirection = 'asc' | 'desc';

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
  /** Value used for comparison when sorting (defaults to `row[key]`). */
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  align?: DataTableAlign;
  /** Any valid CSS width (e.g. '120px', '20%'). */
  width?: string;
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
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
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

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columnByKey.get(sort.key);
    if (!col) return data;
    const accessor = col.sortValue ?? ((row: T) => (row as Record<string, unknown>)[col.key] as never);
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => defaultCompare(accessor(a), accessor(b)) * dir);
  }, [data, sort, columnByKey]);

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
      className={cx('he-table', card && 'he-table--card', dense && 'he-table--dense', className)}
      {...rest}
    >
      {toolbar != null && <div className="he-table__toolbar">{toolbar}</div>}
      <div className="he-table__scroll">
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
            {sortedData.length === 0 ? (
              <tr className="he-table__empty-row">
                <td className="he-table__empty" colSpan={columns.length}>
                  {emptyState}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
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
                      className={cx('he-table__td', col.align && `he-table__cell--${col.align}`, col.className)}
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
