// SessionBar — slim persistent strip above the BottomNav while a session is
// active. Off-Today: tap → /. On Today: persistent rest-timer chip while
// resting so the count never falls out of view if the user scrolls.
//
// Two modes:
//   - off-Today (any non-/ route): "Resume" affordance with summary.
//   - on Today + resting: live rest timer chip; tap scrolls the active
//     performance card into view, where the in-card timer also lives.

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession, totalLoggedSets } from '../state/session-context.js';
import { useSettings } from '../state/settings-context.js';
import { Text } from '../design-system/components';
import { dayLineageAccent } from '../design-system/tokens';
import { getDay } from '../data';
import { parseRest } from '../data/prescription';

const NAV_HEIGHT_PX = 64;

function fmt(seconds) {
  const sign = seconds < 0 ? '-' : '';
  const s = Math.abs(Math.round(seconds));
  return `${sign}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function SessionBar() {
  const { activeSession } = useSession();
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onToday = pathname === '/';
  const resting = Boolean(activeSession?.restStartedAt && activeSession?.restPerformanceId);
  const showAsTimer = onToday && resting;

  // Tick only when we're rendering the timer surface.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!showAsTimer) return undefined;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [showAsTimer]);

  if (!activeSession) return null;
  // On Today + not resting: in-page surface already shows everything.
  if (onToday && !resting) return null;

  const day = getDay(activeSession.dayKey);
  const accent = dayLineageAccent[activeSession.dayKey] ?? 'stone';
  const count = totalLoggedSets(activeSession);

  if (showAsTimer) {
    const restingPerf = activeSession.performances.find(
      (p) => p.id === activeSession.restPerformanceId,
    );
    const restRaw = restingPerf?.prescription?.rest ?? activeSession.restTargetSec;
    const rest = parseRest(restRaw);
    const targetSec = rest.lowerBoundSec ?? null;
    const elapsed = Math.max(0, (now - new Date(activeSession.restStartedAt).getTime()) / 1000);
    const atOrPast = targetSec != null && elapsed >= targetSec;
    const display = settings.restTimerMode === 'countdown' && targetSec != null
      ? fmt(targetSec - elapsed)
      : fmt(elapsed);

    return (
      <button
        type="button"
        data-testid="session-bar-timer"
        aria-label="Scroll to resting exercise"
        onClick={() => {
          // Scroll the resting performance card into view.
          const card = document.querySelector(
            `[data-performance-id="${activeSession.restPerformanceId}"]`,
          );
          if (card) card.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }}
        style={{
          all: 'unset',
          cursor: 'pointer',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: `calc(${NAV_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 20px',
          background: atOrPast
            ? `var(--accent-${accent}-soft)`
            : 'var(--surface-raised)',
          borderTop: '1px solid var(--border-hairline)',
          borderBottom: '1px solid var(--border-hairline)',
          boxShadow: '0 -8px 24px -16px rgba(0,0,0,0.18)',
          zIndex: 49,
          color: 'var(--text-primary)',
          transition: 'background-color 240ms ease',
        }}
      >
        <Text
          as="span"
          variant="mono-sm"
          style={{
            color: atOrPast ? `var(--accent-${accent}-ink)` : 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            fontWeight: 600,
          }}
        >
          Rest
        </Text>
        <Text
          as="span"
          variant="mono-lg"
          style={{
            color: atOrPast ? `var(--accent-${accent}-ink)` : 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
            flex: 1,
            textAlign: 'center',
          }}
        >
          {display}
          {targetSec != null && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 8 }}>
              / {fmt(targetSec)}
            </Text>
          )}
        </Text>
        <Text
          as="span"
          variant="mono-sm"
          tone="secondary"
          style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
        >
          View ↑
        </Text>
      </button>
    );
  }

  // Off-Today resume affordance.
  return (
    <button
      type="button"
      data-testid="session-bar"
      aria-label={`Resume ${day?.name ?? 'session'}`}
      onClick={() => navigate('/')}
      style={{
        all: 'unset',
        cursor: 'pointer',
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: `calc(${NAV_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 20px',
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
    </button>
  );
}
