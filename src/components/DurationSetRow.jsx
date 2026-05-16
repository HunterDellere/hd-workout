// DurationSetRow — duration/rounds variant of SetRow.
//
// For exercises authored with a duration prescription ('3 × 30 sec',
// '5 min') or rounds ('3 rounds', '5 rounds'), there's no weight/rep
// stepper. The log surface is:
//
//   - mono digital timer counting up
//   - Start / Pause / Reset
//   - Done logs a "set" carrying durationSec (no weight, no reps)
//   - For rounds, Done just increments the round counter
//   - Per-side prescriptions get an L/R indicator that flips with each set
//
// Reuses the LoggedSet component logic — but the displayed shape is
// "30s · L" or "1 round" rather than "100kg × 5".

import { useEffect, useRef, useState } from 'react';
import { Stack, Text, Button, MonoChipButton } from '../design-system/components';
import { useHaptics } from '../hooks/useHaptics';

function fmtTime(sec) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function LoggedDurationSet({ set, isLast, onDiscard, perSide }) {
  // Each logged set shows duration (or "round 1 of N"). Swipe-to-discard
  // matches SetRow's pointer pattern.
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

  const side = set.side; // 'L' | 'R' | undefined
  const isRound = set.kind === 'rounds';
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
          {isRound ? (
            <>Round {set.index}</>
          ) : (
            <>
              {fmtTime(set.durationSec ?? 0)}
              {perSide && side && (
                <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 8 }}>
                  · {side}
                </Text>
              )}
            </>
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

export function DurationSetRow({
  performance,
  prescription,
  accent,
  onLogSet,
  onDiscardSet,
}) {
  // The catalog's prescription is the source of truth for hold time;
  // for rounds, holdSec is irrelevant and we just log a round event.
  const isRounds = prescription.kind === 'rounds';
  const targetSec = prescription.holdSec ?? null;
  const perSide = prescription.perSide ?? false;

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAtRef = useRef(null);
  const haptic = useHaptics();

  // Side-flipping for per-side prescriptions: each logged set increments
  // a counter; even = L, odd = R. Visible cue under the timer.
  const sidesLogged = performance.sets.length;
  const nextSide = perSide
    ? (sidesLogged % 2 === 0 ? 'L' : 'R')
    : null;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = startedAtRef.current
          ? (Date.now() - startedAtRef.current) / 1000
          : e + 0.25;
        // At target, haptic ping once.
        if (targetSec != null && e < targetSec && next >= targetSec) {
          haptic('ready');
        }
        return next;
      });
    }, 250);
    return () => clearInterval(id);
  }, [running, targetSec, haptic]);

  function start() {
    startedAtRef.current = Date.now() - elapsed * 1000;
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function reset() {
    setRunning(false);
    setElapsed(0);
    startedAtRef.current = null;
  }
  function logSet() {
    onLogSet(
      isRounds
        ? { kind: 'rounds', durationSec: Math.round(elapsed) }
        : { kind: 'duration', durationSec: Math.round(elapsed || (targetSec ?? 0)), side: nextSide },
    );
    haptic('doubleTap');
    reset();
  }

  const atOrPast = targetSec != null && elapsed >= targetSec;
  const display = isRounds || targetSec == null
    ? fmtTime(elapsed)
    : fmtTime(Math.max(0, targetSec - elapsed));

  const setsRemaining = prescription.setsTotal
    ? Math.max(0, prescription.setsTotal - performance.sets.length)
    : null;

  return (
    <div data-testid="set-row" data-performance-id={performance.id}>
      {performance.sets.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {performance.sets.map((set, i) => (
            <LoggedDurationSet
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
        {/* Timer + side indicator */}
        <Stack direction="row" align="baseline" justify="space-between" gap={3}>
          <Stack direction="column" gap={1}>
            <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {isRounds ? 'Time' : (targetSec != null ? 'Remaining' : 'Elapsed')}
              {perSide && nextSide && (
                <Text as="span" variant="mono-sm" style={{ marginLeft: 8, color: `var(--accent-${accent}-ink)` }}>
                  · {nextSide}
                </Text>
              )}
            </Text>
            <Text
              as="div"
              variant="display-lg"
              data-testid="duration-display"
              style={{
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                color: atOrPast ? `var(--accent-${accent}-ink)` : 'var(--text-primary)',
                fontStyle: 'normal',
                fontWeight: 500,
              }}
            >
              {display}
            </Text>
          </Stack>
          {targetSec != null && !isRounds && (
            <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              Target · {fmtTime(targetSec)}
            </Text>
          )}
        </Stack>

        {/* Controls */}
        <Stack direction="row" gap={2} align="center" wrap>
          {!running ? (
            <Button
              variant="primary"
              accent={accent}
              size="md"
              onClick={start}
              data-testid="duration-start"
            >
              {elapsed > 0 ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button
              variant="soft"
              accent={accent}
              size="md"
              onClick={pause}
              data-testid="duration-pause"
            >
              Pause
            </Button>
          )}
          {elapsed > 0 && (
            <MonoChipButton onClick={reset} data-testid="duration-reset">
              Reset
            </MonoChipButton>
          )}
          <Button
            variant="primary"
            accent={accent}
            size="md"
            onClick={logSet}
            disabled={!isRounds && targetSec != null && elapsed < Math.min(5, targetSec * 0.5)}
            data-testid="duration-done"
          >
            {isRounds ? 'Round done' : 'Done'}
          </Button>
        </Stack>

        <Stack direction="row" gap={2} justify="space-between" align="center">
          {setsRemaining != null ? (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              {setsRemaining > 0
                ? `${setsRemaining} ${isRounds ? (setsRemaining === 1 ? 'round' : 'rounds') : 'set'} remaining`
                : 'Prescription complete'}
            </Text>
          ) : <span />}
        </Stack>
      </Stack>
    </div>
  );
}
