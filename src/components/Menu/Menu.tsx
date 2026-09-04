import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';
import { useHoverIntent } from '../../lib/hoverIntent';
import { computePosition, type PopoverAlign, type PopoverSide, type PositionResult } from '../../lib/position';

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'right-start'
  | 'right'
  | 'right-end'
  | 'left-start'
  | 'left'
  | 'left-end';

export interface PopoverActions {
  /** `by` decides whether the highlight paints its keyboard ring; `seed` overrides the implicit checked-then-first landing. */
  open: (by?: 'pointer' | 'keyboard', seed?: 'first' | 'last') => void;
  close: (restore?: boolean) => void;
}

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  offset?: number;
  /** Shift along the ALIGN axis. A submenu passes -4 so its first ROW lines up with the parent ROW, not with the panel edge. */
  crossOffset?: number;
  /** Imperative handle, for hosts that must open the surface from somewhere other than the trigger — a parent menu's ArrowRight. */
  actionsRef?: RefObject<PopoverActions | null>;
  matchTriggerWidth?: boolean;
  closeOnOutside?: boolean;
  closeOnEsc?: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  /** ARIA popup type announced on the trigger. */
  triggerHasPopup?: 'menu' | 'listbox' | 'dialog' | 'true';
}

export interface MenuProps extends Omit<PopoverProps, 'children'> {
  children: ReactNode;
  label?: string;
  /** Rendered above `role="menu"` — a textbox is not a valid menu child, so `MenuFilter` goes here. */
  header?: ReactNode;
  /** Rendered as the last row INSIDE `role="menu"`, pinned by the grid. */
  footer?: ReactNode;
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
  shortcut?: ReactNode;
  destructive?: boolean;
  onSelect?: () => void;
  /** Leading fixed column — an `<Avatar size="sm" />` in the switcher recipe. */
  media?: ReactNode;
  sublabel?: ReactNode;
  /** Boolean turns the row into a `menuitemradio` and reserves the check column. */
  checked?: boolean;
  /** Trailing slot: a chevron, a count. Mutually exclusive with `checked`, which owns the same 16px track. */
  trailing?: ReactNode;
}

export interface MenuStaticProps extends HTMLAttributes<HTMLDivElement> {
  media?: ReactNode;
  sublabel?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}

/* `onSelect` is omitted, not forwarded: a sub-trigger OPENS, it is never selected. */
export interface MenuSubProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onSelect'> {
  /** Trigger row label, and the submenu's accessible name when it is a string. */
  label: ReactNode;
  /** The submenu's rows. */
  children: ReactNode;
  media?: ReactNode;
  /** Second line on the TRIGGER row — by convention the current value of whatever the submenu sets. */
  sublabel?: ReactNode;
  /** Accessible name of the submenu surface when `label` is not a string. */
  menuLabel?: string;
  header?: ReactNode;
  footer?: ReactNode;
  placement?: 'right-start' | 'left-start';
  /** The panels ABUT; measured ~0.5px on the reference. A gap is dead space the pointer must cross. */
  offset?: number;
  /** `-4` = `--he-space-1`, the submenu surface's own block padding. */
  crossOffset?: number;
  openDelay?: number;
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
}

export interface MenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export interface MenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
}

export interface MenuLabelProps extends HTMLAttributes<HTMLDivElement> {}

export interface MenuFilterProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  /** The filter takes DOM focus when the menu opens. */
  autoFocus?: boolean;
  /**
   * Accessible name. Defaults to `placeholder` so the box is never unnamed, but a
   * placeholder disappears the moment the user types — pass this explicitly.
   */
  label?: string;
}

type MoveTarget = 'first' | 'last' | 'next' | 'prev' | (string & {});

interface SubApi {
  open: (by: 'pointer' | 'keyboard') => void;
  close: (restore?: boolean) => void;
}

interface MenuCtx {
  close: (restore?: boolean) => void;
  menuId: string;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  move: (to: MoveTarget) => void;
  activate: () => void;
  hasFilter: boolean;
  setHasFilter: (has: boolean) => void;
  parent: MenuCtx | null;
  /** Close the whole tree from any depth. Selecting a leaf must not leave the account menu standing. */
  closeAll: (restore?: boolean) => void;
  /** Row id of the sub-trigger whose submenu is open, or null. */
  openSubId: string | null;
  setOpenSubId: (id: string | null) => void;
  registerSub: (id: string, api: SubApi) => () => void;
}

const MenuContext = createContext<MenuCtx | null>(null);

interface SurfaceCtx {
  id: string;
  parentId: string | null;
  level: number;
}

const SurfaceContext = createContext<SurfaceCtx | null>(null);

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function isBrowser(): boolean {
  return typeof document !== 'undefined';
}

/* A submenu MUST portal (.he-popover is overflow:hidden, so a DOM-descendant
 * surface is clipped) — but portalling is exactly what defeats a contains()
 * test. The owner chain is the DOM answer: every surface names its parent, so
 * "is this node mine?" walks ids instead of nodes, at arbitrary depth, with no
 * registry. */
function ownsNode(rootId: string, target: Node | null): boolean {
  const start = target instanceof Element ? target : ((target as ChildNode | null)?.parentElement ?? null);
  let surface: HTMLElement | null = start?.closest<HTMLElement>('[data-he-surface]') ?? null;
  if (!surface) return false;
  // Build the map rather than querySelector('[data-he-surface="…"]'): React 19
  // useId ids contain « », which would need CSS.escape.
  const byId = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>('[data-he-surface]').forEach((el) => byId.set(el.dataset.heSurface!, el));
  const seen = new Set<string>();
  while (surface) {
    const id = surface.dataset.heSurface!;
    if (id === rootId) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    const owner: string | undefined = surface.dataset.heOwner;
    surface = owner ? (byId.get(owner) ?? null) : null;
  }
  return false;
}

function samePosition(a: PositionResult | null, b: PositionResult): boolean {
  return (
    a != null &&
    a.top === b.top &&
    a.left === b.left &&
    a.side === b.side &&
    a.maxHeight === b.maxHeight &&
    a.maxWidth === b.maxWidth &&
    a.minWidth === b.minWidth
  );
}

export function Popover({
  trigger,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  offset = 8,
  crossOffset = 0,
  actionsRef,
  matchTriggerWidth = false,
  closeOnOutside = true,
  closeOnEsc = true,
  disabled = false,
  triggerHasPopup = 'menu',
  triggerClassName,
  contentClassName,
  className,
  id: idProp,
  onKeyDown: onContentKeyDownProp,
  ...rest
}: PopoverProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<PositionResult | null>(null);
  const [delegate, setDelegate] = useState<HTMLElement | null>(null);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [hasFilter, setHasFilter] = useState(false);
  const [nav, setNav] = useState<'pointer' | 'keyboard'>('pointer');

  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const autoId = useId();
  const contentId = idProp ?? `he-popover-${autoId}`;
  const menuId = `he-menu-${autoId}`;

  // `-start`/`-end`, not the bare word, so a future 'inline-start' cannot alias.
  const side: PopoverSide = placement.startsWith('top')
    ? 'top'
    : placement.startsWith('left')
      ? 'left'
      : placement.startsWith('right')
        ? 'right'
        : 'bottom';
  const align: PopoverAlign = placement.endsWith('-start')
    ? 'start'
    : placement.endsWith('-end')
      ? 'end'
      : 'center';

  // Read OUTSIDE this Popover's own portal, so both resolve to the surface/menu
  // one level up — the level that owns the row this popover hangs off.
  const parentSurface = useContext(SurfaceContext);
  const parentMenu = useContext(MenuContext);
  const surface = useMemo<SurfaceCtx>(
    () => ({ id: contentId, parentId: parentSurface?.id ?? null, level: (parentSurface?.level ?? -1) + 1 }),
    [contentId, parentSurface],
  );

  // Latest-value refs so the dismiss/focus effects never call a stale
  // `onOpenChange` identity.
  const latest = useRef({ disabled, isControlled, onOpenChange, closeOnOutside, closeOnEsc, hasFilter });
  latest.current = { disabled, isControlled, onOpenChange, closeOnOutside, closeOnEsc, hasFilter };

  const activeIdRef = useRef<string | null>(null);
  const pendingFocus = useRef<'first' | 'last' | null>(null);
  const pendingSeed = useRef(false);
  const openedByKey = useRef(false);
  const restoreFocus = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  const typeahead = useRef({ text: '', at: 0 });

  const setOpen = useCallback((next: boolean) => {
    if (latest.current.disabled) return;
    if (!latest.current.isControlled) setInternalOpen(next);
    latest.current.onOpenChange?.(next);
  }, []);

  const close = useCallback(
    (restore = true) => {
      restoreFocus.current = restore;
      setOpen(false);
    },
    [setOpen],
  );

  // Only the ROOT actually closes; children unmount with the parent's portal, so
  // no two levels fight over the focus restore and focus lands on the ROOT trigger.
  const closeAll = useCallback(
    (restore = true) => {
      if (parentMenu) parentMenu.closeAll(restore);
      else close(restore);
    },
    [parentMenu, close],
  );

  const applyActiveId = useCallback((next: string | null) => {
    activeIdRef.current = next;
    setActiveIdState(next);
  }, []);

  // Submenu bookkeeping. `openSubId` is state PLUS a synchronous ref, written
  // together — the same two-track pattern as `activeIdRef`.
  const subs = useRef(new Map<string, SubApi>());
  const [openSubId, setOpenSubIdState] = useState<string | null>(null);
  const openSubIdRef = useRef<string | null>(null);
  /* The row the pointer moved onto while a submenu was still open. Its
   * mouseenter is swallowed by the guard in `setActiveId`, and a mouseenter
   * never fires twice — so without replaying it here the highlight is stranded
   * on the sub-trigger for as long as the pointer stays inside the sibling row,
   * and the next ArrowDown steps from the WRONG place. */
  const deferredActiveId = useRef<string | null>(null);
  const setOpenSubId = useCallback((next: string | null) => {
    openSubIdRef.current = next;
    setOpenSubIdState(next);
    if (next != null) return;
    const pending = deferredActiveId.current;
    deferredActiveId.current = null;
    // Only if the row is still mounted: a close that also tore the list down
    // must not resurrect a dangling IDREF into aria-activedescendant.
    if (pending != null && isBrowser() && document.getElementById(pending)) {
      setNav('pointer');
      applyActiveId(pending);
    }
  }, [applyActiveId]);
  const registerSub = useCallback((subId: string, api: SubApi) => {
    subs.current.set(subId, api);
    return () => {
      subs.current.delete(subId);
    };
  }, []);

  useImperativeHandle(
    actionsRef,
    () => ({
      open(by = 'pointer', seed) {
        openedByKey.current = by === 'keyboard';
        pendingFocus.current = seed ?? null;
        setOpen(true);
      },
      close(restore = true) {
        close(restore);
      },
    }),
    [setOpen, close],
  );

  // The public setter is the mouse path (MenuItem's onMouseEnter): pointing at a
  // row hands the highlight back to the cursor, so the ring stops painting.
  const setActiveId = useCallback(
    (next: string | null) => {
      // APG: the sub-trigger row stays aria-activedescendant for as long as its
      // submenu is open. Without this guard, sliding the pointer down a sibling
      // row on the way to the child would move the parent's highlight off it.
      // (MenuSub re-asserts setOpenSubId BEFORE setActiveId when a DIFFERENT
      // submenu opens, so the guard never blocks the swap.)
      if (openSubIdRef.current != null && next !== openSubIdRef.current) {
        // Remember it: the close runs on a delay, so this rejection is usually
        // the pointer having ALREADY landed on the sibling row it will sit on
        // once the child is gone. `setOpenSubId(null)` replays it.
        deferredActiveId.current = next;
        return;
      }
      deferredActiveId.current = null;
      setNav('pointer');
      applyActiveId(next);
    },
    [applyActiveId],
  );

  const items = useCallback(
    () =>
      Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>('[data-he-menu-item]:not([data-disabled])') ?? [],
      ),
    [],
  );

  const highlight = useCallback(
    (el: HTMLElement | undefined) => {
      if (!el) return;
      applyActiveId(el.id);
      el.scrollIntoView({ block: 'nearest' });
    },
    [applyActiveId],
  );

  const move = useCallback(
    (to: MoveTarget) => {
      setNav('keyboard');
      const els = items();
      if (els.length === 0) return;
      const at = els.findIndex((el) => el.id === activeIdRef.current);

      if (to === 'first') return highlight(els[0]);
      if (to === 'last') return highlight(els[els.length - 1]);
      if (to === 'next' || to === 'prev') {
        if (at === -1) return highlight(to === 'next' ? els[0] : els[els.length - 1]);
        const step = to === 'next' ? 1 : -1;
        return highlight(els[(at + step + els.length) % els.length]);
      }

      // Typeahead prefix. A multi-character buffer may resolve to the row that
      // is already highlighted; a repeated single character must advance.
      const prefix = to.toLowerCase();
      const from = prefix.length > 1 ? 0 : 1;
      for (let n = from; n < els.length + from; n += 1) {
        const el = els[(at + n + els.length) % els.length];
        if ((el.dataset.heLabel ?? '').toLowerCase().startsWith(prefix)) return highlight(el);
      }
    },
    [items, highlight],
  );

  const activate = useCallback(() => {
    const id = activeIdRef.current;
    if (!id) return;
    // A sub-trigger is never "selected": Enter and Space OPEN it, seeded and
    // ringed, instead of synthesising a click that would toggle the trigger span.
    const sub = subs.current.get(id);
    if (sub) return sub.open('keyboard');
    items()
      .find((el) => el.id === id)
      ?.click();
  }, [items]);

  const updatePosition = useCallback(() => {
    const node = triggerRef.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    const content = contentRef.current;
    const next = computePosition({
      trigger: { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
      content: { width: content?.offsetWidth ?? r.width, height: content?.offsetHeight ?? 0 },
      viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
      side,
      align,
      offset,
      crossOffset,
      matchTriggerWidth,
    });
    setPosition((prev) => (samePosition(prev, next) ? prev : next));
  }, [side, align, offset, crossOffset, matchTriggerWidth]);

  // The trigger delegates ARIA to the real control inside it; only when there is
  // none does the wrapper promote itself. The probe DESCENDS: a collapsed
  // SidebarFooterItem wraps its button in a Tooltip anchor, and a depth-1 check
  // would miss it, leaving a focusable button nested inside a role="button"
  // wrapper — two tab stops and two aria-expanded claims for one control.
  useLayoutEffect(() => {
    const root = triggerRef.current;
    setDelegate(root?.querySelector<HTMLElement>(FOCUSABLE) ?? null);
  }, [trigger]);

  useEffect(() => {
    if (!delegate) return;
    delegate.setAttribute('aria-haspopup', triggerHasPopup);
    delegate.setAttribute('aria-expanded', String(currentOpen));
    if (currentOpen) delegate.setAttribute('aria-controls', contentId);
    else delegate.removeAttribute('aria-controls');
  }, [delegate, currentOpen, triggerHasPopup, contentId]);

  useLayoutEffect(() => {
    if (!currentOpen || !isBrowser()) return;
    updatePosition();
  }, [currentOpen, updatePosition]);

  // Open transition: remember where focus came from before anything moves it.
  useLayoutEffect(() => {
    if (!currentOpen || !isBrowser() || wasOpen.current) return;
    wasOpen.current = true;
    pendingSeed.current = true;

    const previous = document.activeElement as HTMLElement | null;
    returnFocusRef.current =
      previous && previous !== document.body ? previous : (delegate ?? triggerRef.current);
  }, [currentOpen, delegate]);

  // Seed the highlight and move DOM focus into the surface — only once the
  // first measurement has landed, because the unpositioned content is
  // `visibility: hidden` and a hidden element silently refuses focus().
  useLayoutEffect(() => {
    if (!currentOpen || !isBrowser() || position == null || !pendingSeed.current) return;
    pendingSeed.current = false;

    const content = contentRef.current;
    if (!content) return;
    const all = items();
    const want = pendingFocus.current;
    pendingFocus.current = null;
    const checked = content.querySelector<HTMLElement>('[data-he-menu-item][aria-checked="true"]');
    // ArrowUp/ArrowDown on the trigger is an explicit "take me to the first/last
    // row" and is honoured literally. The IMPLICIT seed is not: it never lands on
    // a destructive row (a pinned "Log out") — that has to be aimed at.
    const seed =
      want === 'last'
        ? all[all.length - 1]
        : want === 'first'
          ? all[0]
          : (checked ?? all.find((el) => el.dataset.heMenuDestructive == null));
    setNav(want || openedByKey.current ? 'keyboard' : 'pointer');
    openedByKey.current = false;
    if (seed) highlight(seed);

    const holder =
      content.querySelector<HTMLElement>('[data-he-autofocus]') ??
      content.querySelector<HTMLElement>('[data-he-menu-root]') ??
      content;
    holder.focus({ preventScroll: true });
  }, [currentOpen, position, items, highlight]);

  /* MenuFilter re-renders the item set UNDER the highlight. Without this pass the
   * seeded id survives its own row's unmount: `activate()` finds nothing (Enter
   * silently does nothing) and aria-activedescendant hands the screen reader a
   * dangling IDREF. Re-clamping to the first surviving row also makes Enter pick
   * the top match, which is what a filter box implies. No dependency array —
   * every render of the surface is a chance for the list to have changed. */
  useLayoutEffect(() => {
    if (!currentOpen || !isBrowser() || pendingSeed.current) return;
    const els = items();
    const id = activeIdRef.current;
    if (id != null && els.some((el) => el.id === id)) return;
    // Never auto-land on a destructive row (a pinned "Log out" footer is the last
    // item, so an empty filter result would otherwise arm it): arrows still reach
    // it, but the highlight has to be moved there deliberately.
    const safe = els.filter((el) => el.dataset.heMenuDestructive == null);
    if (safe.length === 0) {
      if (id != null) applyActiveId(null);
      return;
    }
    if (latest.current.hasFilter) setNav('keyboard');
    highlight(safe[0]);
  });

  useEffect(() => {
    if (currentOpen || !wasOpen.current) return;
    wasOpen.current = false;
    openedByKey.current = false;
    pendingSeed.current = false;
    setNav('pointer');
    applyActiveId(null);
    setOpenSubId(null);
    setPosition(null);
    if (restoreFocus.current) returnFocusRef.current?.focus?.();
    restoreFocus.current = false;
  }, [currentOpen, applyActiveId, setOpenSubId]);

  useEffect(() => {
    if (!currentOpen || !isBrowser()) return;
    const onUpdate = () => updatePosition();
    window.addEventListener('resize', onUpdate);
    window.addEventListener('scroll', onUpdate, true);
    return () => {
      window.removeEventListener('resize', onUpdate);
      window.removeEventListener('scroll', onUpdate, true);
    };
  }, [currentOpen, updatePosition]);

  useEffect(() => {
    if (!currentOpen || !isBrowser() || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => updatePosition());
    if (contentRef.current) observer.observe(contentRef.current);
    if (triggerRef.current) observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [currentOpen, updatePosition]);

  useEffect(() => {
    if (!currentOpen || !isBrowser()) return;

    // A portalled CHILD surface fails `contentRef.contains()` by construction,
    // so "mine" is the owner chain, not the node tree. Without this, a pointerdown
    // on a submenu row would unmount that row before its click ever landed — a
    // control that appears to do nothing.
    const inside = (target: Node | null) =>
      !!(triggerRef.current?.contains(target) || contentRef.current?.contains(target) || ownsNode(contentId, target));

    const onPointerDown = (event: PointerEvent) => {
      if (!latest.current.closeOnOutside) return;
      if (inside(event.target as Node)) return;
      // No focus restore: clicking away must never yank focus back.
      setOpen(false);
    };

    // Fallback only — the primary Escape handler lives on the content div so a
    // menu inside a Modal closes itself and nothing else.
    const onKeyDown = (event: KeyboardEvent) => {
      if (!latest.current.closeOnEsc || event.key !== 'Escape') return;
      if (inside(document.activeElement)) return;
      setOpen(false);
    };

    const onFocusIn = (event: FocusEvent) => {
      if (inside(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [currentOpen, setOpen, contentId]);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    if (event.key === 'Escape') {
      if (!currentOpen || !closeOnEsc) return;
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (currentOpen) return;
      event.preventDefault();
      pendingFocus.current = event.key === 'ArrowDown' ? 'first' : 'last';
      openedByKey.current = true;
      setOpen(true);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      // A delegate child fires its own native click — never double-toggle, but
      // still record that this open came from the keyboard so the seeded
      // highlight paints its ring instead of sitting there invisibly.
      openedByKey.current = !currentOpen;
      if (event.target !== triggerRef.current) return;
      event.preventDefault();
      setOpen(!currentOpen);
    }
  };

  const onContentKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onContentKeyDownProp?.(event);
    if (event.defaultPrevented) return;

    switch (event.key) {
      case 'Escape':
        if (!closeOnEsc) return;
        event.preventDefault();
        // Load-bearing for nesting — React 19 attaches at the portal container,
        // so stopping here kills the native event before ANY instance's
        // document-level keydown, which is what makes Escape close only the
        // innermost level. Note the inversion one line above: `if (!closeOnEsc)
        // return` skips the stop, so a child with closeOnEsc=false lets Escape
        // close the PARENT.
        event.stopPropagation();
        close(true);
        return;
      case 'Tab':
        // Close the whole tree and hand focus back to the root trigger (APG);
        // the next Tab then moves on naturally.
        event.preventDefault();
        event.stopPropagation();
        closeAll(true);
        return;
      case 'ArrowDown':
        event.preventDefault();
        return move('next');
      case 'ArrowUp':
        event.preventDefault();
        return move('prev');
      case 'Home':
        event.preventDefault();
        return move('first');
      case 'End':
        event.preventDefault();
        return move('last');
      case 'Enter':
        event.preventDefault();
        return activate();
      case ' ':
        // APG: Enter and Space both activate. Not when a filter owns the keys —
        // there a space is a space.
        if (hasFilter) break;
        event.preventDefault();
        return activate();
      case 'ArrowRight': {
        // ALWAYS stop: these are the only nav keys that leak up through React
        // portal bubbling past the `defaultPrevented` bail above, so stopping
        // unconditionally is what keeps the parent inert.
        event.stopPropagation();
        if (hasFilter) return; // a textbox owns the caret
        event.preventDefault();
        subs.current.get(activeIdRef.current ?? '')?.open('keyboard');
        return;
      }
      case 'ArrowLeft': {
        event.stopPropagation();
        if (hasFilter) return;
        event.preventDefault();
        // Close ONLY this level; returnFocusRef already holds the parent's
        // `.he-menu` root, captured when this surface opened.
        if (parentMenu) close(true);
        return;
      }
      default:
        break;
    }

    if (hasFilter) return; // typing filters instead
    if (event.key.length !== 1 || event.key === ' ' || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    const now = Date.now();
    typeahead.current.text = now - typeahead.current.at > 500 ? event.key : typeahead.current.text + event.key;
    typeahead.current.at = now;
    move(typeahead.current.text);
  };

  const ctx = useMemo<MenuCtx>(
    () => ({
      close,
      menuId,
      activeId,
      setActiveId,
      move,
      activate,
      hasFilter,
      setHasFilter,
      parent: parentMenu,
      closeAll,
      openSubId,
      setOpenSubId,
      registerSub,
    }),
    [
      close,
      menuId,
      activeId,
      setActiveId,
      move,
      activate,
      hasFilter,
      parentMenu,
      closeAll,
      openSubId,
      setOpenSubId,
      registerSub,
    ],
  );

  return (
    <>
      <span
        ref={triggerRef}
        className={cx('he-popover__trigger', disabled && 'he-popover__trigger--disabled', triggerClassName)}
        onClick={() => setOpen(!currentOpen)}
        onKeyDown={onTriggerKeyDown}
        {...(delegate
          ? // The layout span carries no semantics of its own once a delegate owns
            // them — say so, or it sits between a `role="menu"` and its
            // `role="menuitem"` as a generic element and breaks the
            // required-owned-elements relationship for a submenu row.
            { role: 'none' as const }
          : {
              role: 'button',
              tabIndex: disabled ? -1 : 0,
              'aria-haspopup': triggerHasPopup,
              'aria-expanded': currentOpen,
              'aria-controls': currentOpen ? contentId : undefined,
            })}
      >
        {trigger}
      </span>
      {currentOpen &&
        isBrowser() &&
        createPortal(
          <SurfaceContext.Provider value={surface}>
            <MenuContext.Provider value={ctx}>
              <div
                ref={contentRef}
                id={contentId}
                tabIndex={-1}
                data-placement={`${position?.side ?? side}-${align}`}
                data-he-nav={nav}
                data-he-surface={contentId}
                data-he-owner={surface.parentId ?? undefined}
                className={cx('he-popover', contentClassName, className)}
                style={
                  {
                    top: position?.top ?? 0,
                    left: position?.left ?? 0,
                    // Explicit per-level stacking: document order is not a policy.
                    zIndex: 1100 + surface.level,
                    minWidth: position?.minWidth,
                    '--he-popover-max-height': position ? `${position.maxHeight}px` : undefined,
                    '--he-popover-max-width': position ? `${position.maxWidth}px` : undefined,
                    visibility: position == null ? 'hidden' : undefined,
                  } as CSSProperties
                }
                onKeyDown={onContentKeyDown}
                {...rest}
              >
                {children}
              </div>
            </MenuContext.Provider>
          </SurfaceContext.Provider>,
          document.body,
        )}
    </>
  );
}

function MenuSurface({
  label,
  header,
  footer,
  children,
}: Pick<MenuProps, 'label' | 'header' | 'footer'> & { children: ReactNode }) {
  const ctx = useContext(MenuContext);

  return (
    <>
      {header != null && <div className="he-menu__header">{header}</div>}
      <div
        className="he-menu"
        role="menu"
        id={ctx?.menuId}
        aria-label={label}
        tabIndex={-1}
        data-he-menu-root
        aria-activedescendant={ctx && !ctx.hasFilter ? (ctx.activeId ?? undefined) : undefined}
      >
        {/* `role="none"` on both wrappers: a `role="menu"` may only own menuitem /
            menuitemradio / menuitemcheckbox / group / separator, and an un-roled
            generic in between breaks that relationship — an AT walking the tree
            strictly can report a menu with zero items. Focus still rides
            aria-activedescendant, which is exactly why this stays invisible in
            manual testing. */}
        <div role="none" className="he-menu__scroll">
          {children}
        </div>
        {footer != null && (
          <div role="none" className="he-menu__footer">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

export function Menu({ children, label, header, footer, contentClassName, ...rest }: MenuProps) {
  return (
    <Popover contentClassName={cx('he-menu-popover', contentClassName)} {...rest}>
      <MenuSurface label={label} header={header} footer={footer}>
        {children}
      </MenuSurface>
    </Popover>
  );
}

const CHECK = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M3.4 7.8 6.2 10.6 11.6 4.8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function MenuItem({
  inset = false,
  shortcut,
  destructive = false,
  media,
  sublabel,
  checked,
  trailing,
  className,
  children,
  onClick,
  onSelect,
  onMouseEnter,
  id: idProp,
  ...rest
}: MenuItemProps) {
  const menu = useContext(MenuContext);
  const autoId = useId();
  const id = idProp ?? `he-menu-item-${autoId}`;
  // `inset` reserves the media column with an empty span, so it needs the same
  // three-column grid the media rows use — otherwise the label falls into the
  // trailing `auto` track and right-aligns.
  const rich = media != null || sublabel != null || inset;

  return (
    <button
      type="button"
      role={checked === undefined ? 'menuitem' : 'menuitemradio'}
      aria-checked={checked === undefined ? undefined : checked}
      id={id}
      tabIndex={-1}
      data-he-menu-item=""
      data-he-menu-destructive={destructive ? '' : undefined}
      data-disabled={rest.disabled ? '' : undefined}
      data-he-label={typeof children === 'string' ? children : undefined}
      className={cx(
        'he-menu__item',
        rich && 'he-menu__item--rich',
        inset && 'he-menu__item--inset',
        destructive && 'he-menu__item--destructive',
        checked && 'he-menu__item--checked',
        menu?.activeId === id && 'he-menu__item--active',
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || rest.disabled) return;
        onSelect?.();
        // The WHOLE tree: picking a row two levels down must not leave the
        // account menu standing. At the root this is exactly `close(true)`.
        menu?.closeAll(true);
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (!rest.disabled) menu?.setActiveId(id);
      }}
      {...rest}
    >
      {/* Decorative by contract: an Avatar carries its own aria-label, and inside a
        * row that already states the name it would be announced twice.
        * `inset` with no media renders the SAME empty span rather than guessing a
        * padding, so a media-less row (a pinned footer action) lands on the shared
        * label column no matter how the media column is later respaced. */}
      {(media != null || inset) && (
        <span className="he-menu__item-media" aria-hidden>
          {media}
        </span>
      )}
      {rich ? (
        <span className="he-menu__item-text">
          <span className="he-menu__item-label">{children}</span>
          {sublabel != null && <span className="he-menu__item-sublabel">{sublabel}</span>}
        </span>
      ) : (
        <span className="he-menu__item-label">{children}</span>
      )}
      {shortcut != null && <span className="he-menu__shortcut">{shortcut}</span>}
      {/* Not aria-hidden: the caller decides. MenuSub passes an aria-hidden svg. */}
      {trailing != null && <span className="he-menu__item-trailing">{trailing}</span>}
      {checked !== undefined && <span className="he-menu__item-check">{checked ? CHECK : null}</span>}
    </button>
  );
}

/**
 * A non-interactive row on the menu's row grid — for an identity block in
 * `header`. Do NOT reach for `<MenuItem disabled>`: a disabled menuitem is still
 * in the roving set and drops to opacity 0.45.
 *
 * No role, no tabIndex, no `data-he-menu-item`, so `items()` never sees it,
 * type-ahead never reaches it, and it sits inside a `role="menu"` tree only via
 * the `header` slot — which renders OUTSIDE the menu element.
 */
export function MenuStatic({ media, sublabel, trailing, className, children, ...rest }: MenuStaticProps) {
  return (
    <div className={cx('he-menu__static', className)} {...rest}>
      {media != null && (
        <span className="he-menu__item-media" aria-hidden>
          {media}
        </span>
      )}
      <span className="he-menu__item-text">
        <span className="he-menu__item-label">{children}</span>
        {sublabel != null && <span className="he-menu__item-sublabel">{sublabel}</span>}
      </span>
      {trailing != null && <span className="he-menu__item-trailing">{trailing}</span>}
    </div>
  );
}

/* The mirror of Sidebar's ChevronGlyph path — one glyph weight across the library. */
const CHEVRON_RIGHT = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M4.5 3 7.5 6 4.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * A menu row that owns a nested menu. Zero product vocabulary: every option is a
 * child, the label and the sublabel are the caller's words.
 *
 * By convention the `sublabel` reports the CURRENT VALUE of whatever the submenu
 * sets. A submenu is the right shape only for a mutually exclusive, CLOSED set
 * of 2–5 options whose current value fits the sublabel column (~146px). A list
 * of independent toggles is a Switch list, not `menuitemradio`.
 */
export function MenuSub({
  label,
  children,
  media,
  sublabel,
  menuLabel,
  header,
  footer,
  placement = 'right-start',
  offset = -1,
  crossOffset = -4,
  openDelay = 120,
  closeDelay = 200,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  contentClassName,
  className,
  id: idProp,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: MenuSubProps) {
  const menu = useContext(MenuContext);
  const autoId = useId();
  const id = idProp ?? `he-menu-item-${autoId}`;
  const actions = useRef<PopoverActions | null>(null);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const currentOpen = openProp ?? localOpen;
  const lastOpenBy = useRef<'pointer' | 'keyboard'>('pointer');

  // The parent needs a handle on this row so ArrowRight/Enter/Space can open it
  // without going anywhere near the pointer path. A disabled row is not in
  // `items()`, so it is not registered either — nothing can reach it.
  const disabled = rest.disabled ?? false;
  useEffect(
    () =>
      disabled
        ? undefined
        : menu?.registerSub(id, {
            open: (by) => {
              lastOpenBy.current = by;
              actions.current?.open(by);
            },
            close: (restore) => actions.current?.close(restore),
          }),
    [menu, id, disabled],
  );

  /* Closing a child that still holds DOM focus must hand it back to the parent
   * surface, or the tree is left standing but keyboard-dead: focus falls to
   * <body> and arrows stop reaching any menu. `false` everywhere else, so a
   * close the user never looked at cannot yank focus. */
  const closeQuietly = useCallback(() => {
    const owned = document.getElementById(id)?.getAttribute('aria-controls');
    actions.current?.close(!!owned && ownsNode(owned, document.activeElement));
  }, [id]);

  const intent = useHoverIntent(
    {
      onOpen: () => {
        lastOpenBy.current = 'pointer';
        actions.current?.open('pointer');
      },
      onClose: closeQuietly,
    },
    { open: openDelay, close: closeDelay },
  );

  /* A submenu anchored to a row that scrolled out of the clipped parent list is
   * a panel floating on nothing. */
  useEffect(() => {
    if (!currentOpen || !isBrowser()) return;
    const row = document.getElementById(id);
    const scroller = row?.closest<HTMLElement>('.he-menu__scroll');
    if (!row || !scroller) return;
    const onScroll = () => {
      const a = row.getBoundingClientRect();
      const b = scroller.getBoundingClientRect();
      if (a.bottom <= b.top || a.top >= b.bottom) closeQuietly();
    };
    scroller.addEventListener('scroll', onScroll);
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [currentOpen, id, closeQuietly]);

  return (
    <Menu
      label={menuLabel ?? (typeof label === 'string' ? label : undefined)}
      header={header}
      footer={footer}
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      actionsRef={actions}
      open={currentOpen}
      triggerHasPopup="menu"
      contentClassName={contentClassName}
      onOpenChange={(next) => {
        setLocalOpen(next);
        onOpenChange?.(next);
        if (next) {
          // setOpenSubId FIRST — it writes its ref synchronously, so the guard
          // inside setActiveId lets this swap through. setActiveId only on the
          // POINTER path: on the keyboard path activeId is already this row, and
          // setActiveId would flip `nav` to 'pointer' and drop the parent's ring.
          menu?.setOpenSubId(id);
          if (lastOpenBy.current === 'pointer') menu?.setActiveId(id);
        } else {
          menu?.setOpenSubId(null);
          intent.cancel();
        }
      }}
      /* The panels abut at offset -1, so a straight diagonal from the row into
       * the child never crosses dead space: entering the surface just cancels
       * the close timer. No safe triangle is required. */
      onMouseEnter={() => intent.cancel()}
      onMouseLeave={() => intent.leave()}
      trigger={
        <MenuItem
          id={id}
          media={media}
          sublabel={sublabel}
          trailing={CHEVRON_RIGHT}
          className={cx(currentOpen && 'he-menu__item--open', className)}
          onMouseDown={(event) => {
            onMouseDown?.(event);
            /* Keep DOM focus where the tree put it. A mousedown on a row would
             * otherwise focus the row BUTTON, which lives in the PARENT's React
             * tree — so the next ArrowDown would bubble to the parent and move
             * ITS highlight off the sub-trigger while the child sat open. */
            if (!event.defaultPrevented) event.preventDefault();
          }}
          onClick={(event) => {
            onClick?.(event);
            // preventDefault kills MenuItem's own closeAll; stopPropagation kills
            // the Popover trigger span's toggle. Clicking the row OPENS and never
            // closes — a toggle-close here is the classic hover/click flicker.
            event.preventDefault();
            event.stopPropagation();
            if (disabled) return;
            lastOpenBy.current = 'pointer';
            actions.current?.open('pointer');
          }}
          onMouseEnter={(event) => {
            onMouseEnter?.(event);
            if (disabled) return;
            // A sibling submenu already open ⇒ swap with no lag.
            intent.enter(menu?.openSubId != null && menu.openSubId !== id);
          }}
          onMouseLeave={(event) => {
            onMouseLeave?.(event);
            intent.leave();
          }}
          {...rest}
        >
          {label}
        </MenuItem>
      }
    >
      {children}
    </Menu>
  );
}

export function MenuSeparator({ className, ...rest }: MenuSeparatorProps) {
  return <div role="separator" className={cx('he-menu__separator', className)} {...rest} />;
}

export function MenuGroup({ label, children, className, ...rest }: MenuGroupProps) {
  const autoId = useId();
  const labelId = `he-menu-group-${autoId}`;

  return (
    <div
      role="group"
      aria-labelledby={label != null ? labelId : undefined}
      className={cx('he-menu__group', className)}
      {...rest}
    >
      {label != null && (
        <div className="he-menu__group-label" id={labelId}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export function MenuLabel({ className, children, ...rest }: MenuLabelProps) {
  return (
    <div className={cx('he-menu__group-label', className)} {...rest}>
      {children}
    </div>
  );
}

export function MenuFilter({
  value,
  onValueChange,
  autoFocus = true,
  label,
  className,
  onKeyDown,
  'aria-label': ariaLabel,
  ...rest
}: MenuFilterProps) {
  const ctx = useContext(MenuContext);
  const setHasFilter = ctx?.setHasFilter;

  useEffect(() => {
    if (!setHasFilter) return;
    setHasFilter(true);
    return () => setHasFilter(false);
  }, [setHasFilter]);

  // Focus never leaves the input: navigation keys are forwarded to the menu
  // controller, everything else falls through and filters.
  const forward = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !ctx) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        return ctx.move('next');
      case 'ArrowUp':
        event.preventDefault();
        return ctx.move('prev');
      case 'Home':
        event.preventDefault();
        return ctx.move('first');
      case 'End':
        event.preventDefault();
        return ctx.move('last');
      case 'Enter':
        event.preventDefault();
        return ctx.activate();
      case 'Escape':
        event.stopPropagation();
        return ctx.close(true);
      default:
        break;
    }
  };

  return (
    <div className={cx('he-menu__filter', className)}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <circle cx="6.6" cy="6.6" r="4.3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9.9 9.9 13.3 13.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        className="he-menu__filter-input"
        type="text"
        data-he-autofocus={autoFocus ? '' : undefined}
        aria-label={
          ariaLabel ?? label ?? (typeof rest.placeholder === 'string' ? rest.placeholder : undefined)
        }
        aria-controls={ctx?.menuId}
        aria-activedescendant={ctx?.activeId ?? undefined}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={forward}
        {...rest}
      />
    </div>
  );
}

export const Dropdown = Menu;
