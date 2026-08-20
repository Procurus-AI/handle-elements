import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { PageHeader } from './PageHeader';

const meta = {
  title: 'Elements/PageHeader',
  component: PageHeader,
  args: {
    eyebrow: 'Operations',
    title: 'Renewals',
    lede: 'Every policy approaching its renewal window, ranked by premium at stake and how much of the workflow Handle can run without you.',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithActions: Story = {
  args: {
    aside: (
      <>
        <Button variant="outline" size="sm">
          Export
        </Button>
        <Button size="sm">New renewal</Button>
      </>
    ),
  },
};
