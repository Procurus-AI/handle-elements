import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Elements/Badge',
  component: Badge,
  args: { children: 24, tone: 'neutral' },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'accent', 'ok', 'warn', 'error'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Badge>27</Badge>
      <Badge tone="accent">24</Badge>
      <Badge tone="ok">11</Badge>
      <Badge tone="warn">4</Badge>
      <Badge tone="error">3</Badge>
      <Badge tone="neutral" size="sm">
        12
      </Badge>
    </div>
  ),
};
