import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Card } from '../Card/Card';
import { Segmented } from '../Segmented/Segmented';
import { Sidebar, SidebarFooterItem, SidebarHeader, SidebarItem } from '../Sidebar/Sidebar';
import { Text } from '../Text/Text';
import { applyTheme, systemTheme, themeBootScript, type ThemeMode } from '../../lib/theme';
import { ThemeSwitch } from './ThemeSwitch';

const meta = {
  title: 'Elements/ThemeSwitch',
  component: ThemeSwitch,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Light / Dark, two committed states. There is no System segment: a third labelled segment truncates in the ' +
          "rail's 225px content box, and a visible System option makes the control misreport itself — it shows a " +
          'monitor while the app renders dark, and it can flip under the user at sunset with no user action. System ' +
          'survives as a seeding policy in JS (`systemTheme()`), so component CSS still keys only on `html[data-theme]`. ' +
          'The component is fully controlled and never touches `document`, `matchMedia` or storage; the host owns the ' +
          '`<html>` attribute and persistence via `applyTheme` / `themeBootScript`.',
      },
    },
  },
  args: { value: 'light', onChange: () => {} },
} satisfies Meta<typeof ThemeSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

const stroke = { stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const icons = {
  brandmark: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" aria-hidden>
      <circle cx="6.5" cy="6" r="3" />
      <circle cx="15.5" cy="16" r="3" />
      <rect x="9.4" y="2.8" width="3.4" height="16.4" rx="1.7" transform="rotate(35 11 11)" />
    </svg>
  ),
  inbox: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M1.8 8.5H5l1 2h3l1-2h3.2" {...stroke} />
      <path d="M3.2 2.5h8.6l1.6 6v3a1.5 1.5 0 0 1-1.5 1.5H3.1A1.5 1.5 0 0 1 1.6 11.5v-3l1.6-6Z" {...stroke} />
    </svg>
  ),
  docs: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M3.5 1.8h5L11.5 5v8.2H3.5V1.8Z" {...stroke} />
      <path d="M8.4 1.9V5h3.05" {...stroke} />
    </svg>
  ),
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

const envOptions = [
  { value: 'live', label: 'Live' },
  { value: 'dev', label: 'Dev', tone: 'warn' as const },
];

/**
 * The bottom of the rail from the screenshot, rebuilt: nav rows, theme and
 * environment all sit in the same 225px content column, so nothing floats
 * centered with nothing to align to and nothing runs edge to edge.
 */
export const InRail: Story = {
  render: () => {
    const [mode, setMode] = useState<ThemeMode>('light');
    const [env, setEnv] = useState('live');
    return (
      <div style={{ height: 420, display: 'flex' }}>
        <Sidebar
          width="250px"
          utility={
            <>
              <SidebarItem icon={icons.settings} label="Configuración" />
              <SidebarItem icon={icons.admin} label="Admin" />
              <ThemeSwitch
                value={mode}
                onChange={(next) => {
                  setMode(next);
                  applyTheme(next);
                }}
                label="Tema"
                labels={{ light: 'Claro', dark: 'Oscuro' }}
                block
              />
              <Segmented options={envOptions} value={env} onChange={setEnv} label="Entorno" block />
            </>
          }
          footer={
            <SidebarFooterItem
              media={<Avatar name="Alfonso de los Rios" size="sm" />}
              label="Alfonso de los Rios"
              sublabel="Handle"
              chevron
            />
          }
        >
          <SidebarHeader>{icons.brandmark}</SidebarHeader>
          <SidebarItem icon={icons.inbox} label="Cobranza" active />
          <SidebarItem icon={icons.docs} label="Pólizas" />
        </Sidebar>
      </div>
    );
  },
};

/** 56px rail: the two-up group becomes one ghost button whose name carries the action. */
export const Collapsed: Story = {
  render: () => {
    const [mode, setMode] = useState<ThemeMode>('light');
    return (
      <div style={{ height: 420, display: 'flex' }}>
        <Sidebar
          collapsed
          utility={
            <>
              <SidebarItem icon={icons.settings} label="Configuración" />
              <ThemeSwitch
                iconOnly
                value={mode}
                onChange={(next) => {
                  setMode(next);
                  applyTheme(next);
                }}
                label="Tema"
                labels={{ light: 'Claro', dark: 'Oscuro' }}
              />
            </>
          }
          footer={<SidebarFooterItem media={<Avatar name="Alfonso de los Rios" size="sm" />} label="Alfonso de los Rios" />}
        >
          <SidebarHeader>{icons.brandmark}</SidebarHeader>
          <SidebarItem icon={icons.inbox} label="Cobranza" active />
          <SidebarItem icon={icons.docs} label="Pólizas" />
        </Sidebar>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [a, setA] = useState<ThemeMode>('light');
    const [b, setB] = useState<ThemeMode>('dark');
    return (
      <div style={{ display: 'grid', gap: 16, width: 226 }}>
        <Text size="caption" tone="dim">
          md
        </Text>
        <ThemeSwitch value={a} onChange={setA} label="Tema" labels={{ light: 'Claro', dark: 'Oscuro' }} />
        <Text size="caption" tone="dim">
          sm
        </Text>
        <ThemeSwitch size="sm" value={b} onChange={setB} label="Tema" labels={{ light: 'Claro', dark: 'Oscuro' }} />
      </div>
    );
  },
};

/**
 * The host recipe, verbatim. The library will not write `<html>` for you, will not
 * persist, and will not read the OS on its own: a flash of the wrong theme can only
 * be prevented by a blocking pre-paint script, which a React component cannot be;
 * theme may be a server-side user preference across several accounts, so the storage
 * key belongs to the app; and `localStorage` throws in Safari private mode and in
 * sandboxed iframes, which is an unacceptable side effect for a zero-dependency
 * design system.
 */
export const Boot: Story = {
  render: () => (
    <Card style={{ maxWidth: 720, display: 'grid', gap: 12 }}>
      <Text size="caption" tone="dim" mono>
        1 · BLOCKING SCRIPT IN &lt;head&gt;
      </Text>
      <pre style={{ margin: 0, fontFamily: 'var(--he-font-mono)', fontSize: 11.5, whiteSpace: 'pre-wrap' }}>
        {`<script dangerouslySetInnerHTML={{ __html: themeBootScript('app.theme') }} />\n\n// emits:\n${themeBootScript('app.theme')}`}
      </pre>
      <Text size="caption" tone="dim" mono>
        2 · FIRST-RUN SEED AND EVERY CHANGE
      </Text>
      <pre style={{ margin: 0, fontFamily: 'var(--he-font-mono)', fontSize: 11.5, whiteSpace: 'pre-wrap' }}>
        {`const [mode, setMode] = useState<ThemeMode>(
  () => (localStorage.getItem('app.theme') as ThemeMode) ?? systemTheme(),
);

<ThemeSwitch
  value={mode}
  onChange={(next) => {
    setMode(next);
    applyTheme(next);                          // data-theme + color-scheme
    localStorage.setItem('app.theme', next);   // the host's own store
  }}
/>`}
      </pre>
      <Text size="caption" tone="dim">
        This session&apos;s OS preference reads as: {systemTheme()}.
      </Text>
    </Card>
  ),
};
