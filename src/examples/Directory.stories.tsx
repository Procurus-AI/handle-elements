import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../components/Button/Button';
import { Tabs } from '../components/Tabs/Tabs';
import { Card } from '../components/Card/Card';

/** Composite example — the connector-directory pattern (quiet underline nav,
 * pill filters, flat hairline cards with an icon tile and a ghost + action). */
const meta = {
  title: 'Pages/Examples/Directory',
  component: Card,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  { name: 'Sagitta AMS', desc: 'Sync policies, clients and invoices from Sagitta' },
  { name: 'EPIC', desc: 'Applied Epic book of business and accounting sync' },
  { name: 'AMS360', desc: 'Vertafore AMS360 policy and billing data' },
  { name: 'HawkSoft', desc: 'Client and policy records from HawkSoft CMS' },
  { name: 'QuickBooks', desc: 'Reconcile carrier statements against your books' },
  { name: 'Ivans', desc: 'Download commissions and policy updates via Ivans' },
];

function Tile({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 'var(--he-corner-lg)',
        background: 'var(--he-accent-default)',
        color: 'var(--he-accent-on-accent)',
        fontFamily: 'var(--he-font-sans)',
        fontSize: 'var(--he-type-heading-md-size)',
        fontWeight: 'var(--he-type-heading-md-weight)',
        flexShrink: 0,
      }}
    >
      {name[0]}
    </span>
  );
}

export const ConnectorGrid: Story = {
  render: () => {
    const [nav, setNav] = useState('connectors');
    const [filter, setFilter] = useState('discover');
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 32px 64px' }}>
        <Tabs
          items={[
            { value: 'connectors', label: 'Connectors' },
            { value: 'agents', label: 'Agents' },
            { value: 'workflows', label: 'Workflows' },
            { value: 'memory', label: 'Memory' },
          ]}
          value={nav}
          onChange={setNav}
        />
        <div style={{ padding: '28px 0 18px' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--he-font-sans)', fontWeight: 'var(--he-type-heading-lg-weight)', fontSize: 'var(--he-type-heading-lg-size)', letterSpacing: 'var(--he-type-heading-lg-tracking)' }}>
            Connectors
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--he-text-secondary)', fontSize: 'var(--he-type-body-sm-size)' }}>
            Connect services so Handle can access and act on your data
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <Tabs
            variant="pills"
            items={[
              { value: 'discover', label: 'Discover' },
              { value: 'all', label: 'All' },
              { value: 'connected', label: 'Connected' },
              { value: 'available', label: 'Available' },
            ]}
            value={filter}
            onChange={setFilter}
          />
          <Button variant="outline" size="sm">
            + Add custom connector
          </Button>
        </div>
        <div
          style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {ITEMS.map((item) => (
            <Card key={item.name} clickable padding="sm" tabIndex={0}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Tile name={item.name} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 'var(--he-type-body-sm-size)', fontWeight: 500 }}>{item.name}</div>
                  <div
                    style={{
                      fontSize: 'var(--he-type-caption-size)',
                      color: 'var(--he-text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label={`Add ${item.name}`}>
                  +
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  },
};
