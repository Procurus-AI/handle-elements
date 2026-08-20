import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { Money } from '../Money/Money';
import { StatusPill } from '../StatusPill/StatusPill';
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
    <Tooltip content="Includes pending, filed, and settled transactions.">
      <Button variant="secondary">Amount basis</Button>
    </Tooltip>
  ),
};

export const CursorFollowing: Story = {
  render: () => (
    <Tooltip content="This card follows the cursor for dense heat strips." followCursor>
      <span style={{ padding: 'var(--he-space-2)', borderBottom: '1px dotted var(--he-border-strong)' }}>
        Aug 19 exposure
      </span>
    </Tooltip>
  ),
};

export const HoverCardStory: Story = {
  name: 'HoverCard',
  render: () => (
    <HoverCard
      content={
        <div>
          <div className="he-hover-card__header">
            <span className="he-hover-card__eyebrow">Portfolio account</span>
            <div className="he-hover-card__title-row">
              <span className="he-hover-card__title">Northwind Capital</span>
              <StatusPill status="ok" label="Healthy" />
            </div>
          </div>
          <div className="he-hover-card__body">
            <div>
              <div className="he-hover-card__label">Committed capital</div>
              <div className="he-hover-card__metric-row">
                <Money className="he-hover-card__value" value={128400} currency="MXN" />
                <Chip size="sm">MXN</Chip>
              </div>
            </div>
            <div className="he-hover-card__meta">
              <span>3 active vehicles</span>
              <span>Updated hace 3d</span>
            </div>
          </div>
        </div>
      }
    >
      <Button variant="secondary">Northwind Capital</Button>
    </HoverCard>
  ),
};
