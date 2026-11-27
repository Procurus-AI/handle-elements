import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCell, StatStrip, type StatCellTone } from './StatCell';

const meta = {
  title: 'Molecules/Stat cell',
  component: StatCell,
  args: { label: 'Monto vencido', value: '$103,708.44', detail: '30 recibos', tone: 'danger' },
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'success', 'warning', 'danger'] } },
  decorators: [(Story) => <div style={{ width: 260 }}><Story /></div>],
} satisfies Meta<typeof StatCell>;

export default meta;
type Story = StoryObj<typeof meta>;

const tones: StatCellTone[] = ['neutral', 'success', 'warning', 'danger'];

export const Playground: Story = {};

/** Figma board: four tones, stacked. */
export const Figma: Story = {
  decorators: [(Story) => <div style={{ width: 'auto' }}><Story /></div>],
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-3)', width: 260, padding: 'var(--he-spacing-4)' }}>
      {tones.map((tone) => (
        <StatCell key={tone} tone={tone} label="Etiqueta" value="$0.00" detail="Detalle" />
      ))}
    </div>
  ),
};

/** Panel de estadísticas del App shell: celdas sin borde dentro de un panel con divisores. */
export const Strip: Story = {
  decorators: [(Story) => <div style={{ width: 'auto' }}><Story /></div>],
  render: () => (
    <StatStrip aria-label="Resumen de recibos" style={{ maxWidth: 1168 }}>
      <StatCell label="Recibos" value="53,938" />
      <StatCell label="Vencidos" value="30" tone="danger" />
      <StatCell label="Monto vencido" value="$103,708.44" tone="danger" />
      <StatCell label="Monto pagado" value="$112,601,918.79" tone="success" />
      <StatCell label="Pagados" value="53,908" tone="success" />
    </StatStrip>
  ),
};

export const States: Story = {
  render: () => (
    <StatCell label="Pendientes" value="—" detail="Sin datos del periodo" tone="warning" />
  ),
};
