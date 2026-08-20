import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { Money } from '../Money/Money';
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
          description="Choose the file format and scope for the current view."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Export</Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 'var(--he-space-3)' }}>
            <div className="he-modal__summary">
              <div className="he-modal__summary-row">
                <span className="he-modal__summary-label">Filtered rows</span>
                <span className="he-modal__summary-value">248 transactions</span>
              </div>
              <div className="he-modal__summary-row">
                <span className="he-modal__summary-label">Amount shown</span>
                <Money value={1842000} currency="MXN" />
              </div>
            </div>
            <div className="he-modal__option-list">
              <div className="he-modal__option he-modal__option--selected">
                <span className="he-modal__option-mark" aria-hidden />
                <span className="he-modal__option-text">
                  <span className="he-modal__option-title">CSV report</span>
                  <span className="he-modal__option-hint">Visible columns, filters, and sort order.</span>
                </span>
                <Chip size="sm">Recommended</Chip>
              </div>
              <div className="he-modal__option">
                <span className="he-modal__option-mark" aria-hidden />
                <span className="he-modal__option-text">
                  <span className="he-modal__option-title">Excel workbook</span>
                  <span className="he-modal__option-hint">Includes a summary tab and raw ledger rows.</span>
                </span>
              </div>
            </div>
          </div>
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
