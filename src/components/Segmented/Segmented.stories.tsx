import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Card } from '../Card/Card';
import { Sidebar, SidebarItem } from '../Sidebar/Sidebar';
import { Text } from '../Text/Text';
import { Segmented } from './Segmented';

const meta = {
  title: 'Elements/Segmented',
  component: Segmented,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One-of-N at row scale — the rail\'s environment switch and the theme control are the same primitive. ' +
          'It is not Tabs: `role="tablist"` promises a `tabpanel` that does not exist and announces a preference as ' +
          'navigation ("Claro, tab, selected"), and `.he-tabs--pills` has no track (measured `background: rgba(0,0,0,0)`, ' +
          '`padding: 0`, `gap: 8px`) and no roving tabindex, so there was nothing to reuse. Semantics here are ' +
          '`role="group"` + `aria-pressed`, the shipped house idiom (StatToggle). Arrows move focus only; Space/Enter commit.',
      },
    },
  },
  args: { options: [], value: '', onChange: () => {}, label: 'Group' },
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

const stroke = { stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const icons = {
  settings: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="5.6" {...stroke} />
      <circle cx="7.5" cy="7.5" r="1.6" {...stroke} />
      <path d="M7.5 1.9V4M7.5 11V13.1M1.9 7.5H4M11 7.5H13.1" {...stroke} />
    </svg>
  ),
  admin: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 1.8 12.5 3.6V7.4C12.5 10.2 10.4 12.4 7.5 13.2 4.6 12.4 2.5 10.2 2.5 7.4V3.6L7.5 1.8Z" {...stroke} />
    </svg>
  ),
};

function Rail({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: 260, display: 'flex' }}>
      <Sidebar
        width="250px"
        utility={
          <>
            <SidebarItem icon={icons.settings} label="Configuración" />
            <SidebarItem icon={icons.admin} label="Admin" />
            {children}
          </>
        }
      >
        <SidebarItem label="Cobranza" active />
        <SidebarItem label="Pólizas" />
        <SidebarItem label="Clientes" />
      </Sidebar>
    </div>
  );
}

const envOptions = [
  { value: 'live', label: 'Live' },
  { value: 'dev', label: 'Dev', tone: 'warn' as const },
];

/**
 * The rail's LIVE/DEV band, rebuilt as a control: a pill inside the same 225px
 * content column as the nav rows above it, instead of the only edge-to-edge
 * element in the sidebar. `tone: 'warn'` puts consequence on Dev at the scale of
 * a bullet. Because the switch is fully controlled, entering a non-default
 * environment routes through the host's own `ConfirmDialog intent="destructive"` —
 * the design system never owns the modal. The app should also fly a persistent
 * `StatusPill status="warn" label="DEV"` in `PageHeader`: a rail control that can
 * scroll out of view must never be the only signal of which environment you are in.
 */
export const Environment: Story = {
  render: () => {
    const [live, setLive] = useState('live');
    const [dev, setDev] = useState('dev');
    return (
      <div style={{ display: 'flex', gap: 24 }}>
        <Rail>
          <Segmented options={envOptions} value={live} onChange={setLive} label="Entorno" block />
        </Rail>
        <Rail>
          <Segmented options={envOptions} value={dev} onChange={setDev} label="Entorno" block />
        </Rail>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [a, setA] = useState('live');
    const [b, setB] = useState('live');
    const [c, setC] = useState('live');
    const [d, setD] = useState('live');
    return (
      <div style={{ display: 'grid', gap: 16, width: 226 }}>
        <Text size="caption" tone="dim">md · block</Text>
        <Segmented options={envOptions} value={a} onChange={setA} label="Entorno md block" block />
        <Text size="caption" tone="dim">sm · block</Text>
        <Segmented options={envOptions} value={b} onChange={setB} label="Entorno sm block" size="sm" block />
        <Text size="caption" tone="dim">md · inline</Text>
        {/* The track is a block-level flex box, so an inline group only shrink-wraps
         * when its parent lets it — otherwise `block` would look like a dead prop. */}
        <div style={{ display: 'flex' }}>
          <Segmented options={envOptions} value={c} onChange={setC} label="Entorno md inline" />
        </div>
        <Text size="caption" tone="dim">sm · inline</Text>
        <div style={{ display: 'flex' }}>
          <Segmented options={envOptions} value={d} onChange={setD} label="Entorno sm inline" size="sm" />
        </div>
      </div>
    );
  },
};

/** Arrow keys skip the disabled segment; Home/End land on the first/last enabled one. */
export const WithDisabled: Story = {
  render: () => {
    const [value, setValue] = useState('live');
    return (
      <div style={{ width: 300 }}>
        <Segmented
          label="Entorno"
          block
          value={value}
          onChange={setValue}
          options={[
            { value: 'live', label: 'Live' },
            { value: 'staging', label: 'Staging', disabled: true },
            { value: 'dev', label: 'Dev', tone: 'warn' },
          ]}
        />
      </div>
    );
  },
};

/** A long label ellipses inside its segment instead of overflowing the track. */
export const Truncation: Story = {
  render: () => {
    const [value, setValue] = useState('restricted');
    return (
      <div style={{ width: 226 }}>
        <Segmented
          label="Entorno"
          block
          value={value}
          onChange={setValue}
          options={[
            { value: 'restricted', label: 'Producción restringida' },
            { value: 'dev', label: 'Dev', tone: 'warn' },
          ]}
        />
      </div>
    );
  },
};

/** On a --he-surface card the transparent track needs the pill one step up. */
export const OnSurface: Story = {
  render: () => {
    const [value, setValue] = useState('month');
    return (
      <Card style={{ width: 360, display: 'grid', gap: 12 }}>
        <Text size="caption" tone="dim">Periodo</Text>
        <Segmented
          label="Periodo"
          block
          value={value}
          onChange={setValue}
          options={[
            { value: 'month', label: 'Mes' },
            { value: 'quarter', label: 'Trimestre' },
            { value: 'year', label: 'Año' },
          ]}
          style={{ '--he-segmented-selected': 'var(--he-surface-2)' } as React.CSSProperties}
        />
      </Card>
    );
  },
};
