import type { Meta, StoryObj } from '@storybook/react-vite';
import { Count } from './Count';

const meta = {
  title: 'Atoms/Count',
  component: Count,
  args: { children: 3, tone: 'neutral' },
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'warning', 'danger', 'success'] } },
} satisfies Meta<typeof Count>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Figma board: neutral, warning, danger, success. */
export const Figma: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--he-spacing-4)', alignItems: 'center', padding: 'var(--he-spacing-4)' }}>
      <Count tone="neutral">3</Count>
      <Count tone="warning">3</Count>
      <Count tone="danger">3</Count>
      <Count tone="success">3</Count>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--he-spacing-4)', alignItems: 'center' }}>
      <Count>0</Count>
      <Count>12</Count>
      <Count tone="danger">128</Count>
      <Count tone="warning">1,204</Count>
    </div>
  ),
};
