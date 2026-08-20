import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { Skeleton } from './Skeleton';
import { Spinner } from './Spinner';

const meta = {
  title: 'Elements/Loading',
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SpinnerSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </div>
  ),
};

export const SkeletonCard: Story = {
  render: () => (
    <Card style={{ width: 360 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
        <Skeleton variant="circle" width={36} height={36} />
        <div style={{ flex: 1 }}>
          <Skeleton width="45%" />
          <Skeleton width="28%" style={{ marginTop: 8 }} />
        </div>
      </div>
      <Skeleton lines={3} />
    </Card>
  ),
};
