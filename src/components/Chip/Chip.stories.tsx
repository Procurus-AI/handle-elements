import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';

const meta = {
  title: 'Elements/Chip',
  component: Chip,
  args: { children: 'Quoting' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'mono', 'dot'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip>Renewals</Chip>
      <Chip variant="mono">POL-2941</Chip>
      <Chip variant="dot">Commercial lines</Chip>
      <Chip variant="dot" dotColor="var(--he-error)">
        At risk
      </Chip>
      <Chip size="sm">Small</Chip>
    </div>
  ),
};
