import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../components/Button/Button';
import { DataTable } from '../components/DataTable/DataTable';
import { SearchInput } from '../components/Input/SearchInput';
import { ListPage } from '../components/ListPage/ListPage';
import { Pagination } from '../components/Pagination/Pagination';
import { Segmented } from '../components/Segmented/Segmented';
import { Tabs } from '../components/Tabs/Tabs';
import { ResultCount } from '../components/Toolbar/Toolbar';
import { AGING_CARDS, PAYMENT_STATS, VALIDACION_TABS } from './fixtures';
import { PagesSidebar, PaymentDetail, StatPanel, SyncNotice, paymentColumns, paymentRows } from './shared';

/**
 * Figma page 04, "Validación de pagos · Pendientes": a sync status notice in warning tones, four
 * stat cells, three aging filter cards and the table of receipts that still wait for payment.
 */
const meta = {
  title: 'Pages/Validación de pagos',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Page() {
  const [tab, setTab] = useState('pendientes');
  const [aging, setAging] = useState('7');
  const [view, setView] = useState<'resumen' | 'tabla'>('tabla');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  return (
    <ListPage
      sidebar={<PagesSidebar active="validacion" />}
      title="Validación de pagos"
      actions={
        <>
          <Button variant="secondary" icon="settings">Configuración</Button>
          <Button variant="secondary" icon="history">Actividad</Button>
          <Button icon="play">Ejecutar validación</Button>
        </>
      }
      tabs={<Tabs aria-label="Vistas de validación" items={VALIDACION_TABS} value={tab} onChange={setTab} />}
      notice={<SyncNotice />}
      stats={<StatPanel label="Resumen de cobranza" stats={PAYMENT_STATS} />}
      filters={
        <div className="pg-aging" role="group" aria-label="Filtrar por fecha límite">
          {AGING_CARDS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="pg-aging__card"
              aria-pressed={aging === c.id}
              onClick={() => setAging(c.id)}
            >
              <span className="pg-aging__label">
                <span className={`pg-aging__dot pg-aging__dot--${c.tone}`} aria-hidden />
                {c.label}
              </span>
              <span className="pg-aging__amount">
                {c.mxn}
                <span className="pg-aging__unit">MXN</span>
              </span>
              {c.usd != null && (
                <span className="pg-aging__amount pg-aging__amount--usd">
                  {c.usd}
                  <span className="pg-aging__unit">USD</span>
                </span>
              )}
              <span className="pg-aging__count">{c.polizas}</span>
            </button>
          ))}
        </div>
      }
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
          <ResultCount>143 pólizas</ResultCount>
          <Segmented
            label="Vista"
            value={view}
            onChange={setView}
            options={[
              { value: 'resumen', label: 'Resumen' },
              { value: 'tabla', label: 'Tabla' },
            ]}
          />
          <Button variant="secondary" icon="download">Exportar</Button>
        </>
      }
      pagination={<Pagination page={page} pageSize={10} total={143} onPageChange={setPage} />}
      tableLabel="Tabla de recibos pendientes"
    >
      <DataTable
        card={false}
        caption="Recibos pendientes"
        captionHidden
        columns={paymentColumns}
        data={paymentRows}
        globalFilter={query}
        filterKeys={['cliente', 'poliza']}
        rowKey={(r) => r.id}
        renderExpanded={(r) => <PaymentDetail row={r} />}
      />
    </ListPage>
  );
}

export const Pendientes: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cards = canvas.getAllByRole('button', { pressed: true });
    await expect(cards.some((b) => b.textContent?.includes('Próximos 7 días'))).toBe(true);
    await userEvent.click(canvas.getByRole('button', { name: /Vencidos/ }));
    await expect(canvas.getByRole('button', { name: /Vencidos/ })).toHaveAttribute('aria-pressed', 'true');
  },
};
