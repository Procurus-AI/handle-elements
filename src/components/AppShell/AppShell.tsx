import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Panel } from '../Panel/Panel';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** The `Sidebar`. The shell gives it a fixed 208px column and collapses it to the Brandmark rail below 960px. */
  sidebar: ReactNode;
  /** Page content. It scrolls vertically inside the inset main panel. */
  children: ReactNode;
}

/**
 * The application frame (Figma "App shell"): a bg-app canvas with padding 8/8/8/0 and gap 8,
 * a fixed 208px sidebar flat on the canvas, and the main area as the inset Panel filling the
 * rest. Takes the height of its container (100dvh by default).
 */
export function AppShell({ sidebar, children, className, ...rest }: AppShellProps) {
  return (
    <div className={cx('he-app-shell', className)} {...rest}>
      <div className="he-app-shell__sidebar">{sidebar}</div>
      <main className="he-app-shell__main">
        <Panel variant="inset" padding="none" className="he-app-shell__panel">
          {children}
        </Panel>
      </main>
    </div>
  );
}
