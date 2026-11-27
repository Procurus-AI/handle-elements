import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface ToastAction {
  label: ReactNode;
  /** Runs on click; the toast closes afterwards. */
  onClick: () => void;
}

export interface ToastOptions {
  tone?: ToastTone;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  /** Milliseconds before it closes by itself. `0` or `Infinity` keeps it until dismissed. Default: the provider's. */
  duration?: number;
}

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: ToastTone;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  /** Shows the close button when given. */
  onClose?: () => void;
  /** Visible word that names the tone, so tone never relies on colour alone. */
  toneLabel?: ReactNode;
  /** Accessible name of the close button. Default `Close`, in English; give the screen's own language. */
  closeLabel?: string;
}

export type ToastToneLabels = Record<ToastTone, ReactNode>;

export interface ToastProviderProps {
  children?: ReactNode;
  /** Default auto-dismiss time in ms. Default 5000. */
  duration?: number;
  /** Most toasts shown at once; the oldest is dropped past it. Default 5. */
  limit?: number;
  /** Words shown beside each tone icon. Defaults are English; give the screen's own language. */
  toneLabels?: Partial<ToastToneLabels>;
  closeLabel?: string;
  /** Accessible name of the region that holds the stack. */
  regionLabel?: string;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const DEFAULT_LABELS: ToastToneLabels = {
  neutral: 'Notice',
  success: 'Success',
  warning: 'Warning',
  danger: 'Error',
};

const TONE_ICON: Record<ToastTone, IconName> = {
  neutral: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
};

/** Presentational toast. `ToastProvider` renders these inside its region; use it directly for static layouts. */
export function Toast({
  tone = 'neutral',
  title,
  description,
  action,
  onClose,
  toneLabel = DEFAULT_LABELS[tone],
  closeLabel = 'Close',
  className,
  ...rest
}: ToastProps) {
  return (
    <div
      // Errors interrupt (assertive); everything else waits its turn (polite).
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('he-toast', `he-toast--${tone}`, className)}
      {...rest}
    >
      <Icon name={TONE_ICON[tone]} size={16} className="he-toast__icon" />
      <div className="he-toast__content">
        <div className="he-toast__tone">{toneLabel}</div>
        <div className="he-toast__title">{title}</div>
        {description != null && <div className="he-toast__description">{description}</div>}
        {action != null && (
          <button
            type="button"
            className="he-toast__action"
            onClick={() => {
              action.onClick();
              onClose?.();
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      {onClose != null && (
        <button type="button" className="he-toast__close" onClick={onClose} aria-label={closeLabel}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}

interface ToastEntry extends ToastOptions {
  id: string;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Toast with the auto-dismiss clock. The clock stops while the pointer or focus is inside. */
function TimedToast({
  entry,
  duration,
  toneLabels,
  closeLabel,
  onDismiss,
}: {
  entry: ToastEntry;
  duration: number;
  toneLabels: ToastToneLabels;
  closeLabel: string;
  onDismiss: (id: string) => void;
}) {
  const { id, tone = 'neutral' } = entry;
  const total = entry.duration ?? duration;
  const timed = Number.isFinite(total) && total > 0;
  const remaining = useRef(total);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hover = useRef(false);
  const focus = useRef(false);

  const stop = useCallback(() => {
    if (timer.current == null) return;
    clearTimeout(timer.current);
    timer.current = null;
    remaining.current -= Date.now() - startedAt.current;
  }, []);

  const start = useCallback(() => {
    if (!timed || timer.current != null) return;
    startedAt.current = Date.now();
    timer.current = setTimeout(() => onDismiss(id), Math.max(remaining.current, 0));
  }, [timed, id, onDismiss]);

  const sync = useCallback(() => {
    if (hover.current || focus.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => {
    start();
    return () => {
      if (timer.current != null) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [start]);

  return (
    <Toast
      tone={tone}
      title={entry.title}
      description={entry.description}
      action={entry.action}
      toneLabel={toneLabels[tone]}
      closeLabel={closeLabel}
      onClose={() => onDismiss(id)}
      onMouseEnter={() => {
        hover.current = true;
        sync();
      }}
      onMouseLeave={() => {
        hover.current = false;
        sync();
      }}
      onFocus={() => {
        focus.current = true;
        sync();
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        focus.current = false;
        sync();
      }}
    />
  );
}

export function ToastProvider({
  children,
  duration = 5000,
  limit = 5,
  toneLabels,
  closeLabel = 'Close',
  regionLabel = 'Notifications',
}: ToastProviderProps) {
  const [entries, setEntries] = useState<ToastEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const counter = useRef(0);
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...toneLabels }), [toneLabels]);

  // The portal target only exists in the browser; render it after mount so server and client agree.
  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: string) => setEntries((list) => list.filter((entry) => entry.id !== id)), []);
  const dismissAll = useCallback(() => setEntries([]), []);
  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `he-toast-${++counter.current}`;
      setEntries((list) => [...list, { ...options, id }].slice(-Math.max(limit, 1)));
      return id;
    },
    [limit],
  );
  const api = useMemo<ToastApi>(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div className="he-toast-region" role="region" aria-label={regionLabel}>
            {entries.map((entry) => (
              <TimedToast
                key={entry.id}
                entry={entry}
                duration={duration}
                toneLabels={labels}
                closeLabel={closeLabel}
                onDismiss={dismiss}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (api == null) throw new Error('useToast must be used inside <ToastProvider>.');
  return api;
}
