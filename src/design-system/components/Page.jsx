// Page — top-level layout primitive.
// Owns the page gutter (20 / 32 / 56 by breakpoint), the reading max-width
// (900 by default), and the vertical rhythm at the page edges. Every screen
// should compose itself inside a single <Page>.
//
// Renders persistent chrome (ThemeToggle) in the top-right. The /me
// gateway lives in the BottomNav now, so the profile chip was removed
// to keep the page corner uncluttered. Opt out with `chrome={false}`.

import { layout } from '../tokens';
import { ThemeToggle } from './ThemeToggle';

export function Page({
  as: As = 'main',
  width = 'reading', // 'reading' | 'dashboard' | 'full'
  topPad = 32,
  bottomPad = 168, // room for the BottomNav (~60) + SessionBar (~52) + breathing
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
          <ThemeToggle />
        </div>
      )}
      {children}
    </As>
  );
}
