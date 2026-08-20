import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { StatCard } from '../StatCard/StatCard';
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
            Slides in from the {args.side}. Press <kbd>Esc</kbd> or click the scrim to close.
          </p>
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            <StatCard label="ARR" value="$210K" delta={{ value: '12%', direction: 'up' }} />
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
          <h3 style={{ marginTop: 0, fontFamily: 'var(--he-font-display)' }}>Filters</h3>
          <p style={{ color: 'var(--he-text-dim)' }}>Panel content scrolls independently of the page.</p>
        </Drawer>
      </>
    );
  },
};
