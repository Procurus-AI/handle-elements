import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { AppShell } from '../AppShell/AppShell';
import { PageHeader } from '../PageHeader/PageHeader';
import { Panel } from '../Panel/Panel';

export interface ListPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The `Sidebar`. */
  sidebar: ReactNode;
  /** Page title (Sentient). */
  title: ReactNode;
  /** Actions on the right of the title row. One primary button per view. */
  actions?: ReactNode;
  /** A `Tabs` row under the title. */
  tabs?: ReactNode;
  /** Sync status panel above the stats. */
  notice?: ReactNode;
  /** A `StatStrip` of `StatCell`s. */
  stats?: ReactNode;
  /** Filter cards between the stats and the table. */
  filters?: ReactNode;
  /** Left side of the table toolbar: `SearchInput`, the Filtros button. */
  toolbar?: ReactNode;
  /** Right side of the table toolbar: the result count, a `Segmented`, Exportar. */
  toolbarEnd?: ReactNode;
  /** A `Pagination` under the table. */
  pagination?: ReactNode;
  /** Accessible name of the table panel. */
  tableLabel?: string;
  /** The `DataTable` (use `card={false}`: the panel is the frame). */
  children: ReactNode;
}

/**
 * List page template (Figma "Validación de pagos · Pendientes"): App shell, a page header and a
 * content column (padding 20/24/24/24, gap 12) with optional notice, stats and filters above
 * one table panel: toolbar, table and pagination.
 */
export function ListPage({
  sidebar,
  title,
  actions,
  tabs,
  notice,
  stats,
  filters,
  toolbar,
  toolbarEnd,
  pagination,
  tableLabel = 'Tabla de registros',
  children,
  className,
  ...rest
}: ListPageProps) {
  return (
    <AppShell sidebar={sidebar} className={cx('he-list-page', className)} {...rest}>
      <PageHeader inset title={title} aside={actions} tabs={tabs} />
      <div className="he-list-page__content">
        {notice}
        {stats}
        {filters != null && <div className="he-list-page__filters">{filters}</div>}
        <Panel
          variant="content"
          padding="none"
          className="he-list-page__table"
          role="region"
          aria-label={tableLabel}
        >
          {(toolbar != null || toolbarEnd != null) && (
            <div className="he-list-page__toolbar">
              <div className="he-list-page__toolbar-start">{toolbar}</div>
              {toolbarEnd != null && <div className="he-list-page__toolbar-end">{toolbarEnd}</div>}
            </div>
          )}
          {children}
          {pagination != null && <div className="he-list-page__pagination">{pagination}</div>}
        </Panel>
      </div>
    </AppShell>
  );
}
