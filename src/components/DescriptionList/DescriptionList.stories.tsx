import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateText } from '../DateText/DateText';
import { Money } from '../Money/Money';
import { DescriptionItem, DescriptionList } from './DescriptionList';

/**
 * Label/value pairs at record-drawer density. The grid holds two intrinsic
 * columns and collapses to one when the tracks would go under 168px — no media
 * query, no `container-type`, so a 420px drawer and a 420px panel column behave
 * identically.
 *
 * Values are components (`Money`, `DateText`), never pre-formatted strings, so a
 * missing value prints the same faint em dash whichever path produced it.
 */
const meta = {
  title: 'Elements/Description List',
  component: DescriptionList,
  argTypes: {
    columns: { control: 'inline-radio', options: [1, 2] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

function Summary() {
  return (
    <DescriptionList>
      <DescriptionItem label="Annual premium" value={<Money value={57840} currency="MXN" showCurrencyCode />} />
      <DescriptionItem label="Policies" value={1} />
      <DescriptionItem
        label="Next renewal"
        value={<DateText date={new Date(2026, 2, 12)} dateStyle="medium" locale="en-US" />}
      />
      <DescriptionItem label="Pending receipts" value={3} />
      <DescriptionItem label="Carriers" value="HDI Seguros" />
      <DescriptionItem
        label="Customer since"
        value={<DateText date={new Date(2021, 8, 12)} dateStyle="medium" locale="en-US" />}
      />
    </DescriptionList>
  );
}

export const Playground: Story = {
  args: { columns: 2, size: 'md' },
  render: (args) => (
    <div style={{ width: 480 }}>
      <DescriptionList {...args}>
        <DescriptionItem label="Annual premium" value={<Money value={57840} currency="MXN" showCurrencyCode />} />
        <DescriptionItem label="Policies" value={1} />
        <DescriptionItem label="Carriers" value="HDI Seguros" />
        <DescriptionItem label="Pending receipts" value={3} />
      </DescriptionList>
    </div>
  ),
};

// The drawer's six real pairs at 480px and at 300px, side by side: the collapse
// to one column happens on its own, with nothing resized.
export const PortfolioSummary: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <div style={{ width: 480 }}>
        <Caption>480px — two columns</Caption>
        <Summary />
      </div>
      <div style={{ width: 300 }}>
        <Caption>300px — collapsed to one</Caption>
        <Summary />
      </div>
    </div>
  ),
};

// null, '' and a Money with a null value all land on the same faint em dash.
export const MissingValues: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <DescriptionList>
        <DescriptionItem label="Next renewal" value={null} />
        <DescriptionItem label="Carriers" value="" />
        <DescriptionItem label="Annual premium" value={<Money value={null} currency="MXN" />} />
      </DescriptionList>
    </div>
  ),
};

export const Wide: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <DescriptionList>
        <DescriptionItem label="Policies" value={1} />
        <DescriptionItem label="Pending receipts" value={3} />
        <DescriptionItem
          label="Billing address"
          wide
          value="Av. Ricardo Margáin Zozaya 575, Santa Engracia, 66267 San Pedro Garza García, N.L."
        />
      </DescriptionList>
    </div>
  ),
};

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'block',
        marginBottom: 12,
        fontFamily: 'var(--he-font-mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 'var(--he-tracking-caps)',
        color: 'var(--he-text-faint)',
      }}
    >
      {children}
    </span>
  );
}
