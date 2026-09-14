import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
  Button,
  Composer,
  Container,
  DataTable,
  DescriptionItem,
  DescriptionList,
  Drawer,
  EmailComposer,
  Grid,
  List,
  ListItem,
  Money,
  PageHeader,
  Section,
  Stack,
  StatCard,
  StatCardGroup,
  StatusPill,
  Text,
  type DataTableColumn,
  type EmailComposerChannel,
} from '../index';

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="2" y="3.25" width="12" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.35" />
    <path d="m3.25 4.5 4.75 4 4.75-4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M13.4 7.65a5.35 5.35 0 0 1-7.92 4.7l-2.88.78.77-2.8A5.35 5.35 0 1 1 13.4 7.65Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M5.65 5.1c.18-.18.5-.15.62.08l.58 1.08c.1.2.07.42-.08.57l-.38.38c.46.87 1.04 1.45 1.91 1.91l.38-.38c.15-.15.38-.18.57-.08l1.08.58c.23.12.27.44.08.62-.42.42-.98.64-1.58.54-1.9-.32-3.94-2.36-4.26-4.26-.1-.6.12-1.16.54-1.58Z" fill="currentColor" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5.1 2.65 3.7 3.3c-.7.32-.98 1.14-.66 1.84 1.55 3.36 4.3 6.11 7.66 7.66.7.32 1.52.04 1.84-.66l.65-1.4a.9.9 0 0 0-.33-1.13l-1.72-1.08a.9.9 0 0 0-1.08.1l-.72.66a8.5 8.5 0 0 1-2.65-2.65l.66-.72a.9.9 0 0 0 .1-1.08L6.23 2.98a.9.9 0 0 0-1.13-.33Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NoteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3 2.5h7l3 3v8H3v-11Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M10 2.5v3h3M5.5 8h5M5.5 10.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 4.8v3.5l2.3 1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="5.25" r="2.25" stroke="currentColor" strokeWidth="1.3" />
    <path d="M3.75 13c.3-2.25 1.72-3.5 4.25-3.5s3.95 1.25 4.25 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const LinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M6.3 9.7 9.7 6.3M6.2 11.8l-1 .95a2.65 2.65 0 0 1-3.75-3.75l2.1-2.1A2.65 2.65 0 0 1 7.3 6.8M9.8 4.2l1-.95A2.65 2.65 0 0 1 14.55 7l-2.1 2.1a2.65 2.65 0 0 1-3.75.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const CHANNELS: EmailComposerChannel[] = [
  { id: 'email', label: 'Email', icon: <MailIcon /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon /> },
  { id: 'phone', label: 'Phone', icon: <PhoneIcon /> },
];

type PaymentState = 'pending' | 'paid' | 'cancelled';

interface PaymentRow {
  id: string;
  client: string;
  policy: string;
  insurer: string;
  amount: number;
  due: string;
  state: PaymentState;
}

const PAYMENTS: PaymentRow[] = [
  { id: '30331577931', client: 'Ana Lucia Flores Lugo', policy: '722349198', insurer: 'GNP', amount: 6090.79, due: '10-09-2026', state: 'pending' },
  { id: '30331578104', client: 'Arturo Gerardo Lozano', policy: '722351104', insurer: 'GNP', amount: 2441.08, due: '11-09-2026', state: 'pending' },
  { id: '30331578290', client: 'Barbara Guerra Cantú', policy: '722353290', insurer: 'AXA', amount: 1950.4, due: '12-09-2026', state: 'paid' },
  { id: '30331578512', client: 'Centro Educativo Nido S.C.', policy: '38523536', insurer: 'GNP', amount: 10682.15, due: '13-09-2026', state: 'pending' },
  { id: '30331578844', client: 'Daniel David Cohen Orozco', policy: '186007555', insurer: 'MetLife', amount: 3180, due: '14-09-2026', state: 'cancelled' },
];

const PAYMENT_STATUS = {
  pending: { status: 'warn' as const, label: 'Pending' },
  paid: { status: 'ok' as const, label: 'Paid' },
  cancelled: { status: 'neutral' as const, label: 'Cancelled' },
};

const EMAIL_SUBJECT = 'Recibo pendiente de tu póliza 722349198 con GNP Seguros';
const EMAIL_BODY = `Hola Ana,

Te escribimos por el recibo de tu póliza 722349198 con GNP Seguros (recibo 30331577931), que vence el 2026-09-10.

Monto pendiente: $6,090.79

¿Nos confirmas si ya realizaste el pago? Si ya lo hiciste, compártenos la fecha y la referencia para verificarlo. Si aún no, dinos qué día podrías regularizarlo y te apoyamos con el proceso.

Quedamos atentos.`;

const meta = {
  title: 'Examples/Payment Drawer',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A payment record with deliberate hierarchy, assembled exclusively from
 * Handle Elements. Contact actions are a coherent group; secondary workflow
 * actions become rows instead of an improvised pill cloud. Email and WhatsApp
 * open through Drawer's generic connected `companion` slot, while Notes shows
 * that the slot accepts any other Handle element without changing the drawer.
 */
function PaymentDrawerExample({ minimized = false }: { minimized?: boolean }) {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [companion, setCompanion] = useState<'email' | 'whatsapp' | 'phone' | 'note' | null>('email');
    const [sent, setSent] = useState(false);
    const [note, setNote] = useState('');
    const [noteSaved, setNoteSaved] = useState(false);
    const [snoozed, setSnoozed] = useState(false);
    const [assigned, setAssigned] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [callStarted, setCallStarted] = useState(false);

    const openCompanion = (next: 'email' | 'whatsapp' | 'phone' | 'note') => {
      setSent(false);
      setCompanion(next);
    };

    const copyPaymentLink = () => {
      void navigator.clipboard?.writeText('https://pay.handle.ai/30331577931').catch(() => undefined);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1600);
    };

    const columns: DataTableColumn<PaymentRow>[] = [
      { key: 'client', header: 'Client', sortable: true, truncate: true, width: '30%' },
      { key: 'policy', header: 'Policy', sortable: true },
      { key: 'insurer', header: 'Insurer', sortable: true },
      {
        key: 'amount',
        header: 'Amount',
        align: 'end',
        sortable: true,
        render: (row) => <Money value={row.amount} currency="MXN" minimumFractionDigits={2} />,
      },
      { key: 'due', header: 'Due date', align: 'end' },
      {
        key: 'state',
        header: 'Status',
        align: 'end',
        render: (row) => <StatusPill {...PAYMENT_STATUS[row.state]} appearance="soft" />,
      },
    ];

    const closeCompanion = () => setCompanion(null);
    const closeDrawer = () => {
      setDrawerOpen(false);
      setCompanion(null);
    };
    const channel = companion === 'whatsapp' ? 'whatsapp' : 'email';

    const messageComposer = companion === 'email' || companion === 'whatsapp' ? (
      <EmailComposer
        variant={minimized ? 'window' : 'embedded'}
        density={minimized ? 'compact' : 'default'}
        title={companion === 'email' ? 'Email Ana Lucia' : 'Message Ana Lucia'}
        meta="Payment reminder"
        channels={CHANNELS}
        activeChannel={channel}
        onChannelChange={(next) => openCompanion(next.id as 'email' | 'whatsapp' | 'phone')}
        channelsLabel="Contact channel"
        defaultTo={[{ id: 'ana', label: 'customer@email.com', address: 'customer@email.com' }]}
        from={{ id: 'collections', label: 'Collections', address: 'collections@handle.ai' }}
        defaultSubject={EMAIL_SUBJECT}
        defaultValue={EMAIL_BODY}
        onClose={closeCompanion}
        onCancel={closeCompanion}
        onSend={() => setSent(true)}
        sendDisabled={sent}
        sendLabel={sent ? 'Sent' : companion === 'whatsapp' ? 'Send WhatsApp' : 'Send email'}
        headerVariant={minimized ? 'actions' : 'default'}
      />
    ) : null;

    const noteComposer = companion === 'note' ? (
      <Container max="600px" padding={5}>
        <Stack gap={6}>
          <PageHeader
            size="section"
            eyebrow="Customer record"
            title="Add a note"
            lede="Keep the payment context visible while you write."
            aside={
              <Button variant="ghost" size="icon-sm" aria-label="Close note" onClick={closeCompanion}>
                <CloseIcon />
              </Button>
            }
          />
          <Composer
            size="lg"
            rows={8}
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setNoteSaved(false);
            }}
            placeholder="Write an internal note about this payment…"
            onSubmit={() => setNoteSaved(true)}
            submitDisabled={note.trim() === '' || noteSaved}
            submitLabel="Save note"
          />
          {noteSaved && <StatusPill status="ok" label="Note saved" appearance="soft" />}
        </Stack>
      </Container>
    ) : null;

    const callPanel = companion === 'phone' ? (
      <Container max="600px" padding={5}>
        <Stack gap={6}>
          <PageHeader
            size="section"
            eyebrow="Call"
            title="Ana Lucia Flores Lugo"
            subtitle="Payment follow-up · Receipt 30331577931"
            aside={
              <Button variant="ghost" size="icon-sm" aria-label="Close call panel" onClick={closeCompanion}>
                <CloseIcon />
              </Button>
            }
          />
          <DescriptionList columns={1}>
            <DescriptionItem label="Phone" value="+52 55 1234 5678" />
            <DescriptionItem label="Local time" value="10:16 AM" />
            <DescriptionItem label="Reason" value="Pending payment · Due today" />
          </DescriptionList>
          <Button size="lg" disabled={callStarted} onClick={() => setCallStarted(true)}>
            <PhoneIcon /> {callStarted ? 'Call in progress' : 'Start call'}
          </Button>
        </Stack>
      </Container>
    ) : null;

    const floatingMessage = minimized && (companion === 'email' || companion === 'whatsapp');

    return (
      <Container max="1240px" padding={6}>
        <Stack gap={6}>
          <PageHeader
            eyebrow="Insurance operations"
            title="Payment validator"
            subtitle="Thursday, September 10"
            lede="Review upcoming receipts and follow up without losing the record context."
          />

          <StatCardGroup columns={3} variant="rail">
            <StatCard label="Pending today" value="12" tone="warn" footer="$205,815.09 MXN" />
            <StatCard label="Collected" value="68%" tone="ok" footer="$139,954.26 MXN" />
            <StatCard label="Needs follow-up" value="4" tone="neutral" footer="2 due today" />
          </StatCardGroup>

          <DataTable
            columns={columns}
            data={PAYMENTS}
            caption="Payment receipts"
            rowKey={(row) => row.id}
            onRowClick={() => setDrawerOpen(true)}
            isRowSelected={(row) => drawerOpen && row.id === '30331577931'}
            defaultSort={{ key: 'due', direction: 'asc' }}
            minTableWidth={820}
          />
        </Stack>

        <Drawer
          open={drawerOpen}
          onClose={closeDrawer}
          width="456px"
          companionWidth={floatingMessage ? '500px' : '600px'}
          companionLabel={companion === 'note' ? 'Note workspace' : companion === 'phone' ? 'Call workspace' : 'Message composer'}
          companion={messageComposer ?? noteComposer ?? callPanel}
          companionVariant={floatingMessage ? 'floating' : 'panel'}
          onCompanionClose={closeCompanion}
          eyebrow="Pending payment · Receipt 30331577931"
          title="Ana Lucia Flores Lugo"
          meta={
            <>
              <StatusPill status="warn" label="Pending" appearance="soft" />
              <Text as="span" size="caption" tone="dim">Due today</Text>
            </>
          }
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={closeDrawer}>Close</Button>
              <Button size="sm" onClick={copyPaymentLink}>
                <LinkIcon /> {linkCopied ? 'Link copied' : 'Copy payment link'}
              </Button>
            </>
          }
        >
          <Stack gap={6}>
            <StatCard
              variant="plain"
              size="lg"
              label="Amount due"
              value={<Money value={6090.79} currency="MXN" locale="en-MX" minimumFractionDigits={2} showCurrencyCode />}
              footer="Monthly installment · Series 7 of 12"
            />

            <Section title="Contact customer">
              <Grid columns={3} gap={2}>
                <Button
                  size="sm"
                  variant={companion === 'email' ? 'default' : 'secondary'}
                  onClick={() => openCompanion('email')}
                >
                  <MailIcon /> Email
                </Button>
                <Button
                  size="sm"
                  variant={companion === 'whatsapp' ? 'default' : 'secondary'}
                  onClick={() => openCompanion('whatsapp')}
                >
                  <WhatsAppIcon /> WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant={companion === 'phone' ? 'default' : 'secondary'}
                  onClick={() => openCompanion('phone')}
                >
                  <PhoneIcon /> Call
                </Button>
              </Grid>
            </Section>

            <Section title="Payment details">
              <DescriptionList columns={2} size="sm">
                <DescriptionItem label="Due date" value="10-09-2026" />
                <DescriptionItem label="Payment method" value="Mensual" />
                <DescriptionItem label="Coverage starts" value="10-09-2026" />
                <DescriptionItem label="Coverage ends" value="10-10-2026" />
              </DescriptionList>
            </Section>

            <Section title="Policy details">
              <DescriptionList columns={2} size="sm">
                <DescriptionItem label="Policy" value="722349198" />
                <DescriptionItem label="Insurer" value="GNP" />
                <DescriptionItem label="Branch" value="Gastos Médicos Mayores" wide />
                <DescriptionItem label="Receipt" value="30331577931" />
                <DescriptionItem label="Series" value="7/12" />
                <DescriptionItem label="Endorsement" />
                <DescriptionItem label="Clause" />
                <DescriptionItem label="Agent key" value="0073060001" wide />
              </DescriptionList>
            </Section>

            <Section title="Workflow" flush>
              <List variant="divided" size="sm">
                <ListItem
                  leading={<NoteIcon />}
                  primary="Add note"
                  secondary="Keep context on the customer record"
                  onSelect={() => openCompanion('note')}
                  active={companion === 'note'}
                />
                <ListItem
                  leading={<ClockIcon />}
                  primary={snoozed ? 'Snoozed until tomorrow' : 'Snooze for 24 hours'}
                  secondary={snoozed ? 'Reminder set for Sep 11 at 10:16 AM' : 'Move this receipt out of today’s queue'}
                  onSelect={() => setSnoozed((value) => !value)}
                  active={snoozed}
                />
                <ListItem
                  leading={<UserIcon />}
                  primary={assigned ? 'Assigned to you' : 'Assign to me'}
                  secondary={assigned ? 'You own the next follow-up' : 'Take ownership of this payment'}
                  onSelect={() => setAssigned((value) => !value)}
                  active={assigned}
                />
              </List>
            </Section>
          </Stack>
        </Drawer>
      </Container>
    );
}

export const ConnectedComposer: Story = {
  render: () => <PaymentDrawerExample />,
};

/**
 * The same payment workflow with a compact, bottom-aligned message window.
 * It preserves the drawer and page context without dedicating the full height
 * to drafting; closing it returns focus to the payment record.
 */
export const MinimizedComposer: Story = {
  name: 'Minimized composer',
  render: () => <PaymentDrawerExample minimized />,
};
