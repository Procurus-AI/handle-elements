import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { DateText, RelativeTime } from './DateText';

const meta = {
  title: 'Elements/DateText',
  component: RelativeTime,
  args: { date: Date.now() - 3 * 24 * 60 * 60 * 1000 },
} satisfies Meta<typeof RelativeTime>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = new Date('2026-08-19T21:30:00-07:00');
const dates = [
  new Date('2026-08-19T21:28:00-07:00'),
  new Date('2026-08-16T12:00:00-07:00'),
  new Date('2026-07-06T12:00:00-07:00'),
  new Date('2026-09-02T09:00:00-07:00'),
];

export const Relative: Story = {
  render: () => (
    <Card padding="none" style={{ width: 360 }}>
      {dates.map((date) => (
        <div
          key={date.toISOString()}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--he-space-3) var(--he-space-4)',
            borderBottom: '1px solid var(--he-border)',
          }}
        >
          <span style={{ color: 'var(--he-text-dim)' }}>Filed after</span>
          <RelativeTime date={date} now={now} variant="mono" />
        </div>
      ))}
    </Card>
  ),
};

export const Absolute: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <DateText date={dates[0]} dateStyle="medium" timeStyle="short" />
      {/* timeStyle alone is the clock time alone — the form a day-grouped feed uses. */}
      <DateText date={dates[0]} timeStyle="short" />
      <DateText date={dates[1]} variant="mono" />
      <DateText date={null} />
    </div>
  ),
};
