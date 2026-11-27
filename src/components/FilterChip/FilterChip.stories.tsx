import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FilterChip, type FilterChipTone } from './FilterChip';

const meta = {
  title: 'Molecules/Filter chip',
  component: FilterChip,
  args: { label: 'Vencidos', count: 12, tone: 'warning', onClick: fn() },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'success', 'warning', 'idle'] },
    active: { control: 'boolean' },
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

const tones: FilterChipTone[] = ['neutral', 'success', 'warning', 'idle'];

export const Playground: Story = {};

/** Figma board: four tones, default (left) and active (right). */
export const Figma: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-3)', justifyItems: 'start', padding: 'var(--he-spacing-4)' }}>
      {tones.map((tone) => (
        <div key={tone} style={{ display: 'flex', gap: 'var(--he-spacing-3)' }}>
          <FilterChip tone={tone} label="Todas" count={12} />
          <FilterChip tone={tone} label="Todas" count={12} active />
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--he-spacing-3)', alignItems: 'center' }}>
      <FilterChip label="Pagados" count={48} tone="success" />
      <FilterChip label="Pagados" count={48} tone="success" active />
      <FilterChip label="Pendientes" count={7} tone="warning" disabled />
      <FilterChip label="Sin conectar" tone="idle" />
    </div>
  ),
};

function Group() {
  const [on, setOn] = useState<string | null>(null);
  return (
    <div role="group" aria-label="Filtrar recibos" style={{ display: 'flex', gap: 'var(--he-spacing-3)' }}>
      {[
        ['todas', 'Todas', 'neutral', 12],
        ['pagados', 'Pagados', 'success', 8],
        ['pendientes', 'Pendientes', 'warning', 4],
      ].map(([key, label, tone, count]) => (
        <FilterChip
          key={key as string}
          label={label as string}
          tone={tone as FilterChipTone}
          count={count as number}
          active={on === key}
          onClick={() => setOn(on === key ? null : (key as string))}
        />
      ))}
    </div>
  );
}

export const Toggle: Story = {
  render: () => <Group />,
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole('button', { name: /Pagados/ });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
  },
};
