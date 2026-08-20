import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Menu, MenuItem, MenuSeparator, Popover } from './Menu';

const meta = {
  title: 'Elements/Menu',
  component: Menu,
  args: {
    trigger: <Button variant="secondary">Actions</Button>,
    children: null,
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Actions: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">Actions</Button>} label="Account actions" placement="bottom-end">
      <MenuItem shortcut="⌘O">Open account</MenuItem>
      <MenuItem>Assign owner</MenuItem>
      <MenuItem>Export CSV</MenuItem>
      <MenuSeparator />
      <MenuItem destructive>Archive</MenuItem>
    </Menu>
  ),
};

export const ControlledPopover: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="outline">Details</Button>}
        contentClassName="he-menu-popover"
      >
        <div style={{ display: 'grid', gap: 8, width: 220, padding: 'var(--he-space-3)' }}>
          <strong style={{ fontSize: 'var(--he-body-sm)' }}>Portfolio sync</strong>
          <span style={{ color: 'var(--he-text-dim)', fontSize: 'var(--he-body-sm)' }}>
            Last completed hace 3d.
          </span>
        </div>
      </Popover>
    );
  },
};
