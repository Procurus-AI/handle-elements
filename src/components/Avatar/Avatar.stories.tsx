import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarStack } from './Avatar';

const meta = {
  title: 'Elements/Avatar',
  component: Avatar,
  args: { name: 'Ariana Rivera' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const members = [
  { id: 1, name: 'Ariana Rivera' },
  { id: 2, name: 'Mateo Chen' },
  { id: 3, name: 'Sarah Okonkwo' },
  { id: 4, name: 'Julia Alvarez' },
  { id: 5, name: 'Nadia Flores' },
  { id: 6, name: 'Diego Ramos' },
];

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Avatar name="Ariana Rivera" size="xs" />
      <Avatar name="Mateo Chen" size="sm" />
      <Avatar name="Sarah Okonkwo" size="md" status="online" />
      <Avatar name="Julia Alvarez" size="lg" status="busy" />
    </div>
  ),
};

export const Stack: Story = {
  render: () => <AvatarStack items={members} max={4} size="md" />,
};
