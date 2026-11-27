import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { DataTable } from '../DataTable/DataTable';
import { RECEIPTS, RECEIPT_COLUMNS } from '../ListPage/fixtures';
import { Panel } from './Panel';

/**
 * Two surfaces. `content` (default) is a bordered bg-surface panel inside a page: corner lg,
 * with an optional section head. `inset` is the App shell's main panel: bg-panel, 1px bg-subtle
 * border, corner xl and the panel elevation. Only the shell uses `inset`.
 */
const meta = {
  title: 'Organisms/Panel',
  component: Panel,
  args: { title: 'Resultados de contacto', padding: 'lg' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['content', 'inset'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

const note = <p style={{ margin: 0, color: 'var(--he-text-secondary)' }}>48 recibos por confirmar hoy en 5 aseguradoras.</p>;

/** Both panels on the app canvas: content (left) and inset (right). */
export const Figma: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 360px)',
        gap: 'var(--he-spacing-2)',
        padding: 'var(--he-spacing-2)',
        background: 'var(--he-bg-app)',
      }}
    >
      <Panel title="Contenido" aside={<Button variant="secondary" size="sm">Exportar</Button>}>
        {note}
      </Panel>
      <Panel variant="inset" title="Panel principal">
        {note}
      </Panel>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 360px)', gap: 'var(--he-spacing-3)', padding: 'var(--he-spacing-4)', background: 'var(--he-bg-app)' }}>
      <Panel title="Con título y contexto" eyebrow="Cobranza" lede="Recibos de los últimos 90 días.">
        {note}
      </Panel>
      <Panel>{note}</Panel>
      <Panel padding="sm" title="Relleno chico">
        {note}
      </Panel>
      <Panel padding="none" title="Sin relleno">
        {note}
      </Panel>
    </div>
  ),
};

/** `flush` lets a table reach the panel edges so its dividers span the full width. */
export const Flush: Story = {
  render: () => (
    <div style={{ width: 720, background: 'var(--he-bg-app)', padding: 'var(--he-spacing-4)' }}>
      <Panel title="Recibos recientes" flush>
        <DataTable card={false} columns={RECEIPT_COLUMNS.slice(0, 4)} data={RECEIPTS.slice(0, 4)} rowKey={(r) => r.id} caption="Recibos recientes" captionHidden />
      </Panel>
    </div>
  ),
};
