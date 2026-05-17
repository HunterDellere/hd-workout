// Masthead — the persistent top bar on every page.
// Wordmark on the left, theme toggle on the right, hairline rule under.
// Fixed-position so it survives scroll; honours safe-top.
//
// Replaces the absolute-positioned ThemeToggle that used to live inside
// Page and overlap the eyebrow on narrow viewports.

import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { layout } from '../tokens';

export const MASTHEAD_HEIGHT_PX = 68;

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
            gap: 12,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          {/* Bare wordmark only — the enso ring lives on the favicon /
              splash / standalone surfaces. In the masthead next to body
              type, the ring at any reasonable size either competes with
              the type or reads as a tiny "○" — neither works. Let the
              serif italic wordmark carry the brand here. */}
          <span
            aria-hidden
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 500,
              // Scale up on wider viewports — at desktop widths 28px
              // floats lost in the gutter; ~36px gives the wordmark
              // presence without overpowering the eyebrow on phones.
              fontSize: 'clamp(28px, 3.4vw, 36px)',
              lineHeight: 1,
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
            }}
          >
            hdw
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
