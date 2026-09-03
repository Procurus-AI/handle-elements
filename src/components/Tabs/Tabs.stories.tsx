import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs, type TabItem } from './Tabs';

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

const RAIL_ITEMS = [
  { value: 'renewals', label: 'Renewals', count: 270, countTone: 'warn' as const },
  { value: 'important', label: 'Important', count: 12 },
  { value: 'collections', label: 'Collections', count: 8 },
  { value: 'commissions', label: 'Commissions', count: 4, countTone: 'error' as const },
];

function Controlled({ variant, size }: { variant?: 'underline' | 'pills'; size?: 'sm' | 'md' }) {
  const items = variant === 'pills' ? FILTER_ITEMS : NAV_ITEMS;
  const [value, setValue] = useState(items[0].value);
  return <Tabs items={items} value={value} onChange={setValue} variant={variant} size={size} />;
}

/** The app's record-object strip: everything from Customers on is still beta. */
const RECORD_ITEMS: TabItem[] = [
  { value: 'home', label: 'Home' },
  { value: 'receipts', label: 'Receipts', count: '14,639' },
  { value: 'customers', label: 'Customers', count: '2,201', dividerLabel: 'Beta' },
  { value: 'policies', label: 'Policies', count: '4,592' },
  { value: 'invoices', label: 'Invoices', count: 0 },
  { value: 'captures', label: 'Captures' },
];

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

/** In a narrow rail the default scroll container hides the last tab with no
 * affordance; `wrap` flows it onto a second line instead. */
export const Wrap: Story = {
  args: { items: RAIL_ITEMS, value: 'renewals', variant: 'pills', size: 'sm' },
  render: () => {
    const [value, setValue] = useState('renewals');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 334 }}>
        <Tabs variant="pills" size="sm" items={RAIL_ITEMS} value={value} onChange={setValue} />
        <Tabs variant="pills" size="sm" wrap items={RAIL_ITEMS} value={value} onChange={setValue} />
      </div>
    );
  },
};

/** `dividerLabel` splits the strip into groups and captions the break with a
 * Borealis marker — the record objects that are still in beta. The marker
 * describes every tab after it, so screen readers announce the group too.
 * `divider` alone gives the hairline with no caption. */
export const GroupDivider: Story = {
  args: { items: RECORD_ITEMS, value: 'home', variant: 'pills', size: 'sm' },
  render: () => {
    const [value, setValue] = useState('receipts');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Tabs variant="pills" size="sm" items={RECORD_ITEMS} value={value} onChange={setValue} />
        <Tabs variant="pills" items={RECORD_ITEMS} value={value} onChange={setValue} />
        <Tabs variant="underline" items={RECORD_ITEMS} value={value} onChange={setValue} />
      </div>
    );
  },
};
