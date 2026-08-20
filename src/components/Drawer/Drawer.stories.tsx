import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Money } from '../Money/Money';
import { StatCard } from '../StatCard/StatCard';
import { Tabs } from '../Tabs/Tabs';
import { Drawer } from './Drawer';

const meta = {
  title: 'Elements/Drawer',
  component: Drawer,
  argTypes: {
    side: { control: 'inline-radio', options: ['right', 'left'] },
  },
  args: { open: false, onClose: () => {} },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { side: 'right', title: 'Account details' },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save changes</Button>
            </>
          }
        >
          <p style={{ marginTop: 0, color: 'var(--he-text-dim)' }}>
            Portfolio summary and pending actions for this account.
          </p>
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            <StatCard label="ARR" value={<Money value={210000} currency="MXN" compact />} delta={{ value: '12%', direction: 'up' }} />
            <StatCard label="Open tasks" value="4" footer="2 due this week" />
          </div>
        </Drawer>
      </>
    );
  },
};

export const LeftNoTitle: Story = {
  name: 'Left side, no title',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open filters
        </Button>
        <Drawer open={open} onClose={() => setOpen(false)} side="left" width="320px" ariaLabel="Filters">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--he-font-sans)', fontSize: 'var(--he-body)' }}>Filters</h3>
          <p style={{ color: 'var(--he-text-dim)' }}>Panel content scrolls independently of the page.</p>
        </Drawer>
      </>
    );
  },
};

/**
 * Structured header (`eyebrow` + `title` + `meta`) and a native `tabs` bar pinned
 * under the header — the body scrolls beneath it, so tab-switching is a built-in
 * concern of the Drawer, not something each screen re-composes.
 */
export const WithTabs: Story = {
  name: 'Eyebrow + meta + native tabs',
  render: () => {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('overview');
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open account</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          width="460px"
          eyebrow="Stuck in onboarding"
          title="Protec"
          meta={
            <>
              <span style={{ fontWeight: 500, color: 'var(--he-text)' }}>
                <Money as="span" value={2000} currency="USD" /> /mo
              </span>
              <span>· Onboarding-blocked</span>
            </>
          }
          tabs={
            <Tabs
              variant="underline"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'overview', label: 'Overview' },
                { value: 'triage', label: 'Triage' },
                { value: 'history', label: 'History' },
              ]}
            />
          }
          footer={<Button variant="secondary" onClick={() => setOpen(false)}>Close lead ↗</Button>}
        >
          {tab === 'overview' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <StatCard label="ARR" value={<Money value={24000} currency="USD" compact />} />
              <StatCard label="Open items" value="2" footer="1 bug · 1 request" />
            </div>
          )}
          {tab === 'triage' && <p style={{ color: 'var(--he-text-dim)' }}>Highest-priority item first.</p>}
          {tab === 'history' && <p style={{ color: 'var(--he-text-dim)' }}>Timeline of changes.</p>}
        </Drawer>
      </>
    );
  },
};
