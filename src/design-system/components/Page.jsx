// Page — top-level layout primitive.
// Owns the page gutter (20 / 32 / 56 by breakpoint), the reading max-width
// (900 by default), and the vertical rhythm at the page edges. Every screen
// should compose itself inside a single <Page>.
//
// Renders persistent chrome (gear → /me + ThemeToggle) in the top-right so
// settings and theme are always one tap away. Opt out with `chrome={false}`.

import { Link } from 'react-router-dom';
import { layout } from '../tokens';
import { ThemeToggle } from './ThemeToggle';
import { NavIcon } from './NavIcon';

export function Page({
  as: As = 'main',
  width = 'reading', // 'reading' | 'dashboard' | 'full'
  topPad = 32,
  bottomPad = 120, // room for the BottomNav + SessionBar
  chrome = true,
  style,
  children,
  ...rest
}) {
  const maxWidth =
    width === 'reading'   ? layout.maxReading :
    width === 'dashboard' ? layout.maxDashboard :
    undefined;

  const computed = {
    position: 'relative',
    boxSizing: 'border-box',
    maxWidth,
    margin: '0 auto',
    paddingTop:    topPad,
    paddingBottom: bottomPad,
    paddingLeft:   `clamp(${layout.gutterMobile}px, 5vw, ${layout.gutterDesktop}px)`,
    paddingRight:  `clamp(${layout.gutterMobile}px, 5vw, ${layout.gutterDesktop}px)`,
    minHeight:     '100dvh',
    background:    'var(--surface-page)',
    color:         'var(--text-primary)',
    ...style,
  };

  return (
    <As style={computed} {...rest}>
      {chrome && (
        <div
          style={{
            position: 'absolute',
            top: topPad,
            right: `clamp(${layout.gutterMobile}px, 5vw, ${layout.gutterDesktop}px)`,
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Link
            to="/me"
            aria-label="Open settings"
            data-testid="chrome-settings"
            style={{
              width: 36,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-hairline)',
              borderRadius: 999,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 160ms ease, border-color 160ms ease',
            }}
          >
            <NavIcon name="settings" size={16} />
          </Link>
          <ThemeToggle />
        </div>
      )}
      {children}
    </As>
  );
}
