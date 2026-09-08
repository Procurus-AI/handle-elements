import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { ReviewField, ReviewFieldList } from './ReviewField';

const meta = {
  title: 'Elements/Review Field',
  component: ReviewField,
  argTypes: {
    tone: { control: 'inline-radio', options: ['ok', 'warn', 'error', 'neutral'] },
    defaultEvidenceOpen: { control: 'boolean' },
  },
} satisfies Meta<typeof ReviewField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: 'Valid through',
    value: '2020–2030',
    tone: 'warn',
    statusLabel: 'Review needed',
    summary: 'The exact expiry date could not be validated.',
    meta: 'INE · OCR confidence 92% · Page 1',
    evidenceLabel: 'Show extracted evidence',
    evidence: <Evidence extracted="Vigencia 2020–2030" reference="No reference value" />,
  },
  render: (args) => (
    <div style={{ maxWidth: 760 }}>
      <ReviewFieldList>
        <ReviewField {...args} />
      </ReviewFieldList>
    </div>
  ),
};

/** Correct fields collapse into scan-friendly lines; only the exception opens. */
export const ProgressiveDisclosure: Story = {
  args: { label: 'Field', value: 'Value', tone: 'neutral', statusLabel: 'Informational' },
  render: () => (
    <div style={{ maxWidth: 820 }}>
      <ReviewFieldList aria-label="Extracted INE fields">
        <ReviewField
          label="Name"
          value="RAFAEL ALVAREZ BALLESTEROS"
          tone="ok"
          statusLabel="Verified"
          meta="Matches CURP"
        />
        <ReviewField
          label="CURP"
          value="AABR980618HVZLLF06"
          tone="ok"
          statusLabel="Verified"
          meta="Matches application"
        />
        <ReviewField
          label="Valid through"
          value="2020–2030"
          tone="warn"
          statusLabel="Review needed"
          summary="The document shows a range, but no exact expiry date was extracted."
          meta="DOC-0027.pdf · Page 1"
          evidenceLabel="Review evidence"
          evidence={<Evidence extracted="Vigencia 2020–2030" reference="No reference value" />}
          scrollEvidenceOnOpen
          actions={<Button size="xs">Confirm date</Button>}
        />
        <ReviewField
          label="Voter key"
          value="ALBLRF98061830H400"
          tone="neutral"
          statusLabel="Not evaluated"
        />
      </ReviewFieldList>
    </div>
  ),
};

export const HumanDecision: Story = {
  args: { label: 'Field', value: 'Value', tone: 'neutral', statusLabel: 'Informational' },
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div style={{ maxWidth: 760 }}>
        <ReviewFieldList>
          <ReviewField
            label="RFC"
            value="AABR980618KQ4"
            tone="error"
            statusLabel="Human decision"
            summary="The extracted RFC does not match the tax certificate."
            meta="Application compared with CSF · Confidence 99%"
            evidenceLabel={open ? 'Hide comparison' : 'Show comparison'}
            evidence={<Evidence extracted="AABR980618KQ4" reference="AABR980618HQ7" />}
            evidenceOpen={open}
            onEvidenceOpenChange={setOpen}
            actions={<Button size="xs">Resolve</Button>}
          />
        </ReviewFieldList>
      </div>
    );
  },
};

function Evidence({ extracted, reference }: { extracted: string; reference: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--he-space-4)',
      }}
    >
      <EvidenceValue label="Extracted" value={extracted} />
      <EvidenceValue label="Compared with" value={reference} />
    </div>
  );
}

function EvidenceValue({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--he-space-1)' }}>
      <span
        style={{
          color: 'var(--he-text-faint)',
          fontFamily: 'var(--he-font-mono)',
          fontSize: 'var(--he-caption)',
          letterSpacing: 'var(--he-tracking-caps)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
