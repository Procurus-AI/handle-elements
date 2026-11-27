import { useLayoutEffect, useRef } from 'react';

/** Relative luminance of a computed CSS colour (`rgb()` or `color(srgb …)`), or null. */
function luminance(css: string): number | null {
  const m = css.match(/^(?:rgba?|color)\(\s*(?:srgb\s+)?([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (!m) return null;
  const scale = css.startsWith('color(') ? 1 : 255;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => {
    const c = Number(v) / scale;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const CANDIDATES = ['var(--he-text-primary)', 'var(--he-text-inverse)'] as const;

/**
 * Picks `--he-text-primary` or `--he-text-inverse` for an element, whichever has
 * the higher contrast against its resolved background. Re-runs when the theme
 * attributes on `<html>` change, since the fill's resolved colour changes with them.
 */
export function useReadableText<T extends HTMLElement>(fill: string | undefined) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const apply = () => {
      const bg = luminance(getComputedStyle(el).backgroundColor);
      if (bg == null) return;
      let best: { token: string; contrast: number } | null = null;
      for (const token of CANDIDATES) {
        el.style.color = token;
        const fg = luminance(getComputedStyle(el).color);
        if (fg == null) continue;
        const contrast = ratio(fg, bg);
        if (!best || contrast > best.contrast) best = { token, contrast };
      }
      el.style.color = best?.token ?? '';
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => observer.disconnect();
  }, [fill]);

  return ref;
}
