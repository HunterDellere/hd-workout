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
import { Stack, Text, Button } from '../design-system/components';
import { useHaptics } from '../hooks/useHaptics';

function fmtTime(sec, { signPositive = false } = {}) {
  const rounded = Math.round(sec);
  const sign = rounded < 0 ? '-' : (signPositive && rounded > 0 ? '+' : '');
  const s = Math.abs(rounded);
  return `${sign}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function LoggedDurationEditor({ set, perSide, onSave, onCancel, onDiscard }) {
  const [durationSec, setDurationSec] = useState(set.durationSec ?? 0);
  const isRound = set.kind === 'rounds';
  function save() {
    onSave({ durationSec: Number(durationSec) || 0 });
  }
  return (
    <div
      data-testid="logged-set-editor"
      data-set-index={set.index}
      style={{ padding: '12px 0', borderTop: '1px solid var(--border-hairline)' }}
    >
      <Stack direction="row" align="center" gap={2} style={{ marginBottom: 8 }}>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ width: 24, textTransform: 'uppercase' }}>
          {String(set.index).padStart(2, '0')}
        </Text>
        <Text
          as="span"
          variant="mono-sm"
          tone="tertiary"
          style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
        >
          {isRound ? `Editing round ${set.index}` : 'Editing set'}
          {perSide && set.side && (
            <span style={{ marginLeft: 8 }}>· {set.side}</span>
          )}
        </Text>
      </Stack>
      <Stack direction="row" gap={2} align="center" wrap style={{ rowGap: 8 }}>
        <button
          type="button"
          aria-label="Decrease seconds"
          onClick={() => setDurationSec((d) => Math.max(0, (Number(d) || 0) - 5))}
          style={editStepBtnStyle}
        >−</button>
        <input
          type="number"
          inputMode="numeric"
          value={durationSec ?? ''}
          onChange={(e) => setDurationSec(e.target.value === '' ? 0 : Number(e.target.value))}
          data-testid="edit-logged-duration"
          aria-label="Duration in seconds"
          style={{ ...editInputStyle, width: 90, flex: '0 0 90px' }}
        />
        <Text as="span" variant="mono-sm" tone="tertiary">sec</Text>
      </Stack>
      <Stack direction="row" gap={2} justify="space-between" align="center" style={{ marginTop: 14 }}>
        <button
          type="button"
          data-testid="edit-logged-discard"
          onClick={() => onDiscard(set.index)}
          style={{
            all: 'unset',
            cursor: 'pointer',
            padding: '8px 10px',
            color: 'var(--state-warn-ink, var(--text-tertiary))',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}
        >
          Delete set
        </button>
        <Stack direction="row" gap={2}>
          <Button variant="bare" size="sm" onClick={onCancel} data-testid="edit-logged-cancel">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={save}
            data-testid="edit-logged-save"
            disabled={Number.isNaN(Number(durationSec))}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </div>
  );
}

const editStepBtnStyle = {
  all: 'unset',
  width: 36,
  height: 36,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border-hairline)',
  borderRadius: 4,
  fontFamily: 'var(--font-mono)',
  fontSize: 16,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  flexShrink: 0,
};

const editInputStyle = {
  height: 36,
  border: '1px solid var(--border-strong)',
  borderRadius: 4,
  background: 'var(--surface-page)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 16,
  textAlign: 'center',
  outline: 'none',
  padding: '0 6px',
  WebkitAppearance: 'none',
};

function LoggedDurationSet({ set, isLast, onDiscard, onEdit, perSide }) {
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
        {onEdit && (
          <button
            type="button"
            aria-label={`Edit set ${set.index}`}
            data-testid="edit-logged-set"
            onClick={() => onEdit(set.index)}
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
            Edit
          </button>
        )}
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
  onEditSet,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  // The catalog's prescription is the source of truth for hold time;
  // for rounds, holdSec is irrelevant and we just log a round event.
  const isRounds = prescription.kind === 'rounds';
  const perSide = prescription.perSide ?? false;
  // Hold-pyramid prescriptions (McGill Big 3 '10/8/6/4/2s') carry a per-set
  // ladder: the target steps down as each hold is logged. Clamp to the last
  // entry so the timer still has a target if the lifter logs extra holds.
  // Everything else uses the single authored hold time.
  const holdSchedule = Array.isArray(prescription.holdSchedule) ? prescription.holdSchedule : null;
  const targetSec = holdSchedule
    ? (holdSchedule[Math.min(performance.sets.length, holdSchedule.length - 1)] ?? null)
    : (prescription.holdSec ?? null);

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
  // Past target: keep counting up as overtime so the timer never stalls.
  // Countdown variant prefixes with `+` to flag the flip; rounds and
  // open-ended (no target) just count up plainly.
  let display;
  if (isRounds || targetSec == null) {
    display = fmtTime(elapsed);
  } else if (atOrPast) {
    display = fmtTime(elapsed - targetSec, { signPositive: true });
  } else {
    display = fmtTime(targetSec - elapsed);
  }

  const setsRemaining = prescription.setsTotal
    ? Math.max(0, prescription.setsTotal - performance.sets.length)
    : null;

  return (
    <div data-testid="set-row" data-performance-id={performance.id}>
      {performance.sets.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {performance.sets.map((set, i) => {
            if (editingIndex === set.index && onEditSet) {
              return (
                <LoggedDurationEditor
                  key={set.index}
                  set={set}
                  perSide={perSide}
                  onSave={(patch) => {
                    onEditSet(set.index, patch);
                    setEditingIndex(null);
                  }}
                  onCancel={() => setEditingIndex(null)}
                  onDiscard={(idx) => {
                    onDiscardSet(idx);
                    setEditingIndex(null);
                  }}
                />
              );
            }
            return (
              <LoggedDurationSet
                key={set.index}
                set={set}
                isLast={i !== 0}
                onDiscard={onDiscardSet}
                onEdit={onEditSet ? (idx) => setEditingIndex(idx) : null}
                perSide={perSide}
              />
            );
          })}
        </div>
      )}

      <Stack direction="column" gap={3}>
        {/* Timer + side indicator */}
        <Stack
          direction="row"
          align="baseline"
          justify="space-between"
          gap={3}
          data-testid="duration-timer-block"
          data-complete={atOrPast ? '1' : '0'}
          style={{
            padding: atOrPast ? '12px 14px' : '0',
            borderRadius: 8,
            background: atOrPast ? `var(--accent-${accent}-soft)` : 'transparent',
            border: atOrPast
              ? `1px solid var(--accent-${accent}-ink)`
              : '1px solid transparent',
            transition: 'background-color 240ms ease, border-color 240ms ease, padding 240ms ease',
          }}
        >
          <Stack direction="column" gap={1}>
            <Text
              as="div"
              variant="mono-sm"
              tone={atOrPast ? 'primary' : 'tertiary'}
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: atOrPast ? `var(--accent-${accent}-ink)` : undefined,
                fontWeight: atOrPast ? 600 : 400,
              }}
            >
              {(() => {
                if (isRounds) return 'Time';
                if (targetSec == null) return 'Elapsed';
                return atOrPast ? 'Complete · overtime' : 'Remaining';
              })()}
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
            <Text
              as="div"
              variant="mono-sm"
              tone="tertiary"
              style={{
                textTransform: 'uppercase',
                color: atOrPast ? `var(--accent-${accent}-ink)` : undefined,
                opacity: atOrPast ? 0.85 : 1,
              }}
            >
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
            <Button
              variant="ghost"
              size="md"
              onClick={reset}
              data-testid="duration-reset"
            >
              Reset
            </Button>
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
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
            >
              {setsRemaining > 0
                ? `${setsRemaining} left`
                : 'Complete'}
            </Text>
          ) : <span />}
        </Stack>
      </Stack>
    </div>
  );
}
