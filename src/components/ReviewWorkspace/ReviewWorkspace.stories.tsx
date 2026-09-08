import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { List, ListItem } from '../List/List';
import { ReviewField, ReviewFieldList } from '../ReviewField/ReviewField';
import { ReviewConclusion, ReviewWorkspace } from './ReviewWorkspace';

const meta = {
  title: 'Elements/Review Workspace',
  component: ReviewWorkspace,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ReviewWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

const documents = [
  { name: 'INE', file: 'DOC-0027.pdf', status: 'Review needed' },
  { name: 'CURP', file: 'DOC-0029.pdf', status: 'Classified' },
  { name: 'Proof of address', file: 'DOC-0030.pdf', status: 'Review needed' },
  { name: 'Tax certificate', file: 'DOC-0028.pdf', status: 'Review needed' },
];

function Navigation() {
  return (
    <Pane title="Documents" eyebrow="4 files">
      <List variant="plain">
        {documents.map((document, index) => (
          <ListItem
            key={document.file}
            active={index === 0}
            onSelect={() => {}}
            primary={document.name}
            secondary={document.file}
            value={document.status}
          />
        ))}
      </List>
    </Pane>
  );
}

function Document() {
  return (
    <Pane title="INE" eyebrow="Extracted data">
      <p style={{ margin: 0, color: 'var(--he-text-dim)' }}>
        Identity document identified with high confidence. One field needs a human review.
      </p>
      <ReviewFieldList aria-label="Extracted identity fields">
        <ReviewField label="Name" value="RAFAEL ALVAREZ BALLESTEROS" tone="ok" statusLabel="Verified" />
        <ReviewField label="CURP" value="AABR980618HVZLLF06" tone="ok" statusLabel="Verified" />
        <ReviewField
          label="Valid through"
          value="2020–2030"
          tone="warn"
          statusLabel="Review needed"
          summary="The OCR result does not contain an exact expiry date."
          evidence={<p style={{ margin: 0 }}>Source text: “Vigencia 2020–2030” · Page 1</p>}
        />
      </ReviewFieldList>
    </Pane>
  );
}

function Inspector() {
  return (
    <ReviewConclusion
      eyebrow="1 issue"
      title="Validity needs confirmation"
      meta="92% confidence · Reviewed 2 min ago"
      summary="Handle could not verify the INE validity against a reliable reference date."
      primaryAction={<Button>Review INE</Button>}
      factsLabel="Review context"
      facts={[
        { id: 'document', label: 'Document', value: 'INE' },
        { id: 'validity', label: 'Extracted', value: '2020–2030' },
        { id: 'checks', label: 'Other checks', value: '7 resolved' },
      ]}
    />
  );
}

export const ThreePane: Story = {
  args: {
    navigation: <Navigation />,
    children: <Document />,
    inspector: <Inspector />,
    navigationLabel: 'Case documents',
    documentLabel: 'Selected document',
    inspectorLabel: 'Review conclusions',
  },
  render: (args) => (
    <div style={{ height: 'calc(100vh - var(--he-space-7))', minHeight: 560 }}>
      <ReviewWorkspace {...args} />
    </div>
  ),
};

/** The query keys off this component's width, not the browser viewport. */
export const NarrowContainer: Story = {
  ...ThreePane,
  render: (args) => (
    <div style={{ width: 720, maxWidth: '100%', height: 880 }}>
      <ReviewWorkspace {...args} />
    </div>
  ),
};

/** Compact supporting rails preserve all three panes inside an app stage. */
export const Contained: Story = {
  ...ThreePane,
  args: {
    ...ThreePane.args,
    variant: 'contained',
  },
  render: (args) => (
    <div style={{ width: 862, maxWidth: '100%', height: 720 }}>
      <ReviewWorkspace {...args} />
    </div>
  ),
};

/** Borderless agent conclusion at the intended inspector-rail measure. */
export const CompactConclusion: Story = {
  args: ThreePane.args,
  render: () => (
    <div style={{ width: 288, maxWidth: '100%', background: 'var(--he-bg)' }}>
      <Inspector />
    </div>
  ),
};

function Pane({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        gap: 'var(--he-space-4)',
        padding: 'var(--he-space-5)',
      }}
    >
      <span
        style={{
          color: 'var(--he-text-faint)',
          fontFamily: 'var(--he-font-mono)',
          fontSize: 'var(--he-caption)',
          letterSpacing: 'var(--he-tracking-caps)',
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </span>
      <h2 style={{ margin: 0, fontFamily: 'var(--he-font-display)', fontSize: 'var(--he-heading)' }}>{title}</h2>
      {children}
    </div>
  );
}
