import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs } from './Tabs';

const meta = {
  title: 'Elements/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pills'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAV_ITEMS = [
  { value: 'connectors', label: 'Connectors' },
  { value: 'skills', label: 'Skills' },
  { value: 'workflows', label: 'Workflows' },
  { value: 'memory', label: 'Memory', disabled: true },
];

const FILTER_ITEMS = [
  { value: 'discover', label: 'Discover' },
  { value: 'all', label: 'All' },
  { value: 'connected', label: 'Connected' },
  { value: 'available', label: 'Available' },
];

function Controlled({ variant, size }: { variant?: 'underline' | 'pills'; size?: 'sm' | 'md' }) {
  const items = variant === 'pills' ? FILTER_ITEMS : NAV_ITEMS;
  const [value, setValue] = useState(items[0].value);
  return <Tabs items={items} value={value} onChange={setValue} variant={variant} size={size} />;
}

export const Underline: Story = {
  args: { items: NAV_ITEMS, value: 'connectors' },
  render: (args) => <Controlled variant={args.variant ?? 'underline'} size={args.size} />,
};

export const Pills: Story = {
  args: { items: FILTER_ITEMS, value: 'discover', variant: 'pills' },
  render: () => <Controlled variant="pills" />,
};

export const Together: Story = {
  args: { items: NAV_ITEMS, value: 'connectors' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Controlled variant="underline" />
      <Controlled variant="pills" />
      <Controlled variant="pills" size="sm" />
    </div>
  ),
};
