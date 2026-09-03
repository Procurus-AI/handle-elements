import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Select } from '../Input/Select';
import { Tabs } from '../Tabs/Tabs';
import { Composer } from './Composer';

const meta = {
  title: 'Elements/Composer',
  component: Composer,
  args: { placeholder: 'Ask anything about your book of business' },
} satisfies Meta<typeof Composer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Minimal: Story = {
  render: (args) => <Composer {...args} onSubmit={() => {}} maxWidth={640} />,
};

export const FullToolbar: Story = {
  render: (args) => {
    const [mode, setMode] = useState('search');
    const [value, setValue] = useState('');
    return (
      <Composer
        {...args}
        maxWidth={720}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={() => setValue('')}
        submitDisabled={value.trim() === ''}
        onMic={() => {}}
        toolbarStart={
          <>
            <Button variant="ghost" size="icon-sm" aria-label="Attach">
              +
            </Button>
            <Tabs
              variant="pills"
              size="sm"
              items={[
                { value: 'search', label: 'Search' },
                { value: 'agent', label: 'Agent' },
              ]}
              value={mode}
              onChange={setMode}
            />
          </>
        }
        toolbarEnd={
          <Select variant="ghost" size="sm" defaultValue="auto" aria-label="Model">
            <option value="auto">Model</option>
            <option value="fast">Fast</option>
            <option value="thorough">Thorough</option>
          </Select>
        }
      />
    );
  },
};

/** The centered greeting composer: hero box, ghost arrow, component-owned chips. */
export const Hero: Story = {
  render: () => (
    <Composer
      size="lg"
      align="center"
      maxWidth={648}
      placeholder="Ask your records…"
      submitVariant="ghost"
      onMic={() => {}}
      onSubmit={() => {}}
      suggestions={[
        { id: 'exp30', label: 'Which policies expire in the next 30 days?', count: 270 },
        { id: 'carrier', label: 'Premium by carrier' },
        { id: 'active', label: 'Active policies and total premium' },
      ]}
      onSuggestionSelect={(s) => console.log(s.id)}
    />
  ),
};

/** Suggestions are data, not markup — counts, tones and disabled states included. */
export const Suggestions: Story = {
  render: (args) => (
    <Composer
      {...args}
      align="start"
      maxWidth={640}
      onSubmit={() => {}}
      suggestions={[
        { id: 'exp30', label: 'Expiring in 30 days', count: 270 },
        { id: 'claims', label: 'Open claims', count: 18, countTone: 'neutral' },
        { id: 'draft', label: 'Draft a renewal email', disabled: true },
      ]}
      onSuggestionSelect={(s, i) => console.log(s.id, i)}
    />
  ),
};
