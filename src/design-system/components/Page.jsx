// Page — top-level layout primitive.
// Owns the page gutter (20 / 32 / 56 by breakpoint), the reading max-width
// (900 by default), and the vertical rhythm at the page edges. Every screen
// should compose itself inside a single <Page>.
//
// The Masthead (wordmark + theme toggle) lives outside Page in App.jsx
// now, so Page no longer renders absolute-positioned chrome. The
// `chrome` prop is retained as a no-op for callsite compatibility.

import { layout } from '../tokens';

export function Page({
  as: As = 'main',
  width = 'reading', // 'reading' | 'dashboard' | 'full'
  topPad = 12,
  bottomPad = 140, // room for the BottomNav (~60) + SessionBar (~52) + breathing
  chrome = true, // eslint-disable-line no-unused-vars
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

  // id="main" + tabIndex=-1 make every page the skip-link target and a
  // programmatic focus landing point. Defaults here so callers don't repeat
  // it; a caller may still override via ...rest.
  return (
    <As id="main" tabIndex={-1} style={computed} {...rest}>
      {children}
    </As>
  );
}
