import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CarrierStatusCard, type CarrierStatusCardTone } from './CarrierStatusCard';

const meta = {
  title: 'Molecules/Carrier status card',
  component: CarrierStatusCard,
  args: {
    name: 'Aseguradora',
    status: 'Al día',
    tone: 'success',
    credentials: 'OK · hace 7h',
    lastSync: 'hace 7h',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['success', 'warning', 'idle'] },
    selected: { control: 'boolean' },
  },
  decorators: [(Story) => <div style={{ width: 250 }}><Story /></div>],
} satisfies Meta<typeof CarrierStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const tones: CarrierStatusCardTone[] = ['success', 'warning', 'idle'];

export const Playground: Story = {};

/** Figma board: three tones, default (left) and selected (right). */
export const Figma: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-4)', padding: 'var(--he-spacing-4)' }}>
      {tones.map((tone) => (
        <div key={tone} style={{ display: 'grid', gridTemplateColumns: '250px 250px', gap: 'var(--he-spacing-4)' }}>
          <CarrierStatusCard tone={tone} name="Aseguradora" status="Al día" credentials="OK · hace 7h" lastSync="hace 7h" />
          <CarrierStatusCard tone={tone} name="Aseguradora" status="Al día" credentials="OK · hace 7h" lastSync="hace 7h" selected />
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 250px)', gap: 'var(--he-spacing-4)' }}>
      <CarrierStatusCard name="GNP" status="Al día" tone="success" credentials="OK · hace 7h" lastSync="hace 7h" />
      <CarrierStatusCard name="Qualitas" status="Con retraso" tone="warning" credentials="OK · hace 2 d" lastSync="hace 2 d" />
      <CarrierStatusCard name="Chubb" status="Sin conectar" tone="idle" credentials="Sin credenciales" lastSync="Nunca" />
    </div>
  ),
};

function Picker() {
  const [picked, setPicked] = useState('gnp');
  const items = [
    { id: 'gnp', name: 'GNP', tone: 'success' as const, status: 'Al día' },
    { id: 'axa', name: 'AXA', tone: 'warning' as const, status: 'Con retraso' },
  ];
  return (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-3)', width: 250 }}>
      {items.map((i) => (
        <CarrierStatusCard
          key={i.id}
          name={i.name}
          tone={i.tone}
          status={i.status}
          credentials="OK · hace 7h"
          lastSync="hace 7h"
          selected={picked === i.id}
          onClick={() => setPicked(i.id)}
        />
      ))}
    </div>
  );
}

export const Selection: Story = {
  decorators: [(Story) => <Story />],
  render: () => <Picker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const gnp = canvas.getByRole('button', { name: /GNP/ });
    const axa = canvas.getByRole('button', { name: /AXA/ });
    await expect(gnp).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(axa);
    await expect(axa).toHaveAttribute('aria-pressed', 'true');
    await expect(gnp).toHaveAttribute('aria-pressed', 'false');
  },
};

export const Clickable: Story = {
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
