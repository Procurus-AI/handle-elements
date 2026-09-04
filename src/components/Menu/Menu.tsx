import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
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
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';
import { computePosition, type PopoverAlign, type PopoverSide, type PositionResult } from '../../lib/position';

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end';

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  offset?: number;
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

interface MenuCtx {
  close: (restore?: boolean) => void;
  menuId: string;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  move: (to: MoveTarget) => void;
  activate: () => void;
  hasFilter: boolean;
  setHasFilter: (has: boolean) => void;
}

const MenuContext = createContext<MenuCtx | null>(null);

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function isBrowser(): boolean {
  return typeof document !== 'undefined';
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

  const side: PopoverSide = placement.startsWith('top') ? 'top' : 'bottom';
  const align: PopoverAlign = placement.endsWith('start')
    ? 'start'
    : placement.endsWith('end')
      ? 'end'
      : 'center';

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

  const applyActiveId = useCallback((next: string | null) => {
    activeIdRef.current = next;
    setActiveIdState(next);
  }, []);

  // The public setter is the mouse path (MenuItem's onMouseEnter): pointing at a
  // row hands the highlight back to the cursor, so the ring stops painting.
  const setActiveId = useCallback(
    (next: string | null) => {
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
      matchTriggerWidth,
    });
    setPosition((prev) => (samePosition(prev, next) ? prev : next));
  }, [side, align, offset, matchTriggerWidth]);

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
    setPosition(null);
    if (restoreFocus.current) returnFocusRef.current?.focus?.();
    restoreFocus.current = false;
  }, [currentOpen, applyActiveId]);

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

    const onPointerDown = (event: PointerEvent) => {
      if (!latest.current.closeOnOutside) return;
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) return;
      // No focus restore: clicking away must never yank focus back.
      setOpen(false);
    };

    // Fallback only — the primary Escape handler lives on the content div so a
    // menu inside a Modal closes itself and nothing else.
    const onKeyDown = (event: KeyboardEvent) => {
      if (!latest.current.closeOnEsc || event.key !== 'Escape') return;
      if (contentRef.current?.contains(document.activeElement)) return;
      setOpen(false);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) return;
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
  }, [currentOpen, setOpen]);

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
        event.stopPropagation();
        close(true);
        return;
      case 'Tab':
        // Close and hand focus back; the next Tab then moves on naturally.
        event.preventDefault();
        event.stopPropagation();
        close(true);
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
    () => ({ close, menuId, activeId, setActiveId, move, activate, hasFilter, setHasFilter }),
    [close, menuId, activeId, setActiveId, move, activate, hasFilter],
  );

  return (
    <>
      <span
        ref={triggerRef}
        className={cx('he-popover__trigger', disabled && 'he-popover__trigger--disabled', triggerClassName)}
        onClick={() => setOpen(!currentOpen)}
        onKeyDown={onTriggerKeyDown}
        {...(delegate
          ? null
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
          <MenuContext.Provider value={ctx}>
            <div
              ref={contentRef}
              id={contentId}
              tabIndex={-1}
              data-placement={`${position?.side ?? side}-${align}`}
              data-he-nav={nav}
              className={cx('he-popover', contentClassName, className)}
              style={
                {
                  top: position?.top ?? 0,
                  left: position?.left ?? 0,
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
          </MenuContext.Provider>,
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
        <div className="he-menu__scroll">{children}</div>
        {footer != null && <div className="he-menu__footer">{footer}</div>}
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
  const rich = media != null || sublabel != null;

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
        menu?.close(true);
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (!rest.disabled) menu?.setActiveId(id);
      }}
      {...rest}
    >
      {/* Decorative by contract: an Avatar carries its own aria-label, and inside a
        * row that already states the name it would be announced twice. */}
      {media != null && (
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
      {checked !== undefined && <span className="he-menu__item-check">{checked ? CHECK : null}</span>}
    </button>
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
