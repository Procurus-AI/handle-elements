import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { EmptyState } from '../EmptyState/EmptyState';
import { Icon } from '../Icon/Icon';
import { RECEIPTS, RECEIPT_COLUMNS, peso, type Receipt } from '../ListPage/fixtures';
import { DataTable, type DataTableColumn } from './DataTable';

/**
 * Receipt tables. Rows are 40px, the header 36px; header cells are Label/sm, cells Body/sm,
 * dividers border-subtle and hover bg-hover. Numbers are right-aligned with tabular numerals
 * (`numeric`), status is a `Badge`. Row actions are always visible. An empty table shows the
 * empty state in place of the whole table, headers included.
 */
const meta = {
  title: 'Organisms/Data table',
  component: DataTable,
  args: { columns: RECEIPT_COLUMNS as DataTableColumn<unknown>[], data: RECEIPTS },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const rowKey = (r: Receipt) => r.id;
const frame = { width: 880, maxWidth: '100%' } as const;

/** The Figma "Panel — Table": header row, rows with a status Badge, amounts on the right. */
export const Figma: Story = {
  render: () => (
    <div style={frame}>
      <DataTable
        caption="Recibos"
        captionHidden
        columns={RECEIPT_COLUMNS}
        data={RECEIPTS}
        rowKey={rowKey}
        defaultSort={{ key: 'cliente', direction: 'asc' }}
      />
    </div>
  ),
};

const actions = (r: Receipt) => (
  <Button variant="ghost" size="icon-sm" icon="ellipsis" aria-label={`Más acciones para ${r.cliente}`} />
);

/** Default, loading, empty, dense, with selected rows and always-visible actions. */
export const States: Story = {
  render: () => (
    <div style={{ ...frame, display: 'grid', gap: 'var(--he-spacing-6)' }}>
      <DataTable caption="Con acciones" captionHidden columns={RECEIPT_COLUMNS} data={RECEIPTS.slice(0, 3)} rowKey={rowKey} rowActions={actions} isRowSelected={(r) => r.id === '12606458245'} />
      <DataTable caption="Cargando" captionHidden loading loadingRows={3} columns={RECEIPT_COLUMNS} data={[]} rowKey={rowKey} />
      <DataTable caption="Denso" captionHidden dense columns={RECEIPT_COLUMNS.slice(0, 3)} data={RECEIPTS.slice(0, 3)} rowKey={rowKey} />
      <DataTable
        caption="Vacía"
        columns={RECEIPT_COLUMNS}
        data={[]}
        emptyState={
          <EmptyState
            icon={<Icon name="inbox" size={24} />}
            title="Sin recibos que coincidan"
            hint="Ajusta los filtros o el término de búsqueda."
          />
        }
      />
    </div>
  ),
};

function SelectableTable() {
  const [keys, setKeys] = useState<Array<string | number>>([]);
  return (
    <div style={frame}>
      <p style={{ margin: '0 0 var(--he-spacing-2)', color: 'var(--he-text-secondary)' }} role="status">
        {keys.length} seleccionados
      </p>
      <DataTable
        caption="Recibos seleccionables"
        captionHidden
        selectable
        selectedKeys={keys}
        onSelectionChange={setKeys}
        columns={RECEIPT_COLUMNS.slice(0, 4)}
        data={RECEIPTS.slice(0, 4)}
        rowKey={rowKey}
      />
      {/* No rowKey: the key is the row's index in `data`, so one record is selected, not one per page. */}
      {[1, 2].map((page) => (
        <DataTable
          key={page}
          caption={`Sin rowKey, página ${page}`}
          captionHidden
          selectable
          defaultSelectedKeys={[0]}
          defaultSort={{ key: 'cliente', direction: 'desc' }}
          columns={RECEIPT_COLUMNS.slice(0, 2)}
          data={RECEIPTS.slice(0, 4)}
          page={page}
          pageSize={2}
        />
      ))}
    </div>
  );
}

/** The header checkbox selects the page and shows a mixed state for a partial selection. */
export const Selectable: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [all] = canvas.getAllByRole('checkbox', { name: 'Seleccionar todas las filas' });
    const rows = canvas.getAllByRole('checkbox', { name: 'Seleccionar fila' });
    await userEvent.click(rows[0]);
    await expect(canvas.getByRole('status')).toHaveTextContent('1 seleccionados');
    await expect(all).toHaveProperty('indeterminate', true);
    await userEvent.click(all);
    await expect(canvas.getByRole('status')).toHaveTextContent('4 seleccionados');
    await expect(all).toBeChecked();
    await userEvent.click(all);
    await expect(canvas.getByRole('status')).toHaveTextContent('0 seleccionados');
    // Without rowKey, defaultSelectedKeys=[0] is the first record of `data` wherever it lands.
    const checkedRows = canvas
      .getAllByRole('checkbox', { name: 'Seleccionar fila' })
      .filter((box) => (box as HTMLInputElement).checked)
      .map((box) => box.closest('tr')!);
    await expect(checkedRows).toHaveLength(1);
    await expect(checkedRows[0]).toHaveTextContent(RECEIPTS[0].cliente);
  },
};

/** Sortable headers are buttons; `aria-sort` follows ascending, descending, none. */
export const Sortable: Story = {
  render: () => (
    <div style={frame}>
      <DataTable caption="Recibos ordenables" captionHidden columns={RECEIPT_COLUMNS} data={RECEIPTS} rowKey={rowKey} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('columnheader', { name: /Monto/ });
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'none');
  },
};

const detailColumns: DataTableColumn<Receipt>[] = [
  { key: 'cliente', header: 'Cliente' },
  { key: 'aseguradora', header: 'Aseguradora' },
  { key: 'monto', header: 'Monto', numeric: true, render: (r) => peso(r.monto) },
];

/** Expandable rows with their actions: the detail opens from the chevron, the actions never hide. */
export const Expandable: Story = {
  render: () => (
    <div style={frame}>
      <DataTable
        caption="Recibos con detalle"
        captionHidden
        columns={detailColumns}
        data={RECEIPTS.slice(0, 4)}
        rowKey={rowKey}
        rowActions={actions}
        renderExpanded={(r) => (
          <div style={{ padding: 'var(--he-spacing-3)', background: 'var(--he-bg-surface)', border: '1px solid var(--he-border-default)', borderRadius: 'var(--he-corner-lg)' }}>
            Póliza {r.poliza} · vence {r.vence}
          </div>
        )}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first] = canvas.getAllByRole('button', { name: 'Mostrar detalle' });
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/Póliza AF-4410021/)).toBeVisible();
  },
};

/** A narrow container scrolls inside the table; the scroll region is reachable by keyboard. */
export const Overflow: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <DataTable caption="Recibos en un contenedor angosto" captionHidden layout="fixed" minTableWidth={720} columns={RECEIPT_COLUMNS} data={RECEIPTS.slice(0, 3)} rowKey={rowKey} />
    </div>
  ),
};
