import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';
import { useIsomorphicLayoutEffect } from '../../lib/useIsomorphicLayoutEffect';
import { Checkbox } from '../Checkbox/Checkbox';
import { Icon } from '../Icon/Icon';
import { Skeleton } from '../Loading/Skeleton';

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
  /** Amounts and counts: right-aligned (unless `align` says otherwise) with tabular numerals. */
  numeric?: boolean;
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
  /**
   * Renders this column's cell in the table's `<tfoot>` totals row, receiving
   * every filtered (pre-page) row — return a sum, count, or label. A footer row
   * is drawn only when at least one column defines this; columns that don't
   * leave an empty cell, so a total lands under exactly its column.
   */
  footer?: (rows: T[]) => ReactNode;
}

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Accessible table name. Rendered visually above the header unless `captionHidden` is true. */
  caption?: ReactNode;
  /** Keeps `caption` available to assistive technology without adding a visible table title. */
  captionHidden?: boolean;
  /**
   * Stable key per row, used for selection and expansion. `index` is the row's position in the
   * original `data` array (not its position after filter, sort or paging). Defaults to that index.
   */
  rowKey?: (row: T, index: number) => string | number;
  onRowClick?: (row: T, index: number) => void;
  /**
   * Marks the row backing an open drawer/detail view. Painted as a --he-surface-2
   * fill plus a weight step on the first cell — never an edge bar.
   */
  isRowSelected?: (row: T, index: number) => boolean;
  /** Controlled sort. Omit for internal (uncontrolled) sorting. */
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Initial sort for uncontrolled mode. */
  defaultSort?: DataTableSort | null;
  /** Wrap the table in a bordered Card surface (default true). */
  card?: boolean;
  /** Tighter row padding. */
  dense?: boolean;
  /**
   * Shown when there is nothing to list. It REPLACES the whole table, headers included
   * (an empty table with column titles reads as a broken one). Pass an `EmptyState`.
   */
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
  /**
   * Full-width detail rendered in a recessed row directly beneath its row when
   * expanded. Return `null` for rows with nothing to reveal — those get no
   * chevron and stay inert. Supplying this prop prepends a narrow expander
   * column with a rotating chevron; when `onRowClick` is unset the whole row
   * also toggles expansion.
   */
  renderExpanded?: (row: T, index: number) => ReactNode;
  /** Controlled set of expanded row keys (values from `rowKey`). Omit for uncontrolled. */
  expandedKeys?: Array<string | number>;
  onExpandedChange?: (keys: Array<string | number>) => void;
  /** Initially expanded keys for uncontrolled mode. */
  defaultExpandedKeys?: Array<string | number>;
  /** Accessible label for the expander toggle. Default 'Mostrar detalle'. */
  expandLabel?: string;
  /**
   * Trailing actions for a row: icon buttons, a menu. Rendered in a pinned end column and
   * ALWAYS visible: an action that appears on hover is invisible to touch and keyboard
   * users, and the team reported not finding it.
   */
  rowActions?: (row: T, index: number) => ReactNode;
  /** Hidden header text of the row-actions column. Default 'Acciones'. */
  actionsLabel?: string;
  /** Adds a leading checkbox column. The header checkbox selects every row on the current page. */
  selectable?: boolean;
  /** Controlled set of selected row keys (values from `rowKey`). Omit for uncontrolled. */
  selectedKeys?: Array<string | number>;
  /** Initially selected keys for uncontrolled mode. */
  defaultSelectedKeys?: Array<string | number>;
  onSelectionChange?: (keys: Array<string | number>) => void;
  /** Accessible label of each row checkbox (default 'Seleccionar fila'). */
  selectLabel?: string;
  /** Accessible label of the header checkbox (default 'Seleccionar todas las filas'). */
  selectAllLabel?: string;
  /** Shows skeleton rows in place of the data and sets `aria-busy`. Headers stay. */
  loading?: boolean;
  /** How many skeleton rows to show while `loading` (default 5). */
  loadingRows?: number;
  /** `fixed` makes every `column.width` binding; slack goes to the unset columns. */
  layout?: DataTableLayout;
  /** Optional minimum width for the table canvas; narrower containers scroll instead of crushing cells. */
  minTableWidth?: number | string;
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
  caption,
  captionHidden = false,
  rowKey,
  onRowClick,
  isRowSelected,
  sort: controlledSort,
  onSortChange,
  defaultSort = null,
  card = true,
  dense = false,
  emptyState = 'Sin datos',
  toolbar,
  globalFilter,
  filterKeys,
  filterFn,
  onFilteredChange,
  stickyHeader = false,
  maxHeight,
  footer,
  renderExpanded,
  expandedKeys,
  onExpandedChange,
  defaultExpandedKeys,
  expandLabel = 'Mostrar detalle',
  actionsLabel = 'Acciones',
  rowActions,
  selectable = false,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  selectLabel = 'Seleccionar fila',
  selectAllLabel = 'Seleccionar todas las filas',
  loading = false,
  loadingRows = 5,
  layout = 'auto',
  minTableWidth,
  page = 1,
  pageSize,
  className,
  ...rest
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<DataTableSort | null>(defaultSort);
  const isControlled = controlledSort !== undefined;
  const sort = isControlled ? controlledSort : internalSort;

  const [internalExpanded, setInternalExpanded] = useState<Set<string | number>>(
    () => new Set(defaultExpandedKeys ?? []),
  );
  const isExpandControlled = expandedKeys !== undefined;
  const expandedSet = useMemo(
    () => new Set(isExpandControlled ? expandedKeys : internalExpanded),
    [isExpandControlled, expandedKeys, internalExpanded],
  );
  // Keys follow the record: `origin` is the row's index in the original `data`, carried through
  // filter, sort and paging, so selection never moves to another record.
  const keyOf = (row: T, origin: number): string | number =>
    rowKey ? rowKey(row, origin) : origin;
  const toggleExpand = (key: string | number) => {
    const next = new Set(expandedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    if (!isExpandControlled) setInternalExpanded(next);
    onExpandedChange?.([...next]);
  };

  const [internalChecked, setInternalChecked] = useState<Set<string | number>>(
    () => new Set(defaultSelectedKeys ?? []),
  );
  const isCheckControlled = selectedKeys !== undefined;
  const checkedSet = useMemo(
    () => new Set(isCheckControlled ? selectedKeys : internalChecked),
    [isCheckControlled, selectedKeys, internalChecked],
  );
  const commitChecked = (next: Set<string | number>) => {
    if (!isCheckControlled) setInternalChecked(next);
    onSelectionChange?.([...next]);
  };

  const hasExpander = renderExpanded != null;
  const hasActions = rowActions != null;
  const hasFooterRow = columns.some((c) => c.footer != null);
  const totalCols =
    columns.length + (hasExpander ? 1 : 0) + (hasActions ? 1 : 0) + (selectable ? 1 : 0);

  const columnByKey = useMemo(() => {
    const map = new Map<string, DataTableColumn<T>>();
    for (const col of columns) map.set(col.key, col);
    return map;
  }, [columns]);

  const filteredEntries = useMemo(() => {
    const entries = data.map((row, origin) => ({ row, origin }));
    const query = (globalFilter ?? '').trim().toLowerCase();
    if (!query) return entries;
    const keys = filterKeys ?? columns.map((c) => c.key);
    return entries.filter(({ row }) => {
      if (filterFn) return filterFn(row, query);
      return keys.some((k) => {
        const value = (row as Record<string, unknown>)[k];
        return value != null && String(value).toLowerCase().includes(query);
      });
    });
  }, [data, globalFilter, filterKeys, filterFn, columns]);

  const filteredData = useMemo(() => filteredEntries.map((e) => e.row), [filteredEntries]);

  // The callback is held in a ref and kept out of the dep array on purpose: an
  // inline arrow is a new identity every render, so depending on it turns any
  // caller that sets state here into an infinite loop.
  const filteredCb = useRef(onFilteredChange);
  filteredCb.current = onFilteredChange;
  useEffect(() => {
    filteredCb.current?.(filteredData);
  }, [filteredData]);

  const sortedEntries = useMemo(() => {
    if (!sort) return filteredEntries;
    const col = columnByKey.get(sort.key);
    if (!col) return filteredEntries;
    const accessor = col.sortValue ?? ((row: T) => (row as Record<string, unknown>)[col.key] as never);
    const dir = sort.direction === 'asc' ? 1 : -1;
    const nulls = col.nulls ?? 'auto';
    return [...filteredEntries].sort((ea, eb) => {
      const av = accessor(ea.row);
      const bv = accessor(eb.row);
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
  }, [filteredEntries, sort, columnByKey]);

  const sortedData = useMemo(() => sortedEntries.map((e) => e.row), [sortedEntries]);

  const pagedEntries = useMemo(() => {
    if (!pageSize || pageSize <= 0) return sortedEntries;
    const start = (Math.max(1, Math.floor(page) || 1) - 1) * pageSize;
    return sortedEntries.slice(start, start + pageSize);
  }, [sortedEntries, page, pageSize]);

  const pageKeys = pagedEntries.map(({ row, origin }) => keyOf(row, origin));
  const checkedOnPage = pageKeys.filter((k) => checkedSet.has(k)).length;
  const allChecked = pageKeys.length > 0 && checkedOnPage === pageKeys.length;
  const toggleAll = () => {
    const next = new Set(checkedSet);
    for (const k of pageKeys) {
      if (allChecked) next.delete(k);
      else next.add(k);
    }
    commitChecked(next);
  };
  const toggleChecked = (key: string | number) => {
    const next = new Set(checkedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    commitChecked(next);
  };

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    let next: DataTableSort | null;
    if (!sort || sort.key !== col.key) next = { key: col.key, direction: 'asc' };
    else if (sort.direction === 'asc') next = { key: col.key, direction: 'desc' };
    else next = null;
    if (!isControlled) setInternalSort(next);
    onSortChange?.(next);
  };

  // A scroll region needs keyboard access (axe: scrollable-region-focusable). Only a region
  // that actually overflows becomes a tab stop, so a table that fits adds none.
  const isEmpty = !loading && pagedEntries.length === 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () =>
      setScrollable(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
    // Re-measure when the content that sizes the region changes; the observer covers resizes.
  }, [pagedEntries, loading, columns, dense, layout, minTableWidth, maxHeight, isEmpty]);

  const regionName = typeof caption === 'string' ? caption : 'Tabla de datos';

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
      aria-busy={loading || undefined}
      {...rest}
    >
      {toolbar != null && <div className="he-table__toolbar">{toolbar}</div>}
      {isEmpty ? (
        <div className="he-table__empty">{emptyState}</div>
      ) : (
        <div
          ref={scrollRef}
          className="he-table__scroll"
          style={maxHeight != null ? { maxHeight, overflowY: 'auto' } : undefined}
          {...(scrollable ? { tabIndex: 0, role: 'region', 'aria-label': regionName } : {})}
        >
          <table
            className="he-table__el"
            style={
              minTableWidth == null
                ? undefined
                : ({
                    minWidth:
                      typeof minTableWidth === 'number' ? `${minTableWidth}px` : minTableWidth,
                  } as CSSProperties)
            }
          >
            {caption != null && (
              <caption
                className={cx(
                  'he-table__caption',
                  captionHidden && 'he-table__caption--hidden',
                )}
              >
                {caption}
              </caption>
            )}
            <thead className="he-table__head">
              <tr>
                {selectable && (
                  <th scope="col" className="he-table__th he-table__select-cell">
                    <Checkbox
                      aria-label={selectAllLabel}
                      checked={allChecked}
                      indeterminate={checkedOnPage > 0 && !allChecked}
                      disabled={loading || pageKeys.length === 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {hasExpander && (
                  <th scope="col" className="he-table__th he-table__expander-cell">
                    <span className="he-table__sr">{expandLabel}</span>
                  </th>
                )}
                {columns.map((col) => {
                  const active = sort?.key === col.key;
                  const align = col.align ?? (col.numeric ? 'end' : undefined);
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
                        align && `he-table__cell--${align}`,
                        col.sortable && 'he-table__th--sortable',
                        active && 'he-table__th--active',
                        col.truncate && 'he-table__th--truncate',
                        col.className,
                      )}
                    >
                      {col.sortable ? (
                        <button type="button" className="he-table__sort" onClick={() => toggleSort(col)}>
                          <span>{col.header}</span>
                          <Icon
                            name={active && sort!.direction === 'desc' ? 'chevron-down' : 'chevron-up'}
                            size={12}
                            className="he-table__sort-glyph"
                          />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
                {hasActions && (
                  <th scope="col" className="he-table__th he-table__actions-cell">
                    <span className="he-table__sr">{actionsLabel}</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="he-table__body">
              {loading
                ? Array.from({ length: Math.max(1, loadingRows) }, (_, r) => (
                    <tr key={r} className="he-table__row he-table__row--loading">
                      {Array.from({ length: totalCols }, (_, c) => (
                        <td key={c} className="he-table__td">
                          <Skeleton width={c === 0 ? '60%' : '80%'} aria-hidden />
                        </td>
                      ))}
                    </tr>
                  ))
                : pagedEntries.map(({ row, origin }, index) => {
                    const detailOpen = isRowSelected?.(row, index) ?? false;
                    const key = keyOf(row, origin);
                    const checked = selectable && checkedSet.has(key);
                    const expandedContent = hasExpander ? renderExpanded!(row, index) : null;
                    const canExpand = expandedContent != null;
                    const isExpanded = canExpand && expandedSet.has(key);
                    // Row-level activation: onRowClick wins; otherwise an expandable
                    // row toggles its own detail. A row with neither stays inert.
                    const activate = onRowClick
                      ? () => onRowClick(row, index)
                      : canExpand
                        ? () => toggleExpand(key)
                        : undefined;
                    return (
                      <Fragment key={key}>
                        <tr
                          className={cx(
                            'he-table__row',
                            activate && 'he-table__row--clickable',
                            (detailOpen || checked) && 'he-table__row--selected',
                            isExpanded && 'he-table__row--expanded',
                          )}
                          // aria-current, not aria-selected: the row is not in a grid.
                          aria-current={detailOpen ? 'true' : undefined}
                          onClick={activate}
                          // Keyboard access for row activation. The row keeps its table-row
                          // role: a role="button" row cannot contain the checkbox, expander
                          // and action buttons (axe: nested-interactive). Keys that bubble
                          // up from those controls are ignored.
                          tabIndex={activate ? 0 : undefined}
                          onKeyDown={
                            activate
                              ? (e: KeyboardEvent<HTMLTableRowElement>) => {
                                  if (e.target !== e.currentTarget) return;
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    activate();
                                  }
                                }
                              : undefined
                          }
                        >
                          {selectable && (
                            <td className="he-table__td he-table__select-cell" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                aria-label={selectLabel}
                                checked={checked}
                                onChange={() => toggleChecked(key)}
                              />
                            </td>
                          )}
                          {hasExpander && (
                            <td className="he-table__td he-table__expander-cell">
                              {canExpand && (
                                <button
                                  type="button"
                                  className={cx(
                                    'he-table__expander',
                                    isExpanded && 'he-table__expander--open',
                                  )}
                                  aria-expanded={isExpanded}
                                  aria-label={expandLabel}
                                  // Stop the row handler from double-firing.
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(key);
                                  }}
                                >
                                  <Icon name="chevron-right" size={12} />
                                </button>
                              )}
                            </td>
                          )}
                          {columns.map((col) => {
                            const align = col.align ?? (col.numeric ? 'end' : undefined);
                            return (
                              <td
                                key={col.key}
                                className={cx(
                                  'he-table__td',
                                  align && `he-table__cell--${align}`,
                                  col.numeric && 'he-table__cell--numeric',
                                  col.truncate && 'he-table__td--truncate',
                                  col.className,
                                )}
                              >
                                {col.render
                                  ? col.render(row, index)
                                  : ((row as Record<string, unknown>)[col.key] as ReactNode) ?? null}
                              </td>
                            );
                          })}
                          {hasActions && (
                            <td className="he-table__td he-table__actions-cell">
                              {/* Stop the row handler firing when an action is used. */}
                              <div
                                className="he-table__actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {rowActions!(row, index)}
                              </div>
                            </td>
                          )}
                        </tr>
                        {isExpanded && (
                          <tr className="he-table__expansion-row">
                            <td className="he-table__expansion" colSpan={totalCols}>
                              <div className="he-table__expansion-inner">{expandedContent}</div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
            </tbody>
            {hasFooterRow && !loading && (
              <tfoot className="he-table__foot">
                <tr>
                  {selectable && <td className="he-table__tf he-table__select-cell" />}
                  {hasExpander && <td className="he-table__tf he-table__expander-cell" />}
                  {columns.map((col) => {
                    const align = col.align ?? (col.numeric ? 'end' : undefined);
                    return (
                      <td
                        key={col.key}
                        className={cx(
                          'he-table__tf',
                          align && `he-table__cell--${align}`,
                          col.numeric && 'he-table__cell--numeric',
                          col.truncate && 'he-table__td--truncate',
                          col.className,
                        )}
                      >
                        {col.footer ? col.footer(sortedData) : null}
                      </td>
                    );
                  })}
                  {hasActions && <td className="he-table__tf he-table__actions-cell" />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
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
