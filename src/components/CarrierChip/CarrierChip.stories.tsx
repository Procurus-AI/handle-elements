import type { Meta, StoryObj } from '@storybook/react-vite';
import { CarrierChip, type CarrierChipState } from './CarrierChip';

const meta = {
  title: 'Molecules/Carrier chip',
  component: CarrierChip,
  args: { name: 'Aseguradora', state: 'ok' },
  argTypes: { state: { control: 'inline-radio', options: ['ok', 'warning', 'error', 'idle'] } },
} satisfies Meta<typeof CarrierChip>;

export default meta;
type Story = StoryObj<typeof meta>;

const states: CarrierChipState[] = ['ok', 'warning', 'error', 'idle'];

export const Playground: Story = {};

/** Figma board: four connection states, stacked. */
export const Figma: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-3)', justifyItems: 'start', padding: 'var(--he-spacing-4)' }}>
      {states.map((state) => (
        <CarrierChip key={state} name="Aseguradora" state={state} />
      ))}
    </div>
  ),
};

/** El chip es blanco: se ve igual sobre un panel gris o sobre un banner tintado. */
export const States: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 'var(--he-spacing-3)',
        padding: 'var(--he-spacing-4)',
        background: 'var(--he-status-warning-surface)',
        borderRadius: 'var(--he-corner-lg)',
      }}
    >
      <CarrierChip name="GNP" state="ok" />
      <CarrierChip name="Qualitas" state="warning" />
      <CarrierChip name="AXA" state="error" />
      <CarrierChip name="Chubb" state="idle" />
    </div>
  ),
};
