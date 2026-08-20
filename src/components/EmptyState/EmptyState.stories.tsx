import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Elements/EmptyState',
  component: EmptyState,
  args: {
    title: 'No transactions found',
    hint: 'Adjust filters or try a broader search.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M7.25 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5ZM11 11l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Playground: Story = {
  args: {
    icon: <SearchIcon />,
    action: <Button variant="secondary">Clear filters</Button>,
  },
};

export const InCard: Story = {
  render: () => (
    <Card padding="none" style={{ maxWidth: 520 }}>
      <EmptyState
        icon={<SearchIcon />}
        title="No matching accounts"
        hint="Saved filters returned no rows for this portfolio."
        action={<Button variant="secondary">Reset</Button>}
      />
    </Card>
  ),
};
