import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarDay, type CalendarDayEvent } from './CalendarDay';

/**
 * One cell in the month grid. Today is a filled circle on the date, never a filled cell. Event
 * lines reuse the status dot colours.
 */
const meta = {
  title: 'Molecules/Calendar day',
  component: CalendarDay,
} satisfies Meta<typeof CalendarDay>;

export default meta;
type Story = StoryObj<typeof meta>;

const EVENTS: CalendarDayEvent[] = [
  { status: 'error', label: '52 vencidos' },
  { status: 'ok', label: '15 pagados' },
];

const cell = { width: 150, height: 96 } as const;

/** The Figma board: default, today, empty. */
export const Figma: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 16 }}>
      <CalendarDay style={cell} day={14} events={EVENTS} />
      <CalendarDay style={cell} day={14} today events={EVENTS} />
      <CalendarDay style={cell} empty />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <CalendarDay style={cell} day={9} events={[{ status: 'warn', label: '3 por vencer' }]} />
      <CalendarDay style={cell} day={10} selected events={EVENTS} />
      <CalendarDay style={cell} day={31} outside />
      <CalendarDay style={cell} day={12} />
    </div>
  ),
};
