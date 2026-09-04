import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Composer } from '../Composer/Composer';
import { Panel } from '../Panel/Panel';
import { Feed, type FeedItem } from './Feed';

/** Pinned so every relative string in these stories is deterministic. */
const NOW = new Date('2026-09-03T16:20:00-06:00');
const MIN = 60000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const ago = (ms: number): number => NOW.getTime() - ms;

/** The four events behind the customer drawer. Every `at` is an OCCURRED-at
 *  instant in the past — never a due date. */
const customerEvents: FeedItem[] = [
  {
    id: 'e1',
    at: ago(3 * HOUR),
    kind: 'Receipt',
    title: 'Receipt 4471-02 cancelled',
    meta: 'GNP · MXN 18,400 · cancelled',
    tone: 'error',
    href: '#receipt-4471-02',
  },
  {
    id: 'e2',
    at: ago(2 * DAY + 5 * HOUR),
    kind: 'Receipt',
    title: 'Receipt 4471-01 paid',
    meta: 'GNP · MXN 18,400 · transfer',
    tone: 'ok',
    href: '#receipt-4471-01',
  },
  {
    id: 'e3',
    at: ago(9 * DAY),
    kind: 'Document',
    title: 'RFC constancy uploaded',
    meta: 'MOSZ890412H14 · 240 KB PDF',
    tone: 'neutral',
  },
  {
    id: 'e4',
    at: ago(46 * DAY),
    kind: 'Policy',
    title: 'Policy GMM-88213 renewed for 12 months',
    meta: 'GNP · next renewal Mar 2027',
  },
];

const meta = {
  title: 'Elements/Feed',
  component: Feed,
  args: { items: customerEvents, now: NOW, locale: 'en-US' },
  // The real drawer body is ~410-505px wide. Design and review it there.
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Feed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  argTypes: {
    order: { control: 'inline-radio', options: ['newest', 'oldest'] },
    groupBy: { control: 'inline-radio', options: ['day', 'none'] },
  },
};

/**
 * `at` is when the event OCCURRED, never when something is due. A feed fed due
 * dates prints "cancelled" next to "in 4 months" in the same row.
 */
export const CustomerActivity: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <Panel title="Customer activity" padding="md">
        <Feed
          {...args}
          compose={
            <Composer
              size="sm"
              placeholder="Add a comment…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onSubmit={() => setValue('')}
              submitDisabled={value.trim() === ''}
              submitLabel="Post comment"
            />
          }
        />
      </Panel>
    );
  },
};

/** Avatar nodes and wrapping prose — the two things a List row cannot do. */
export const WithComments: Story = {
  args: {
    items: [
      {
        id: 'c1',
        at: ago(40 * MIN),
        actor: { name: 'Marina Escalante' },
        title: 'Called the customer about the cancelled receipt.',
        body:
          'She asked us to re-issue against the same CLABE and to move the charge to the 15th. ' +
          'I told her the endorsement takes two business days once GNP acknowledges it, so the ' +
          'March renewal is not at risk.',
      },
      {
        id: 'c2',
        at: ago(26 * HOUR),
        actor: { name: 'Diego Fuentes' },
        title: 'Flagged the RFC constancy as out of date.',
        body: 'The uploaded constancy is from 2024. We need the current one before the renewal quote.',
      },
      ...customerEvents.slice(0, 2),
    ],
  },
};

/** Day headings are flat siblings, so the rail runs unbroken across boundaries. */
export const Grouped: Story = {
  args: {
    groupBy: 'day',
    items: [
      { id: 'g1', at: ago(2 * HOUR), kind: 'Receipt', title: 'Receipt 4471-02 cancelled', tone: 'error' },
      { id: 'g2', at: ago(7 * HOUR), kind: 'Note', title: 'Renewal call scheduled', tone: 'neutral' },
      { id: 'g3', at: ago(30 * HOUR), kind: 'Receipt', title: 'Receipt 4471-01 paid', tone: 'ok' },
      { id: 'g4', at: ago(31 * HOUR), kind: 'Document', title: 'RFC constancy uploaded', tone: 'neutral' },
      { id: 'g5', at: ago(4 * DAY), kind: 'Policy', title: 'Policy GMM-88213 renewed' },
    ],
  },
};

/** The comment box stays a real control when there is no history to show. */
export const Empty: Story = {
  args: { items: [] },
  render: (args) => (
    <Panel title="Customer activity" padding="md">
      <Feed
        {...args}
        compose={<Composer size="sm" placeholder="Add a comment…" onSubmit={() => {}} submitLabel="Post comment" />}
      />
    </Panel>
  ),
};

/** 200 rows. `content-visibility: auto` on the item keeps the off-screen ones
 *  out of layout and paint without a virtualizer (which would be a runtime dep),
 *  so they stay findable, tabbable and readable by a screen reader. */
export const LongHistory: Story = {
  args: {
    items: Array.from({ length: 200 }, (_, i) => ({
      id: `l${i}`,
      at: ago(i * 7 * HOUR + 11 * MIN),
      kind: ['Receipt', 'Policy', 'Document', 'Note'][i % 4],
      title: `Event ${i + 1} — ${['receipt settled', 'endorsement issued', 'file attached', 'call logged'][i % 4]}`,
      meta: i % 3 === 0 ? 'GNP · MXN 18,400' : undefined,
      tone: (['ok', 'neutral', 'warn', 'default'] as const)[i % 4],
    })),
  },
};
