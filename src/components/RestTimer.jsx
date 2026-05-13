// RestTimer — drop-in inline timer for the current resting state.
//
// Reads `restStartedAt` + `restTargetSec` from the session store, plus the
// user's `restTimerMode` setting. Renders the elapsed (or remaining) time
// as mono numerals; pulses + haptics at the target. Persists across reloads
// because `restStartedAt` is wall-clock.

import { useEffect, useRef, useState } from 'react';
import { Stack, Text } from '../design-system/components';
import { useHaptics } from '../hooks/useHaptics';
import { parseRest } from '../data/prescription';

function fmtTime(totalSeconds) {
  const sign = totalSeconds < 0 ? '-' : '';
  const s = Math.abs(Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${sign}${m}:${String(r).padStart(2, '0')}`;
}

export function RestTimer({ startedAt, restRaw, mode = 'count-up', accent = 'stone', onStop }) {
  const [now, setNow] = useState(() => Date.now());
  // Ref, not state — we only need to remember whether we have buzzed for
  // this rest cycle, not re-render when it flips.
  const buzzedForRef = useRef(null);
  const haptic = useHaptics();

  useEffect(() => {
    if (!startedAt) return undefined;
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [startedAt]);

  const rest = parseRest(restRaw);
  const targetSec = rest.lowerBoundSec ?? null;
  const elapsedSec = startedAt
    ? Math.max(0, (now - new Date(startedAt).getTime()) / 1000)
    : 0;
  const reachedTarget = targetSec != null && elapsedSec >= targetSec;

  useEffect(() => {
    if (reachedTarget && buzzedForRef.current !== startedAt) {
      buzzedForRef.current = startedAt;
      haptic('ready');
    }
  }, [reachedTarget, startedAt, haptic]);

  if (!startedAt) return null;

  const display = mode === 'countdown' && targetSec != null
    ? fmtTime(targetSec - elapsedSec)
    : fmtTime(elapsedSec);

  const atOrPast = targetSec != null && elapsedSec >= targetSec;

  return (
    <Stack
      direction="row"
      align="center"
      justify="space-between"
      gap={3}
      data-testid="rest-timer"
      style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-hairline)',
        borderBottom: '1px solid var(--border-hairline)',
        background: atOrPast ? `var(--accent-${accent}-soft)` : 'var(--surface-sunken)',
        transition: 'background-color 240ms ease',
      }}
    >
      <Stack direction="column" gap={0}>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Rest
        </Text>
        <Text
          as="div"
          variant="mono-lg"
          style={{
            color: atOrPast ? `var(--accent-${accent}-ink)` : 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {display}
          {targetSec != null && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 8 }}>
              / {fmtTime(targetSec)}
            </Text>
          )}
        </Text>
      </Stack>
      <button
        type="button"
        onClick={onStop}
        aria-label="Stop rest timer"
        style={{
          all: 'unset',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          padding: '6px 12px',
          border: '1px solid var(--border-hairline)',
          borderRadius: 4,
        }}
      >
        Stop
      </button>
    </Stack>
  );
}
