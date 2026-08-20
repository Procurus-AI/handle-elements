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

const MicIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <rect x="5" y="1.5" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2.8 6.5C2.8 8.9 4.7 10.6 7 10.6C9.3 10.6 11.2 8.9 11.2 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M7 10.6V12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const Minimal: Story = {
  render: (args) => <Composer {...args} onSubmit={() => {}} style={{ maxWidth: 640 }} />,
};

export const FullToolbar: Story = {
  render: (args) => {
    const [mode, setMode] = useState('search');
    const [value, setValue] = useState('');
    return (
      <div style={{ maxWidth: 720 }}>
        <Composer
          {...args}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onSubmit={() => setValue('')}
          submitDisabled={value.trim() === ''}
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
            <>
              <Select variant="ghost" size="sm" defaultValue="auto" aria-label="Model">
                <option value="auto">Model</option>
                <option value="fast">Fast</option>
                <option value="thorough">Thorough</option>
              </Select>
              <Button variant="ghost" size="icon-sm" aria-label="Dictate">
                {MicIcon}
              </Button>
            </>
          }
        />
      </div>
    );
  },
};
