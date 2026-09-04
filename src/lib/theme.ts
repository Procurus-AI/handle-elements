/* Theme helpers — the library's entire relationship with the OS and the DOM.
 *
 * The HOST owns the <html> attribute and persistence; component CSS keys only on
 * html[data-theme], never on prefers-color-scheme. The OS read lives here, in JS,
 * at the app boundary. Pure and SSR-safe: no module-scope effects, no storage. */

export type ThemeMode = 'light' | 'dark';

/** The only two writes the library makes: the attribute components key on, and the UA hint. */
export function applyTheme(mode: ThemeMode, el?: HTMLElement): void {
  const root = el ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!root) return;
  root.setAttribute('data-theme', mode);
  root.style.colorScheme = mode;
}

/** OS preference, read once to SEED a first-run default. Returns 'light' when unavailable/SSR. */
export function systemTheme(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Subscribe to OS changes. Returns an unsubscribe. Hosts that honour an explicit
 * user choice should not call this — a theme that flips at sunset with no user
 * action is a control reporting the wrong thing.
 */
export function watchSystemTheme(cb: (mode: ThemeMode) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (event: MediaQueryListEvent) => cb(event.matches ? 'dark' : 'light');
  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}

/**
 * Source for a BLOCKING inline <script> in <head>, the only place a flash of the wrong
 * theme can actually be prevented — a React component runs after first paint by
 * construction. The host owns the storage key; the library never touches storage itself.
 * Usage: <script dangerouslySetInnerHTML={{ __html: themeBootScript('app.theme') }} />
 */
export function themeBootScript(storageKey: string): string {
  // The try/catch is required: localStorage THROWS in Safari private mode and in
  // sandboxed iframes.
  return (
    `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)});` +
    `if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";` +
    `var e=document.documentElement;e.setAttribute("data-theme",t);e.style.colorScheme=t;}catch(_){}})()`
  );
}
