import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { ConfirmDialog, Modal } from './Modal';

const meta = {
  title: 'Elements/Modal',
  component: Modal,
  args: {
    open: false,
    onClose: () => {},
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Export transactions"
          description="Choose the format for this filtered view."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Export</Button>
            </>
          }
        >
          <p style={{ margin: 0, color: 'var(--he-text-dim)' }}>
            The export includes visible columns, active filters, and the current sort order.
          </p>
        </Modal>
      </>
    );
  },
};

export const Confirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Archive account
        </Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => undefined}
          intent="destructive"
          title="Archive this account?"
          description="This removes it from active portfolio views."
          confirmLabel="Archive"
        />
      </>
    );
  },
};
