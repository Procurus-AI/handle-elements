import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Money } from '../Money/Money';
import { Tooltip, HoverCard } from './Tooltip';

const meta = {
  title: 'Elements/Tooltip',
  component: Tooltip,
  args: {
    content: 'Tooltip content',
    children: <Button variant="secondary">Hover for detail</Button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Tooltip content="Includes pending and realized transactions.">
      <Button variant="secondary">Hover for detail</Button>
    </Tooltip>
  ),
};

export const CursorFollowing: Story = {
  render: () => (
    <Tooltip content="This card follows the cursor for dense heat strips." followCursor>
      <span style={{ padding: 'var(--he-space-2)', borderBottom: '1px dotted var(--he-border-strong)' }}>
        Heat strip point
      </span>
    </Tooltip>
  ),
};

export const HoverCardStory: Story = {
  name: 'HoverCard',
  render: () => (
    <HoverCard
      content={
        <div style={{ display: 'grid', gap: 8 }}>
          <strong>Northwind Capital</strong>
          <span style={{ color: 'var(--he-text-dim)' }}>Committed capital across active vehicles.</span>
          <Money value={128400} currency="MXN" showCurrencyCode />
        </div>
      }
    >
      <Button variant="outline">Northwind Capital</Button>
    </HoverCard>
  ),
};
