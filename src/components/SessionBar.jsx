// SessionBar — slim persistent strip above the BottomNav while a session is
// active. Tap → /today. Hidden on /today (where the session is already in
// view) and when no session is active.

import { Link, useLocation } from 'react-router-dom';
import { useSession, totalLoggedSets } from '../state/session-context.js';
import { Text } from '../design-system/components';
import { dayLineageAccent } from '../design-system/tokens';
import { getDay } from '../data';

const NAV_HEIGHT_PX = 64; // BottomNav nominal height; safe-area handled inside the nav itself.

export function SessionBar() {
  const { activeSession } = useSession();
  const { pathname } = useLocation();

  if (!activeSession) return null;
  if (pathname === '/today' || pathname.startsWith('/today/')) return null;

  const day = getDay(activeSession.dayKey);
  const accent = dayLineageAccent[activeSession.dayKey] ?? 'stone';
  const count = totalLoggedSets(activeSession);

  return (
    <Link
      to="/today"
      data-testid="session-bar"
      aria-label={`Resume ${day?.name ?? 'session'}`}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: `calc(${NAV_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 20px',
        textDecoration: 'none',
        background: 'var(--surface-sunken)',
        borderTop: '1px solid var(--border-hairline)',
        borderBottom: '1px solid var(--border-hairline)',
        zIndex: 49,
        color: 'var(--text-primary)',
      }}
    >
      <Text
        as="span"
        variant="mono-sm"
        style={{
          color: `var(--accent-${accent}-ink)`,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          fontWeight: 600,
        }}
      >
        {day?.name ?? activeSession.dayKey}
      </Text>
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ flex: 1, textTransform: 'uppercase' }}>
        {count} set{count === 1 ? '' : 's'} logged
      </Text>
      <Text
        as="span"
        variant="mono-sm"
        tone="secondary"
        style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
      >
        Resume →
      </Text>
    </Link>
  );
}
