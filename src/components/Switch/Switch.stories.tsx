import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Card } from '../Card/Card';
import { Switch } from './Switch';

const meta = {
  title: 'Elements/Switch',
  component: Switch,
  args: { label: 'Include realized gains', defaultChecked: true },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Settings: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Card style={{ display: 'grid', gap: 18, maxWidth: 420 }}>
        <Switch
          checked={checked}
          onCheckedChange={setChecked}
          label="Live market data"
          description="Refresh prices and holdings while the page is open."
        />
        <Switch label="Email summary" description="Send a daily finance digest." />
        <Switch label="Locked control" disabled defaultChecked />
      </Card>
    );
  },
};
