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
import { findExerciseById } from '../data';
import { useSettings } from '../state/settings-context.js';
import { Stack, Text } from '../design-system/components';
import { dayLineageAccent } from '../design-system/tokens';
import { getDay } from '../data';
import { parseRest } from '../data/prescription';

const NAV_HEIGHT_PX = 64;

function fmt(seconds, { signPositive = false } = {}) {
  const rounded = Math.round(seconds);
  const sign = rounded < 0 ? '-' : (signPositive && rounded > 0 ? '+' : '');
  const s = Math.abs(rounded);
  return `${sign}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function SessionBar() {
  const { activeSession, clearRestTimer } = useSession();
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onToday = pathname === '/';
  const timerEnabled = settings.restTimerMode !== 'off';
  const resting = Boolean(
    activeSession?.restStartedAt
    && activeSession?.restPerformanceId
    && timerEnabled,
  );
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
    let display;
    if (settings.restTimerMode === 'countdown' && targetSec != null) {
      display = atOrPast
        ? fmt(elapsed - targetSec, { signPositive: true })
        : fmt(targetSec - elapsed);
    } else {
      display = fmt(elapsed);
    }

    const restingExercise = restingPerf
      ? findExerciseById(restingPerf.exerciseId)
      : null;
    return (
      <div
        data-testid="session-bar-timer"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: `calc(${NAV_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 16px',
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
        {/* Tap target — scroll the resting card into view. The Stop
            button below sits outside so it isn't a nested button. */}
        <button
          type="button"
          aria-label={`Scroll to resting exercise${restingExercise ? ` (${restingExercise.name})` : ''}`}
          data-testid="session-bar-timer-view"
          onClick={() => {
            const card = document.querySelector(
              `[data-performance-id="${activeSession.restPerformanceId}"]`,
            );
            if (card) card.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }}
          style={{
            all: 'unset',
            cursor: 'pointer',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 0,
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
              flexShrink: 0,
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
              flexShrink: 0,
            }}
          >
            {display}
            {targetSec != null && (
              <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 8 }}>
                / {fmt(targetSec)}
              </Text>
            )}
          </Text>
          {restingExercise && (
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              · {restingExercise.name}
            </Text>
          )}
        </button>
        <button
          type="button"
          data-testid="session-bar-timer-stop"
          aria-label="Stop rest timer"
          onClick={clearRestTimer}
          style={{
            all: 'unset',
            cursor: 'pointer',
            flexShrink: 0,
            padding: '6px 12px',
            border: `1px solid ${atOrPast ? `var(--accent-${accent}-ink)` : 'var(--border-strong)'}`,
            borderRadius: 4,
            color: atOrPast ? `var(--accent-${accent}-ink)` : 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 600,
          }}
        >
          Stop
        </button>
      </div>
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
        gap: 16,
        padding: '18px 20px',
        background: 'var(--surface-raised)',
        borderTop: '1px solid var(--border-hairline)',
        borderBottom: '1px solid var(--border-hairline)',
        boxShadow: '0 -8px 24px -16px rgba(0,0,0,0.18)',
        zIndex: 49,
        color: 'var(--text-primary)',
      }}
    >
      <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
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
        <Text
          as="span"
          variant="mono-sm"
          tone="tertiary"
          style={{ textTransform: 'uppercase', letterSpacing: '0.10em' }}
        >
          Session in progress · {count} set{count === 1 ? '' : 's'} logged
        </Text>
      </Stack>
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
