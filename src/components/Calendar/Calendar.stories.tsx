import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Calendar, CalendarPanel, CalendarPanelRow, type CalendarMarker } from './Calendar';

const meta = {
  title: 'Elements/Calendar',
  component: Calendar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

const LOCALE = 'es-MX';
const TODAY = new Date(2026, 7, 19); // 19 Aug 2026

/* Events per day of August 2026 (mirrors the reference design). */
const EVENTS: Record<number, CalendarMarker[]> = {
  1: [m('error', '2 vencidos'), m('ok', '2 pagados')],
  2: [m('ok', '12 pagados')],
  3: [m('error', '3 vencidos'), m('ok', '7 pagados')],
  4: [m('error', '2 vencidos'), m('ok', '8 pagados')],
  5: [m('error', '1 vencido'), m('ok', '10 pagados')],
  6: [m('ok', '7 pagados')],
  7: [m('error', '3 vencidos'), m('ok', '7 pagados')],
  8: [m('error', '1 vencido'), m('ok', '8 pagados')],
  9: [m('error', '1 vencido'), m('ok', '8 pagados')],
  10: [m('error', '1 vencido'), m('ok', '8 pagados')],
  11: [m('error', '1 vencido'), m('ok', '6 pagados')],
  12: [m('error', '1 vencido'), m('ok', '4 pagados')],
  13: [m('error', '1 vencido'), m('ok', '8 pagados')],
  14: [m('error', '2 vencidos'), m('ok', '9 pagados')],
  15: [m('error', '1 vencido'), m('ok', '14 pagados')],
  16: [m('error', '1 vencido'), m('ok', '6 pagados')],
  17: [m('ok', '8 pagados')],
  18: [m('error', '3 vencidos'), m('ok', '6 pagados')],
  19: [m('error', '1 vencido'), m('ok', '14 pagados')],
  20: [m('warn', '2 pendientes'), m('ok', '3 pagados')],
  21: [m('warn', '2 pendientes'), m('ok', '17 pagados')],
  22: [m('warn', '3 pendientes'), m('ok', '7 pagados')],
  23: [m('ok', '8 pagados')],
  24: [m('warn', '3 pendientes'), m('ok', '5 pagados')],
  25: [m('warn', '3 pendientes'), m('ok', '2 pagados')],
  26: [m('warn', '1 pendiente'), m('ok', '2 pagados')],
  27: [m('warn', '6 pendientes'), m('ok', '10 pagados')],
  28: [m('warn', '4 pendientes'), m('ok', '6 pagados')],
  29: [m('warn', '5 pendientes'), m('ok', '2 pagados')],
  30: [m('warn', '1 pendiente'), m('ok', '4 pagados')],
  31: [m('warn', '3 pendientes'), m('ok', '1 pagado')],
};

function m(status: CalendarMarker['status'], label: string): CalendarMarker {
  return { status, label };
}

function markersFor(date: Date): CalendarMarker[] {
  if (date.getFullYear() === 2026 && date.getMonth() === 7) return EVENTS[date.getDate()] ?? [];
  return [];
}

const SearchIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const HeaderActions = (
  <>
    <Input variant="pill" size="sm" icon={SearchIcon} placeholder="Buscar póliza o cliente…" style={{ width: 220 }} />
    <Button variant="outline" size="sm">
      Filtros
    </Button>
    <Button variant="outline" size="sm">
      Exportar
    </Button>
  </>
);

export const Playground: Story = {
  render: () => (
    <div style={{ padding: 24, background: 'var(--he-bg)' }}>
      <Calendar
        locale={LOCALE}
        today={TODAY}
        defaultMonth={TODAY}
        todayLabel="Hoy"
        markers={markersFor}
        actions={HeaderActions}
      />
    </div>
  ),
};

/* ---- clicking a day opens the detail panel ---- */

interface Payment {
  name: string;
  count: number;
  amount: number;
}

const PAYMENTS: Payment[] = [
  { name: 'ANA CLAUDIA DIAZ DE RIVERA GALINDO', count: 1, amount: 648.31 },
  { name: 'ARCELIA SIFUENTES HERNANDEZ', count: 1, amount: 0.02 },
  { name: 'DE SANTIAGO HEREDIA SANDRA LUZ', count: 1, amount: 4870.7 },
  { name: 'DIEGO MANUEL DE LA TORRE PRIETO', count: 1, amount: 1468.3 },
  { name: 'GRUPO JB PROYECTOS Y CONSTRUCCIONES', count: 1, amount: -64.96 },
  { name: 'HOTEL POSADA DEL RIO SA DE CV', count: 1, amount: 6618.52 },
  { name: 'ILEANA GOYTIA SALINAS', count: 1, amount: 6480.9 },
  { name: 'INNOVATIVE AUTOMATION SOLUTIONS', count: 1, amount: 2372.65 },
  { name: 'IPIRANGA SERVICIOS SAPI DE CV', count: 2, amount: 16051.26 },
  { name: 'JORGE BITAR TAFICH', count: 1, amount: 879.44 },
  { name: 'LOGISTICA INTEGRAL DEL NORTE', count: 1, amount: 3210.0 },
  { name: 'MARIA FERNANDA VELASCO RUIZ', count: 1, amount: 1204.55 },
  { name: 'SERVICIOS CORPORATIVOS DEL BAJIO', count: 3, amount: 990.65 },
];

const PAGE_SIZE = 10;
const mxn = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
const total = PAYMENTS.reduce((s, p) => s + p.amount, 0);

export const WithDetailPanel: Story = {
  name: 'With detail panel (click a day)',
  render: () => {
    const [selected, setSelected] = useState<Date | null>(TODAY);
    const [page, setPage] = useState(1);

    const pageCount = Math.ceil(PAYMENTS.length / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const rows = useMemo(() => PAYMENTS.slice(start, start + PAGE_SIZE), [start]);

    const title =
      selected &&
      new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' }).format(selected);

    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', padding: 24, background: 'var(--he-bg)', minHeight: 640 }}>
        <Calendar
          style={{ flex: 1, minWidth: 0 }}
          locale={LOCALE}
          today={TODAY}
          defaultMonth={TODAY}
          todayLabel="Hoy"
          markers={markersFor}
          selected={selected}
          onSelectDay={(d) => {
            setSelected(d);
            setPage(1);
          }}
          actions={HeaderActions}
        />

        {selected && (
          <CalendarPanel
            style={{ width: 360, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 24, maxHeight: 'calc(100vh - 48px)' }}
            title={title}
            subtitle={`${PAYMENTS.length} pagos · ${mxn(total)}`}
            onClose={() => setSelected(null)}
            closeLabel="Cerrar"
            footer={
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    ‹ Anterior
                  </Button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <Button key={p} variant={p === page ? 'default' : 'ghost'} size="icon-sm" onClick={() => setPage(p)}>
                      {p}
                    </Button>
                  ))}
                  <Button variant="ghost" size="sm" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
                    Siguiente ›
                  </Button>
                </div>
              </>
            }
          >
            {rows.map((p) => (
              <CalendarPanelRow
                key={p.name}
                expandable
                title={p.name}
                badge={p.count}
                amount={mxn(p.amount)}
                onClick={() => {}}
              />
            ))}
            <div
              style={{
                padding: '8px 16px',
                fontSize: 'var(--he-caption)',
                color: 'var(--he-text-faint)',
                textAlign: 'center',
              }}
            >
              Mostrando {start + 1}–{Math.min(start + PAGE_SIZE, PAYMENTS.length)} de {PAYMENTS.length} resultados
            </div>
          </CalendarPanel>
        )}
      </div>
    );
  },
};

export const Minimal: Story = {
  name: 'No events / plain month',
  render: () => (
    <div style={{ padding: 24, background: 'var(--he-bg)', maxWidth: 760 }}>
      <Calendar locale={LOCALE} today={TODAY} defaultMonth={TODAY} todayLabel="Hoy" />
    </div>
  ),
};
