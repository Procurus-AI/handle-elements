import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { StatCard, StatCardGroup } from '../StatCard/StatCard';
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
