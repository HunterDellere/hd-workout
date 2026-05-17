// ThemeToggle — three-state theme switch with a crossfading glyph.
// Cycles: system → light → dark → system. Persists via setTheme so the
// choice survives reloads and tabs.
//
// Bespoke 1.5px-stroke SVG marks, drawn in currentColor against the page
// surface. The toggle is a 36×36 round affordance; the glyph crossfades
// across a 200ms tween whenever the state changes.

import { useEffect, useState } from 'react';
import { getStoredTheme, setTheme } from '../applyTheme';

const NEXT = { system: 'light', light: 'dark', dark: 'system' };

const LABEL = {
  system: 'Theme: system. Tap to switch to light.',
  light:  'Theme: light. Tap to switch to dark.',
  dark:   'Theme: dark. Tap to switch to system.',
};

function Sun() {
  return (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <line x1="12" y1="3"  x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21" />
      <line x1="3"  y1="12" x2="5"  y2="12" />
      <line x1="19" y1="12" x2="21" y2="12" />
      <line x1="5.6"  y1="5.6"  x2="7"  y2="7" />
      <line x1="17"   y1="17"   x2="18.4" y2="18.4" />
      <line x1="5.6"  y1="18.4" x2="7"  y2="17" />
      <line x1="17"   y1="7"    x2="18.4" y2="5.6" />
    </>
  );
}

function Moon() {
  return (
    <path d="M19 14.5 A8 8 0 1 1 9.5 5 A6 6 0 0 0 19 14.5 Z" />
  );
}

function System() {
  // Half-moon: a circle with a vertical inner line splitting it.
  return (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <line x1="12" y1="4.5" x2="12" y2="19.5" />
      <path d="M12 4.5 A7.5 7.5 0 0 1 12 19.5 Z" fill="currentColor" stroke="none" />
    </>
  );
}

const GLYPH = { system: System, light: Sun, dark: Moon };

export function ThemeToggle({ size = 36, style, ...rest }) {
  const [theme, setLocal] = useState(() => getStoredTheme());

  // Stay in sync across tabs.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'hd:theme') setLocal(getStoredTheme());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function cycle() {
    const next = NEXT[theme] ?? 'system';
    setTheme(next);
    setLocal(next);
  }

  const Glyph = GLYPH[theme] ?? GLYPH.system;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={LABEL[theme] ?? LABEL.system}
      data-testid="theme-toggle"
      data-theme-state={theme}
      style={{
        // Hairline-bordered chip — matches the LocationChip / MonoChipButton
        // language used elsewhere. Previously borderless: read as a tiny
        // orphan icon in the otherwise-bordered masthead.
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1px solid var(--border-hairline)',
        borderRadius: 999,
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        padding: 0,
        transition: 'color 160ms ease, background-color 160ms ease, border-color 160ms ease',
        ...style,
      }}
      {...rest}
    >
      <span
        key={theme}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'hdw-toggle-fade 200ms cubic-bezier(0.4, 0, 0.2, 1) both',
        }}
      >
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <Glyph />
        </svg>
      </span>
      <style>{`
        @keyframes hdw-toggle-fade {
          from { opacity: 0; transform: scale(0.92) rotate(-12deg); }
          to   { opacity: 1; transform: scale(1) rotate(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-testid="theme-toggle"] span { animation: none !important; }
        }
      `}</style>
    </button>
  );
}
