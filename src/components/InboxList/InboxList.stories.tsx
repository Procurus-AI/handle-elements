import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { StatusPill } from '../StatusPill/StatusPill';
import { InboxItem, InboxList } from './InboxList';

const meta = {
  title: 'Components/InboxList',
  component: InboxList,
} satisfies Meta<typeof InboxList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Prioritized: Story = {
  render: () => (
    <InboxList aria-label="Cases needing attention">
      <InboxItem
        leading={<Avatar name="Juan Pablo Ramos" size="md" />}
        subject="Juan Pablo Ramos"
        subjectMeta="Updated 6 days ago"
        tone="error"
        statusLabel="Needs a human decision"
        title="A required document is missing"
        description="The identity document has not been received."
        status={<StatusPill status="error" label="Needs you" />}
        context="0 of 4 documents"
        progress={0}
        action={<Button size="sm">Review</Button>}
      />
      <InboxItem
        leading={<Avatar name="Rafael Alvarez" size="md" />}
        subject="Rafael Alvarez"
        subjectMeta="Updated 5 days ago"
        tone="warn"
        statusLabel="Agent review needed"
        title="INE needs a validity check"
        description="Handle found one exception and verified the remaining fields."
        status={<StatusPill status="warn" label="Review" />}
        context="3 of 4 documents"
        progress={75}
        action={<Button variant="ghost" size="sm">Open</Button>}
      />
    </InboxList>
  ),
};

/** The same queue at persistent-inbox density; semantics and actions stay intact. */
export const Compact: Story = {
  render: () => (
    <InboxList density="compact" aria-label="Compact cases needing attention">
      <InboxItem
        leading={<Avatar name="Juan Pablo Ramos" size="sm" />}
        subject="Juan Pablo Ramos"
        subjectMeta="Updated 6 days ago"
        tone="error"
        statusLabel="Needs a human decision"
        title="A required document is missing"
        description="Handle already prepared the request."
        status={<StatusPill status="error" appearance="soft" label="Needs you" />}
        context="0 of 4 documents"
        progress={0}
        action={<Button size="sm">Review</Button>}
      />
      <InboxItem
        leading={<Avatar name="Rafael Alvarez" size="sm" />}
        subject="Rafael Alvarez"
        subjectMeta="Updated 2 min ago"
        tone="error"
        statusLabel="Needs a human decision"
        title="INE validity could not be confirmed"
        description="The other fields are ready."
        context="4 of 4 documents"
        progress={100}
        progressTone="ok"
        action={<Button variant="ghost" size="sm">Open</Button>}
      />
    </InboxList>
  ),
};
