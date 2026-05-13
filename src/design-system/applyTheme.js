// Injects design tokens (CSS variables) into the document at app boot.
// Light is default; dark mode is opt-in via `data-theme="dark"` on <html>,
// or follows `prefers-color-scheme` when no override is set.
// See local/03-design/TOKENS-V2.md.

import { buildThemeCss } from './tokens';

const STYLE_ID = 'hdw-tokens';

export function applyTheme() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = buildThemeCss();
  document.head.appendChild(style);
}

// Theme controller — user override of the system preference.
const THEME_KEY = 'hd:theme';
const VALID = new Set(['system', 'light', 'dark']);

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return VALID.has(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

export function setTheme(theme) {
  if (!VALID.has(theme)) return;
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* noop */ }
  applyThemeAttr(theme);
}

function applyThemeAttr(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function initTheme() {
  applyThemeAttr(getStoredTheme());
}
