import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { DataTable } from '../DataTable/DataTable';
import { EmptyState } from '../EmptyState/EmptyState';
import { SearchInput } from '../Input/SearchInput';
import { Icon } from '../Icon/Icon';
import { Pagination } from '../Pagination/Pagination';
import { StatCell, StatStrip } from '../StatCell/StatCell';
import { Tabs } from '../Tabs/Tabs';
import { ResultCount } from '../Toolbar/Toolbar';
import { DemoSidebar, RECEIPTS, RECEIPT_COLUMNS } from './fixtures';
import { ListPage } from './ListPage';

/**
 * AppShell + PageHeader + one content column with slots: `notice` (sync status), `stats`, `filters`,
 * and the table panel (toolbar, DataTable, Pagination).
 */
const meta = {
  title: 'Templates/List page',
  component: ListPage,
  parameters: { layout: 'fullscreen' },
  args: { sidebar: <DemoSidebar active="validacion" />, title: 'Validación de pagos', children: null },
} satisfies Meta<typeof ListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const VIEWS = [
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'pagados', label: 'Pagados' },
  { value: 'cancelados', label: 'Cancelados' },
  { value: 'calendario', label: 'Calendario' },
];

const notice = (
  <Card
    padding="sm"
    role="status"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--he-spacing-3)',
      padding: 'var(--he-spacing-3) var(--he-spacing-4)',
      background: 'var(--he-status-warning-surface)',
      borderColor: 'var(--he-status-warning-border)',
    }}
  >
    <span>
      <strong style={{ fontWeight: 500 }}>Sincronización parcial.</strong>{' '}
      <span style={{ color: 'var(--he-text-secondary)' }}>3 de 5 aseguradoras actualizadas hoy: GNP, AXA y Seguros Afirme.</span>
    </span>
    <a href="#detalle" style={{ color: 'var(--he-text-secondary)', fontWeight: 500 }}>Ver detalle</a>
  </Card>
);

const stats = (
  <StatStrip aria-label="Resumen de cobranza">
    <StatCell label="Avance de cobranza" value="0%" detail="$0.00 MXN / $493,981.11 MXN" />
    <StatCell label="Confirmado hoy" value="$0.00 MXN" detail="69 confirmados hoy" tone="success" />
    <StatCell label="Por confirmar" value="$493,981.11 MXN" detail="48 por confirmar hoy" tone="warning" />
    <StatCell label="Pendiente total" value="$1,267,473.02 MXN" detail="154 recibos confirmados" />
  </StatStrip>
);

const actions = (
  <>
    <Button variant="secondary" icon="settings">Configuración</Button>
    <Button variant="secondary" icon="history">Actividad</Button>
    <Button icon="play">Ejecutar validación</Button>
  </>
);

function Page({ rows = RECEIPTS, loading = false }: { rows?: typeof RECEIPTS; loading?: boolean }) {
  const [view, setView] = useState('pendientes');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  return (
    <ListPage
      sidebar={<DemoSidebar active="validacion" />}
      title="Validación de pagos"
      actions={actions}
      tabs={<Tabs aria-label="Vistas" items={VIEWS} value={view} onChange={setView} />}
      notice={notice}
      stats={stats}
      toolbar={
        <>
          <div style={{ width: 300 }}>
            <SearchInput
              grow
              variant="default"
              aria-label="Buscar póliza o cliente"
              placeholder="Buscar póliza o cliente…"
              value={query}
              onValueChange={setQuery}
            />
          </div>
          <Button variant="secondary" icon="sliders-horizontal">Filtros</Button>
        </>
      }
      toolbarEnd={
        <>
          <ResultCount>53,938 registros</ResultCount>
          <Button variant="secondary" icon="download">Exportar</Button>
        </>
      }
      pagination={<Pagination page={page} pageSize={10} total={143} onPageChange={setPage} />}
      style={{ height: 1000 }}
    >
      <DataTable
        card={false}
        caption="Recibos pendientes"
        captionHidden
        selectable
        loading={loading}
        columns={RECEIPT_COLUMNS}
        data={rows}
        globalFilter={query}
        filterKeys={['cliente', 'poliza']}
        rowKey={(r) => r.id}
        emptyState={
          <EmptyState
            icon={<Icon name="inbox" size={24} />}
            title="Sin recibos que coincidan"
            hint="Ajusta los filtros o el término de búsqueda."
          />
        }
      />
    </ListPage>
  );
}

/** The Figma board: notice, stats, then the table panel with toolbar, rows and pagination. */
export const Figma: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Shell look: the page header is inset (24/24/0) and the rail is flat (pad 12, no border).
    const head = canvas.getByRole('heading', { level: 1 }).closest('header')!;
    await expect(getComputedStyle(head).paddingLeft).toBe('24px');
    await expect(getComputedStyle(head).marginBottom).toBe('0px');
    const rail = canvasElement.querySelector('.he-sidebar')!;
    await expect(getComputedStyle(rail).paddingLeft).toBe('12px');
    await expect(getComputedStyle(rail).borderRightWidth).toBe('0px');
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Buscar póliza o cliente' }), 'Pacheco');
    await expect(canvas.getAllByRole('row')).toHaveLength(2);
    await expect(canvas.getByText('Juan Pacheco Aranda')).toBeVisible();
  },
};

/** Loading: skeleton rows keep the headers and the toolbar in place. */
export const States: Story = {
  render: () => <Page loading />,
};

/** Nothing found: the empty state replaces the table, headers included. */
export const Empty: Story = {
  render: () => <Page rows={[]} />,
};

/** Without notice, stats or filters the column is just the table panel. */
export const Minimal: Story = {
  render: () => (
    <ListPage
      sidebar={<DemoSidebar active="registros" />}
      title="Registros"
      toolbar={
        <div style={{ width: 280 }}>
          <SearchInput grow variant="default" aria-label="Buscar" placeholder="Buscar…" />
        </div>
      }
      toolbarEnd={<ResultCount>7 registros</ResultCount>}
      style={{ height: 640 }}
    >
      <DataTable card={false} caption="Registros" captionHidden columns={RECEIPT_COLUMNS} data={RECEIPTS} rowKey={(r) => r.id} />
    </ListPage>
  ),
};
