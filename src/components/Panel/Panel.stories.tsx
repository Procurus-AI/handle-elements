import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Grid } from '../Layout/Layout';
import { List, ListItem, type ListItemStatus } from '../List/List';
import { StatCard, StatCardGroup } from '../StatCard/StatCard';
import { Tabs } from '../Tabs/Tabs';
import { Panel } from './Panel';

const meta = {
  title: 'Elements/Panel',
  component: Panel,
  args: {
    eyebrow: 'Contacto',
    title: 'Resultados de contacto · 90 días',
  },
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    flush: { control: 'boolean' },
    as: { control: 'inline-radio', options: ['h2', 'h3'] },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Panel {...args}>
      <StatCardGroup columns={3}>
        <StatCard variant="plain" label="Conversión a promesa" value="197/742" />
        <StatCard variant="plain" label="Borradores rechazados" value="12/540" />
        <StatCard variant="plain" label="Feedback 👍 / 👎" value="88 / 9" />
      </StatCardGroup>
    </Panel>
  ),
};

export const WithAside: Story = {
  args: {
    eyebrow: 'Dónde se atora',
    title: 'Cuellos operativos del libro actual',
    aside: (
      <Button variant="link" size="sm">
        limpiar filtro
      </Button>
    ),
  },
  render: (args) => (
    <Panel {...args}>
      <p style={{ margin: 0, color: 'var(--he-text-dim)' }}>Contenido del panel…</p>
    </Panel>
  ),
};

// ---------------------------------------------------------------- flush body

const movements: { id: string; customer: string; policy: string; when: string; kind?: ListItemStatus }[] = [
  { id: 'm1', customer: 'Modelos Economicos Aho Sapi de C.V.', policy: '687457622', when: 'hace 2 h', kind: 'error' },
  { id: 'm2', customer: 'Regio Gas S.A. de C.V.', policy: '628515652', when: 'hace 3 h', kind: 'warn' },
  { id: 'm3', customer: 'Juan Manuel Santillan Rodriguez', policy: '688165414', when: 'hace 5 h' },
  { id: 'm4', customer: 'Cesar Gabriel Guerra Ramon', policy: '628537110', when: 'ayer' },
  { id: 'm5', customer: 'Inovek Monterrey S.A. de C.V.', policy: '570346098', when: 'ayer', kind: 'ok' },
  { id: 'm6', customer: 'Cristina Peña Gonzalez', policy: '628537221', when: 'hace 2 d' },
  { id: 'm7', customer: 'Transportes del Bajío S.A.', policy: '570349911', when: 'hace 3 d' },
  { id: 'm8', customer: 'Grupo Alimenticio Norte', policy: '687451188', when: 'hace 4 d' },
];

const MovementRows = ({ n = movements.length }: { n?: number }) => (
  <List variant="divided" size="sm" gutter>
    {movements.slice(0, n).map((m) => (
      <ListItem key={m.id} href="#" status={m.kind} primary={m.customer} meta={`Póliza ${m.policy}`} value={m.when} />
    ))}
  </List>
);

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'endorsements', label: 'Endosos' },
  { value: 'receipts', label: 'Recibos' },
];

function FilterTabs() {
  const [value, setValue] = useState(FILTERS[0].value);
  return <Tabs items={FILTERS} value={value} onChange={setValue} variant="pills" size="sm" />;
}

export const Flush: Story = {
  args: { eyebrow: undefined, title: 'Movements' },
  render: (args) => (
    <Panel {...args} flush aside={<FilterTabs />}>
      <MovementRows />
    </Panel>
  ),
};

export const FlushVsInset: Story = {
  args: { eyebrow: undefined, title: 'Movements' },
  render: (args) => (
    <Grid columns={2} gap={4}>
      <Panel {...args} lede="inset — hairlines stop 24px short of the border">
        <MovementRows n={5} />
      </Panel>
      <Panel {...args} flush lede="flush — one table, hairlines edge to edge">
        <MovementRows n={5} />
      </Panel>
    </Grid>
  ),
};

export const FlushPadding: Story = {
  args: { eyebrow: undefined, title: 'Movements' },
  render: (args) => (
    <Grid columns={2} gap={4}>
      <Panel {...args} flush padding="md" lede='padding="md"'>
        <MovementRows n={5} />
      </Panel>
      <Panel {...args} flush padding="sm" lede='padding="sm"'>
        <MovementRows n={5} />
      </Panel>
    </Grid>
  ),
};
