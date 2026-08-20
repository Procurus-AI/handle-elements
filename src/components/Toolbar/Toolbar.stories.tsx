import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { Card } from '../Card/Card';
import { Select } from '../Input/Select';
import { SearchInput } from '../Input/SearchInput';
import { Tabs, type TabItem } from '../Tabs/Tabs';
import { Toolbar, ToolbarGroup, ResultCount } from './Toolbar';

const meta = {
  title: 'Elements/Toolbar',
  component: Toolbar,
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const clients = [
  'Northwind Freight',
  'Cascade Logistics',
  'Ironclad Cargo',
  'Meridian Haul',
  'Harbor P&C',
  'Sterling Re',
  'Aegis Mutual',
];

const filters: TabItem[] = [
  { value: 'all', label: 'Todos', count: 27 },
  { value: 'attention', label: 'Necesitan atención', count: 24, countTone: 'warn' },
  { value: 'active', label: 'Activos · 7d', count: 11 },
  { value: 'inactive', label: 'Inactivos', count: 4 },
  { value: 'never', label: 'Nunca corrió', count: 12 },
  { value: 'paying', label: 'De pago', count: 11 },
];

// The /cobranza control stack: filter tabs → search + selects + result count.
export const CobranzaControls: Story = {
  render: () => {
    const [tab, setTab] = useState('attention');
    const [q, setQ] = useState('');
    const shown = useMemo(
      () => clients.filter((c) => c.toLowerCase().includes(q.trim().toLowerCase())),
      [q],
    );
    return (
      <Card style={{ width: 720, display: 'grid', gap: 14 }}>
        <Tabs variant="pills" size="sm" items={filters} value={tab} onChange={setTab} />
        <Toolbar>
          <SearchInput
            value={q}
            onValueChange={setQ}
            placeholder="Buscar cliente u org…"
            style={{ maxWidth: 260 }}
          />
          <Select defaultValue="signal">
            <option value="signal">Cualquier señal</option>
            <option value="risk">En riesgo</option>
            <option value="healthy">Saludable</option>
          </Select>
          <Select defaultValue="health">
            <option value="health">Salud (peor primero)</option>
            <option value="mrr">MRR (mayor primero)</option>
          </Select>
          <ToolbarGroup align="end">
            <ResultCount>
              {shown.length} de {clients.length}
            </ResultCount>
          </ToolbarGroup>
        </Toolbar>
      </Card>
    );
  },
};
