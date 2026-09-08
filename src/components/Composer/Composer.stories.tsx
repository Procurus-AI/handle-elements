import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ActivityTrail } from '../AgentResponse/AgentResponse';
import { Button } from '../Button/Button';
import { Select } from '../Input/Select';
import { Tabs } from '../Tabs/Tabs';
import { Composer } from './Composer';

const meta = {
  title: 'Elements/Composer',
  component: Composer,
  args: { placeholder: 'Ask anything about your book of business' },
  argTypes: {
    suggestionPlacement: { control: 'select', options: ['before', 'after'] },
    layout: { control: 'select', options: ['stacked', 'inline'] },
    variant: { control: 'select', options: ['default', 'dock'] },
  },
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

/** Contextual agent shortcuts can lead into the composer without bespoke markup. */
export const ShortcutsAbove: Story = {
  render: (args) => (
    <Composer
      {...args}
      size="lg"
      maxWidth={720}
      placeholder="Pregúntale a Handle o indica qué hacer…"
      suggestionPlacement="before"
      onSubmit={() => {}}
      suggestions={[
        { id: 'review', label: 'Revisa los documentos' },
        { id: 'blocked', label: '¿Por qué está bloqueado?' },
        { id: 'request', label: 'Pide el documento faltante' },
        { id: 'package', label: 'Prepara el paquete' },
      ]}
      onSuggestionSelect={(s) => console.log(s.id)}
    />
  ),
};

/** A single-row command surface for a persistent agent dock. */
export const InlineDock: Story = {
  render: (args) => (
    <Composer
      {...args}
      layout="inline"
      size="sm"
      maxWidth={720}
      placeholder="Ask Handle or tell it what to do…"
      submitLabel="Send to Handle"
      onMic={() => {}}
      onSubmit={() => {}}
    />
  ),
};

/** Input-led dock with one compact activity/action band beneath it. */
export const UnifiedAgentDock: Story = {
  render: (args) => (
    <Composer
      {...args}
      variant="dock"
      size="sm"
      align="center"
      maxWidth={760}
      aria-label="Message Handle"
      placeholder="Ask Handle or tell it what to do…"
      activity={
        <ActivityTrail
          variant="status"
          icon={
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <path
                d="M7.5 1.7c.3 3.5 2.1 5.3 5.5 5.8-3.4.4-5.2 2.3-5.5 5.8-.4-3.5-2.2-5.4-5.5-5.8 3.3-.5 5.1-2.3 5.5-5.8Z"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
            </svg>
          }
          label="Handle"
          steps={[
            { id: 'review', label: 'Reviewed 4 documents' },
            { id: 'alert', label: 'Found 1 exception' },
          ]}
        />
      }
      suggestions={[
        { id: 'why', label: 'Why is it blocked?' },
        { id: 'request', label: 'Request the missing document' },
        { id: 'package', label: 'Prepare package' },
      ]}
      suggestionsLabel="Suggested actions"
      onSuggestionSelect={(suggestion) => console.log(suggestion.id)}
      submitLabel="Send to Handle"
      onSubmit={() => {}}
    />
  ),
};
