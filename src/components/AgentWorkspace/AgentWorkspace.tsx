import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';

export interface AgentWorkspaceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Persistent product navigation. Usually a `Sidebar`. */
  navigation: ReactNode;
  /** Optional record/page chrome above the scrollable work area. */
  header?: ReactNode;
  /** The primary work surface. */
  children: ReactNode;
  /** Quiet secondary context shown beside the primary content when space allows. */
  context?: ReactNode;
  /** Accessible name for the secondary context landmark. */
  contextLabel?: string;
  /** Universal agent composer, pinned below the scrollable work area. */
  composer?: ReactNode;
  /** Expanded rail width. Defaults to `224px`. */
  navigationWidth?: number | string;
  /** Accessible name for the primary work surface. */
  mainLabel?: string;
  /** Localized label for the compact navigation trigger. */
  mobileNavigationLabel?: string;
  /** Localized label for both compact-navigation close controls. */
  mobileNavigationCloseLabel?: string;
}

/**
 * Full-height shell for agent-led products. It owns the viewport, navigation
 * track, scroll boundary and composer dock so every agent view shares the same
 * calm geometry instead of rebuilding application chrome per page.
 */
export function AgentWorkspace({
  navigation,
  header,
  children,
  context,
  contextLabel = 'Context',
  composer,
  navigationWidth = 224,
  mainLabel = 'Workspace',
  mobileNavigationLabel = 'Open navigation',
  mobileNavigationCloseLabel = 'Close navigation',
  className,
  style,
  ...rest
}: AgentWorkspaceProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const mobileNavigationId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationWasOpen = useRef(false);
  const width = typeof navigationWidth === 'number' ? `${navigationWidth}px` : navigationWidth;

  useEffect(() => {
    const stage = stageRef.current;

    if (mobileNavigationOpen) {
      stage?.setAttribute('inert', '');
      mobileNavigationWasOpen.current = true;
      mobileCloseRef.current?.focus();
    } else {
      stage?.removeAttribute('inert');
      if (mobileNavigationWasOpen.current) {
        mobileNavigationWasOpen.current = false;
        mobileTriggerRef.current?.focus();
      }
    }

    return () => stage?.removeAttribute('inert');
  }, [mobileNavigationOpen]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const compactNavigation = window.matchMedia('(max-width: 860px)');
    const closeIfExpanded = (event: MediaQueryListEvent) => {
      if (!event.matches) setMobileNavigationOpen(false);
    };

    compactNavigation.addEventListener('change', closeIfExpanded);
    return () => compactNavigation.removeEventListener('change', closeIfExpanded);
  }, []);

  return (
    <div
      className={cx('he-agent-workspace', className)}
      style={{ '--he-agent-workspace-nav': width, ...style } as CSSProperties}
      {...rest}
    >
      <div
        ref={mobileNavigationRef}
        id={mobileNavigationId}
        className={cx(
          'he-agent-workspace__navigation',
          mobileNavigationOpen && 'he-agent-workspace__navigation--mobile-open',
        )}
        role={mobileNavigationOpen ? 'dialog' : undefined}
        aria-modal={mobileNavigationOpen ? true : undefined}
        aria-label={mobileNavigationOpen ? mobileNavigationLabel : undefined}
        onKeyDown={(event) => {
          if (!mobileNavigationOpen) return;
          if (event.key === 'Escape') {
            event.preventDefault();
            setMobileNavigationOpen(false);
            return;
          }

          if (event.key !== 'Tab') return;
          const focusable = Array.from(
            mobileNavigationRef.current?.querySelectorAll<HTMLElement>(
              'a[href], button:not(:disabled):not([tabindex="-1"]), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
            ) ?? [],
          ).filter((element) => element.getClientRects().length > 0);
          const first = focusable[0];
          const last = focusable.at(-1);

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (
            mobileNavigationOpen &&
            (event.target as HTMLElement).closest(
              '.he-sidebar-item, .he-sidebar-section__action button, .he-sidebar-section__action a',
            )
          ) {
            setMobileNavigationOpen(false);
          }
        }}
      >
        <button
          ref={mobileCloseRef}
          type="button"
          className="he-agent-workspace__mobile-close"
          aria-label={mobileNavigationCloseLabel}
          onClick={() => setMobileNavigationOpen(false)}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
            <path
              d="m3.5 3.5 8 8m0-8-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {navigation}
      </div>
      <div ref={stageRef} className="he-agent-workspace__stage">
        <button
          ref={mobileTriggerRef}
          type="button"
          className="he-agent-workspace__mobile-trigger"
          aria-label={mobileNavigationLabel}
          aria-expanded={mobileNavigationOpen}
          aria-controls={mobileNavigationId}
          onClick={() => setMobileNavigationOpen(true)}
        >
          <span aria-hidden />
          <span aria-hidden />
          <span aria-hidden />
        </button>
        {header != null && <div className="he-agent-workspace__header">{header}</div>}
        <main className="he-agent-workspace__main" aria-label={mainLabel}>
          {context != null ? (
            <div className="he-agent-workspace__split">
              <div className="he-agent-workspace__primary">{children}</div>
              <aside className="he-agent-workspace__context" aria-label={contextLabel}>
                {context}
              </aside>
            </div>
          ) : (
            children
          )}
        </main>
        {composer != null && <div className="he-agent-workspace__composer">{composer}</div>}
      </div>
      {mobileNavigationOpen && (
        <button
          type="button"
          className="he-agent-workspace__mobile-backdrop"
          aria-label={mobileNavigationCloseLabel}
          tabIndex={-1}
          onClick={() => setMobileNavigationOpen(false)}
        />
      )}
    </div>
  );
}
