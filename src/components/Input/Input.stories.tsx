import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';

const meta = {
  title: 'Elements/Input',
  component: Input,
  args: { placeholder: 'Client or policy number' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'pill'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const SearchIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <circle cx="6.2" cy="6.2" r="4.4" stroke="currentColor" strokeWidth="1.4" />
    <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
      <Input placeholder="Default input" />
      <Input variant="pill" icon={SearchIcon} placeholder="Search all connectors" />
      <Input
        variant="pill"
        icon={SearchIcon}
        placeholder="With shortcut hint"
        end={<span style={{ fontFamily: 'var(--he-font-mono)', fontSize: 10.5 }}>⌘K</span>}
      />
      <Input size="sm" placeholder="Small" />
      <Input size="lg" placeholder="Large" />
      <Input placeholder="Disabled" disabled />
    </div>
  ),
};

export const SelectAndTextarea: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <Select defaultValue="all">
          <option value="all">All categories</option>
          <option value="ams">AMS</option>
          <option value="accounting">Accounting</option>
        </Select>
        <Select size="sm" defaultValue="q3">
          <option value="q3">Q3 2026</option>
          <option value="q2">Q2 2026</option>
        </Select>
        <Select variant="ghost" defaultValue="model">
          <option value="model">Model</option>
          <option value="fast">Fast</option>
        </Select>
      </div>
      <Textarea placeholder="Notes for the renewal call…" />
    </div>
  ),
};
