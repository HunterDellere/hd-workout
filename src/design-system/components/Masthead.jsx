// Masthead — the persistent top bar on every page.
// Wordmark on the left, theme toggle on the right, hairline rule under.
// Fixed-position so it survives scroll; honours safe-top.
//
// Replaces the absolute-positioned ThemeToggle that used to live inside
// Page and overlap the eyebrow on narrow viewports.

import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { layout } from '../tokens';

export const MASTHEAD_HEIGHT_PX = 56;

export function Masthead() {
  return (
    <header
      data-testid="masthead"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'color-mix(in oklab, var(--surface-page) 92%, transparent)',
        backdropFilter: 'saturate(140%) blur(10px)',
        WebkitBackdropFilter: 'saturate(140%) blur(10px)',
        borderBottom: '1px solid var(--border-hairline)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: MASTHEAD_HEIGHT_PX,
          paddingLeft: `clamp(${layout.gutterMobile}px, 5vw, ${layout.gutterDesktop}px)`,
          paddingRight: `clamp(${layout.gutterMobile}px, 5vw, ${layout.gutterDesktop}px)`,
          maxWidth: layout.maxDashboard,
          margin: '0 auto',
        }}
      >
        <Link
          to="/"
          aria-label="HDW home"
          data-testid="masthead-home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <Logo size={20} />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
