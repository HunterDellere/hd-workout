// DistanceSetRow — distance variant for carries, walks, rucks.
//
// Prescription comes in as kind:'distance' with low/high meters. The
// lifter logs distance per round (default = the high end of the range).
// Per-side carries flip L/R between sets the same way the duration
// surface does.
//
// Logged sets carry { kind: 'distance', distanceM, side? }. The session
// store treats them like duration sets (not weighted) — no rest timer
// is triggered automatically because carries already pace themselves.

import { useRef, useState } from 'react';
import { Stack, Text, Button } from '../design-system/components';
import { useHaptics } from '../hooks/useHaptics';

function fmtMeters(n) {
  return `${Math.round(n)}m`;
}

function LoggedDistanceSet({ set, isLast, onDiscard, perSide }) {
  const [offset, setOffset] = useState(0);
  const [tracking, setTracking] = useState(false);
  const startX = useRef(0);
  const PULL_WIDTH = 80;

  function onPointerDown(e) {
    if (e.pointerType === 'mouse') return;
    setTracking(true);
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!tracking) return;
    setOffset(Math.max(-PULL_WIDTH, Math.min(0, e.clientX - startX.current)));
  }
  function onPointerUp() {
    if (!tracking) return;
    setTracking(false);
    if (offset <= -PULL_WIDTH * 0.7) {
      onDiscard(set.index);
      setOffset(0);
    } else {
      setOffset(0);
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderTop: isLast ? '1px solid var(--border-hairline)' : 'none',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: PULL_WIDTH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--state-warn-soft, var(--surface-sunken))',
          color: 'var(--state-warn-ink, var(--text-secondary))',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          opacity: Math.min(1, Math.abs(offset) / PULL_WIDTH),
        }}
      >
        Discard
      </div>
      <Stack
        direction="row"
        align="center"
        gap={3}
        data-testid="logged-set-row"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          padding: '8px 0',
          background: 'var(--surface-page)',
          transform: `translateX(${offset}px)`,
          transition: tracking ? 'none' : 'transform 180ms ease',
          touchAction: 'pan-y',
        }}
      >
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ width: 24, textTransform: 'uppercase' }}>
          {String(set.index).padStart(2, '0')}
        </Text>
        <Text as="span" variant="mono-lg" tone="primary" style={{ flex: 1 }}>
          {fmtMeters(set.distanceM ?? 0)}
          {perSide && set.side && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 8 }}>
              · {set.side}
            </Text>
          )}
        </Text>
        <button
          type="button"
          aria-label={`Discard set ${set.index}`}
          onClick={() => onDiscard(set.index)}
          style={{
            all: 'unset',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '4px 8px',
          }}
        >
          Discard
        </button>
      </Stack>
    </div>
  );
}

export function DistanceSetRow({
  performance,
  prescription,
  accent,
  onLogSet,
  onDiscardSet,
}) {
  const perSide = prescription.perSide ?? false;
  const targetHigh = prescription.distanceHigh ?? prescription.distanceLow ?? 40;
  const targetLow = prescription.distanceLow ?? targetHigh;
  const sidesLogged = performance.sets.length;
  const nextSide = perSide
    ? (sidesLogged % 2 === 0 ? 'L' : 'R')
    : null;

  // Default to the top of the range — most lifters aim for the prescribed
  // ceiling on carries. Stepper lets them dial it back per round.
  const [distance, setDistance] = useState(targetHigh);
  const haptic = useHaptics();

  function logSet() {
    onLogSet({
      kind: 'distance',
      distanceM: Number(distance) || 0,
      side: nextSide,
    });
    haptic('doubleTap');
    setDistance(targetHigh);
  }

  const setsRemaining = prescription.setsTotal
    ? Math.max(0, prescription.setsTotal - performance.sets.length)
    : null;

  return (
    <div data-testid="set-row" data-performance-id={performance.id}>
      {performance.sets.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {performance.sets.map((set, i) => (
            <LoggedDistanceSet
              key={set.index}
              set={set}
              isLast={i !== 0}
              onDiscard={onDiscardSet}
              perSide={perSide}
            />
          ))}
        </div>
      )}

      <Stack direction="column" gap={3}>
        <Stack direction="column" gap={1}>
          <Stack direction="row" align="baseline" justify="space-between" gap={2}>
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
            >
              Distance
              {perSide && nextSide && (
                <Text as="span" variant="mono-sm" style={{ marginLeft: 8, color: `var(--accent-${accent}-ink)` }}>
                  · {nextSide}
                </Text>
              )}
            </Text>
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Target · {targetLow === targetHigh
                ? `${targetHigh}m`
                : `${targetLow}–${targetHigh}m`}
            </Text>
          </Stack>
          <Stack direction="row" align="center" gap={2} style={{ width: '100%' }}>
            <button
              type="button"
              aria-label="Decrease distance"
              onClick={() => setDistance((d) => Math.max(0, (Number(d) || 0) - 5))}
              style={stepBtnStyle}
            >
              −
            </button>
            <input
              type="text"
              inputMode="decimal"
              value={distance}
              onChange={(e) => {
                const next = e.target.value.replace(/[^0-9.]/g, '');
                setDistance(next === '' ? '' : Number(next));
              }}
              aria-label="Distance in meters"
              style={inputStyle}
            />
            <button
              type="button"
              aria-label="Increase distance"
              onClick={() => setDistance((d) => (Number(d) || 0) + 5)}
              style={stepBtnStyle}
            >
              +
            </button>
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', flexShrink: 0 }}>
              m
            </Text>
          </Stack>
        </Stack>

        <Stack direction="row" gap={2} justify="space-between" align="center">
          {setsRemaining != null ? (
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
            >
              {setsRemaining > 0 ? `${setsRemaining} left` : 'Complete'}
            </Text>
          ) : <span />}
          <Button
            variant="primary"
            accent={accent}
            size="md"
            onClick={logSet}
            disabled={!distance || Number(distance) <= 0}
            data-testid="distance-done"
          >
            Done
          </Button>
        </Stack>
      </Stack>
    </div>
  );
}

const stepBtnStyle = {
  all: 'unset',
  width: 44,
  height: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border-hairline)',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: 20,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  flexShrink: 0,
};

const inputStyle = {
  flex: 1,
  minWidth: 0,
  height: 44,
  border: '1px solid var(--border-strong)',
  borderRadius: 6,
  background: 'var(--surface-page)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 20,
  textAlign: 'center',
  outline: 'none',
  padding: '0 8px',
  WebkitAppearance: 'none',
};
