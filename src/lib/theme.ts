/* Theme helpers — the library's entire relationship with the OS and the DOM.
 *
 * The HOST owns the <html> attribute and persistence; component CSS keys only on
 * html[data-theme], never on prefers-color-scheme. The OS read lives here, in JS,
 * at the app boundary. Pure and SSR-safe: no module-scope effects, no storage. */

export type ThemeMode = 'light' | 'dark';

/** What the USER chose. `applyTheme` never receives this — it receives the RESOLVED ThemeMode. */
export type ThemePreference = ThemeMode | 'system';

/** The only two writes the library makes: the attribute components key on, and the UA hint. */
export function applyTheme(mode: ThemeMode, el?: HTMLElement): void {
  const root = el ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!root) return;
  root.setAttribute('data-theme', mode);
  root.style.colorScheme = mode;
}

/**
 * OS preference. Resolves the `system` preference; returns 'light' when unavailable or on
 * the server (the boot script corrects that before first paint).
 */
export function systemTheme(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** The one-line resolver: 'system' asks the OS, a pin answers for itself. */
export function resolveTheme(preference: ThemePreference): ThemeMode {
  return preference === 'system' ? systemTheme() : preference;
}

/**
 * Subscribe to OS changes. Returns an unsubscribe. Call this only if you are applying
 * your own preference guard — otherwise use `watchResolvedTheme`, which fires only while
 * the preference is `system`. An unguarded subscription flips the theme under a user who
 * explicitly pinned one, which is a control reporting the wrong thing.
 */
export function watchSystemTheme(cb: (mode: ThemeMode) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (event: MediaQueryListEvent) => cb(event.matches ? 'dark' : 'light');
  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}

/**
 * OS changes, GUARDED by the caller's preference: the callback fires only while
 * `getPreference()` returns 'system'. A callback, not a value, on purpose — it is read
 * at EVENT time, so one subscription set up once stays correct across preference
 * changes, and a host that pins to dark simply stops hearing from it. The value-taking
 * shape forces a resubscribe on every change and invites a `[]` dep array that captures
 * a stale 'system' and follows the OS forever after the user pinned — the exact bug
 * this function exists to prevent.
 */
export function watchResolvedTheme(
  getPreference: () => ThemePreference,
  cb: (resolved: ThemeMode) => void,
): () => void {
  return watchSystemTheme((mode) => {
    if (getPreference() === 'system') cb(mode);
  });
}

/**
 * Source for a BLOCKING inline <script> in <head>, the only place a flash of the wrong
 * theme can actually be prevented — a React component runs after first paint by
 * construction. The host owns the storage key; the library never touches storage itself.
 * Usage: <script dangerouslySetInnerHTML={{ __html: themeBootScript('app.theme') }} />
 *
 * The storage slot holds a `ThemePreference`. 'light'/'dark' are PINS; anything else —
 * 'system', an empty slot, garbage — resolves from the OS. Never widen the test to a
 * three-way whitelist that writes 'system' into `data-theme`: no CSS rule matches that
 * string. The script is one-shot, so a 'system' preference still needs
 * `watchResolvedTheme` at runtime.
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
