import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Sidebar, SidebarFooterItem, SidebarHeader, SidebarItem, SidebarSection } from './Sidebar';

const meta = {
  title: 'Elements/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>;

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
  collapse: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.5" y="2" width="12" height="11" rx="2" {...stroke} />
      <path d="M9.5 2V13" {...stroke} />
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="6" {...stroke} />
      <path d="M7.5 4.8V10.2M4.8 7.5H10.2" {...stroke} />
    </svg>
  ),
  computer: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.5" y="2.5" width="12" height="8" rx="1.5" {...stroke} />
      <path d="M5 13H10" {...stroke} />
    </svg>
  ),
  artifacts: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="2" y="2" width="11" height="11" rx="2" {...stroke} />
      <path d="M5.5 9.5L7 6L9.5 9.5" {...stroke} />
      <circle cx="5.4" cy="5.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  customize: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="5.6" {...stroke} />
      <circle cx="7.5" cy="7.5" r="1.6" {...stroke} />
      <path d="M7.5 1.9V4M7.5 11V13.1M1.9 7.5H4M11 7.5H13.1" {...stroke} />
    </svg>
  ),
  folder: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M1.5 4.5C1.5 3.7 2.2 3 3 3H5.5L7 4.5H12C12.8 4.5 13.5 5.2 13.5 6V10.5C13.5 11.3 12.8 12 12 12H3C2.2 12 1.5 11.3 1.5 10.5V4.5Z" {...stroke} />
    </svg>
  ),
  dots: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
      <circle cx="3.5" cy="7.5" r="1" />
      <circle cx="7.5" cy="7.5" r="1" />
      <circle cx="11.5" cy="7.5" r="1" />
    </svg>
  ),
  bell: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 2C5.3 2 4 3.7 4 5.7C4 8.6 2.8 9.5 2.8 9.5H12.2C12.2 9.5 11 8.6 11 5.7C11 3.7 9.7 2 7.5 2Z" {...stroke} />
      <path d="M6.3 11.8C6.5 12.4 7 12.8 7.5 12.8C8 12.8 8.5 12.4 8.7 11.8" {...stroke} />
    </svg>
  ),
};

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 'var(--he-radius-full)',
        background: 'var(--he-action)',
        border: '1px solid var(--he-action-border)',
        color: 'var(--he-on-action)',
        fontFamily: 'var(--he-font-display)',
        fontSize: 13,
      }}
    >
      {name[0]}
    </span>
  );
}

export const AppShell: Story = {
  render: () => {
    const [active, setActive] = useState('new');
    const projects = ['AI Agent Builder Research', 'Travel Planner', 'AI Learning', 'New Space', 'Bookmarks'];
    const sessions = [
      'I remember a while back there was a carrier portal…',
      'Find some data points on Q3 loss ratios',
      'Where is the Ryan renewal call doc?',
      'Great coffees to visit in downtown Austin',
      'Ontología de datos',
      'Carrier-Exploration Backend Update',
    ];
    return (
      <div style={{ display: 'flex', height: '100vh', margin: -16 }}>
        <Sidebar
          footer={
            <SidebarFooterItem
              media={<Avatar name="Alfonso" />}
              label="Alfonso de los Ríos"
              sublabel="Pro"
              end={
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  {icons.bell}
                  <span
                    style={{
                      position: 'absolute',
                      top: -1,
                      right: -2,
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--he-ok)',
                    }}
                  />
                </span>
              }
            />
          }
        >
          <SidebarHeader>
            <span style={{ color: 'var(--he-text)', display: 'inline-flex' }}>{icons.brandmark}</span>
            <Button variant="ghost" size="icon-sm" aria-label="Collapse sidebar">
              {icons.collapse}
            </Button>
          </SidebarHeader>

          <SidebarItem icon={icons.plus} label="New" active={active === 'new'} onClick={() => setActive('new')} />
          <SidebarItem icon={icons.computer} label="Computer" active={active === 'computer'} onClick={() => setActive('computer')} />
          <SidebarItem icon={icons.artifacts} label="Artifacts" active={active === 'artifacts'} onClick={() => setActive('artifacts')} />
          <SidebarItem icon={icons.customize} label="Customize" active={active === 'customize'} onClick={() => setActive('customize')} />

          <SidebarSection label="Pinned">
            <SidebarItem label="I'm the founder of Handle. I'm thinking about…" />
          </SidebarSection>

          <SidebarSection label="Projects">
            {projects.map((p) => (
              <SidebarItem key={p} icon={icons.folder} label={p} />
            ))}
            <SidebarItem icon={icons.dots} label="Show more" />
          </SidebarSection>

          <SidebarSection label="Sessions">
            {sessions.map((s) => (
              <SidebarItem key={s} label={s} />
            ))}
          </SidebarSection>
        </Sidebar>
        <main style={{ flex: 1, background: 'var(--he-surface)', padding: 40 }}>
          <h1 style={{ fontFamily: 'var(--he-font-display)', fontWeight: 300, fontSize: 'var(--he-display-2)', margin: 0 }}>
            Content area
          </h1>
        </main>
      </div>
    );
  },
};
