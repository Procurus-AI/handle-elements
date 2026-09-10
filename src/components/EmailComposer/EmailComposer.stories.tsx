import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { EmailComposer } from './EmailComposer';

const channels = [
  { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon /> },
  { id: 'email', label: 'Email', icon: <EmailIcon /> },
  { id: 'phone', label: 'Phone', icon: <PhoneIcon /> },
];

const draft = `Hi Elena,

Your six-month auto policy renews on June 18. Your premium changed from $702 to $724, a 3.1% increase driven by Travis County base rates.

You're newly eligible for our multi-vehicle discount — about $58 off.

Let us know if you're interested in renewing and claiming this discount, and we can schedule a quick chat to finalize the details.

Best regards,
Acme Insurance`;

const meta = {
  title: 'Elements/Email Composer',
  component: EmailComposer,
  parameters: { layout: 'centered' },
  args: {
    title: 'New message',
    meta: 'Drafted by Handle',
    channels,
    defaultActiveChannel: 'email',
    defaultTo: [{ id: 'elena', label: 'elena.alvarez@maple.co' }],
    from: { id: 'renewals', label: 'renewals@acme-insurance.com' },
    defaultSubject: 'Your upcoming auto renewal',
    defaultValue: draft,
  },
} satisfies Meta<typeof EmailComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A complete AI-drafted email with channel handoff and clipboard feedback. */
export const Draft: Story = {
  render: (args) => {
    const [channel, setChannel] = useState('email');
    return (
      <div style={{ width: 700, maxWidth: 'calc(100vw - var(--he-space-6))' }}>
        <EmailComposer
          {...args}
          activeChannel={channel}
          onChannelChange={(next) => setChannel(next.id)}
          actions={
            <>
              <Button>Approve &amp; send</Button>
              <Button variant="outline">Edit</Button>
            </>
          }
        />
      </div>
    );
  },
};

/** The composer collapses its window controls without losing the channel picker. */
export const Compact: Story = {
  render: (args) => (
    <div style={{ width: 390, maxWidth: 'calc(100vw - var(--he-space-6))' }}>
      <EmailComposer
        {...args}
        actions={<Button style={{ width: '100%' }}>Use draft</Button>}
      />
    </div>
  ),
};

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M12.5 7.2a5 5 0 0 1-7.4 4.4l-2.6.7.7-2.5a5 5 0 1 1 9.3-2.6Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M5.3 4.8c.3 2.2 1.4 3.3 3.7 3.9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.5" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="m2.3 4 5.2 4 5.2-4" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M4.1 1.8 6 4.9 4.8 6.1c.7 1.7 1.9 2.9 3.6 3.6l1.2-1.2 3.1 1.9-.4 2c-.1.5-.6.9-1.1.9a9.6 9.6 0 0 1-9.5-9.5c0-.5.4-1 .9-1.1l1.5-.9Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
