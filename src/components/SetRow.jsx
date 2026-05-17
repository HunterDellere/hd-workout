// SetRow — one row of in-workout set input.
// Weight stepper · reps stepper · RPE dot row · Log set.
// Logged sets render above as compact summary lines.
//
// Designed mid-set, eyes-up: mono-lg numerals, generous tap targets,
// the load value carries the most visual weight.

import { useState, useRef } from 'react';
import { Stack, Text, Button } from '../design-system/components';
import { useHaptics } from '../hooks/useHaptics';
import {
  platesPerSide,
  formatPlateList,
  defaultBarFor,
} from '../data/plates';

function Stepper({ label, value, step, onDelta, onChange, suffix }) {
  return (
    <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Stack direction="row" align="center" gap={1}>
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onDelta(-step)}
          style={stepBtnStyle}
        >
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const next = e.target.value.replace(/[^0-9.]/g, '');
            onChange(next === '' ? '' : Number(next));
          }}
          aria-label={label}
          style={inputStyle}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onDelta(step)}
          style={stepBtnStyle}
        >
          +
        </button>
        {suffix && (
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 4, textTransform: 'uppercase' }}>
            {suffix}
          </Text>
        )}
      </Stack>
    </Stack>
  );
}

// Wave 4.2 #16: 44×44 touch targets per WCAG 2.2 AAA and Apple HIG.
// Previous 36×36 passed visually but failed mid-set on smaller hands /
// thumb-only operation.
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
  width: 72,
  height: 44,
  border: '1px solid var(--border-strong)',
  borderRadius: 6,
  background: 'var(--surface-page)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 18,
  textAlign: 'center',
  outline: 'none',
};

const RPE_VALUES = [6, 7, 8, 9, 10];

function RpeRow({ value, onChange, accent }) {
  return (
    <Stack direction="column" gap={1}>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
        RPE
      </Text>
      <Stack direction="row" gap={1}>
        {RPE_VALUES.map((v) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              aria-label={`RPE ${v}`}
              aria-pressed={active}
              onClick={() => onChange(active ? null : v)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                width: 44,
                height: 44,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                border: active
                  ? `1.5px solid var(--accent-${accent}-ink)`
                  : '1px solid var(--border-hairline)',
                // Wave 4.1 #27: active RPE chip is wash + ink text, not a
                // solid fill. Reserves visual climax for the Log button.
                background: active ? `var(--accent-${accent}-wash)` : 'transparent',
                color: active ? `var(--accent-${accent}-ink)` : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {v}
            </button>
          );
        })}
      </Stack>
    </Stack>
  );
}

function LoggedSet({ set, isLast, onDiscard, unitDisplay, isPR }) {
  // Swipe-to-discard: pointer-driven horizontal drag reveals a Delete
  // affordance under the row. Threshold is 56px (matches the visible
  // pull-tab); beyond that, releasing fires onDiscard. Keyboard / mouse
  // path still uses the explicit button so no accessibility regression.
  const [offset, setOffset] = useState(0);
  const [tracking, setTracking] = useState(false);
  const startX = useRef(0);
  const PULL_WIDTH = 80;

  function onPointerDown(e) {
    if (e.pointerType === 'mouse') return; // pointer-touch only
    setTracking(true);
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!tracking) return;
    const dx = e.clientX - startX.current;
    // Only allow leftward drag; clamp to PULL_WIDTH.
    setOffset(Math.max(-PULL_WIDTH, Math.min(0, dx)));
  }
  function onPointerUp() {
    if (!tracking) return;
    setTracking(false);
    if (offset <= -PULL_WIDTH * 0.7) {
      onDiscard(set.index);
      setOffset(0);
    } else {
      setOffset(0); // snap back
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
      {/* Reveal layer — only visible mid-swipe. */}
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
      {set.isWarmup && (
        <Text
          as="span"
          variant="mono-sm"
          tone="tertiary"
          data-testid="warmup-badge"
          style={{ textTransform: 'uppercase', opacity: 0.7 }}
        >
          W
        </Text>
      )}
      {set.isDrop && (
        <Text
          as="span"
          variant="mono-sm"
          tone="tertiary"
          data-testid="drop-badge"
          style={{ textTransform: 'uppercase', opacity: 0.7 }}
        >
          D
        </Text>
      )}
      <Text
        as="span"
        variant="mono-lg"
        tone={set.isWarmup ? 'tertiary' : 'primary'}
        style={{
          flex: 1,
          color: isPR ? 'var(--state-pr-ink, var(--text-primary))' : undefined,
          opacity: set.isWarmup ? 0.7 : 1,
        }}
      >
        {set.weight}
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 4, textTransform: 'uppercase' }}>
          {unitDisplay}
        </Text>
        <Text as="span" variant="mono-lg" tone="tertiary" style={{ margin: '0 8px' }}>×</Text>
        {set.reps}
      </Text>
      {isPR && (
        <Text
          as="span"
          variant="mono-sm"
          data-testid="pr-badge"
          style={{
            padding: '2px 8px',
            borderRadius: 999,
            background: 'var(--state-pr-soft, transparent)',
            color: 'var(--state-pr-ink, var(--text-primary))',
            border: '1px solid var(--state-pr-ink, var(--border-strong))',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
          }}
        >
          PR
        </Text>
      )}
      {set.rpe != null && (
        <Text as="span" variant="mono-sm" tone="secondary">
          RPE {set.rpe}
        </Text>
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

// Small toggle chip for set flags (Warmup / Drop set). Mono, hairline,
// active state fills with text-primary so the flag is unmistakable
// without borrowing a movement-pattern accent.
function FlagToggle({ label, active, onToggle, testId }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      data-testid={testId}
      data-active={active ? '1' : '0'}
      onClick={onToggle}
      style={{
        all: 'unset',
        cursor: 'pointer',
        padding: '6px 12px',
        borderRadius: 4,
        border: '1px solid var(--border-hairline)',
        background: active ? 'var(--text-primary)' : 'transparent',
        color: active ? 'var(--surface-page)' : 'var(--text-tertiary)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        transition: 'background 120ms ease, color 120ms ease',
      }}
    >
      {label}
    </button>
  );
}

export function SetRow({
  performance,
  prescription,
  accent,
  unit,
  onLogSet,
  onDiscardSet,
  prSetIds,
  // Last working top-set from the archive for this exercise — used to
  // pre-fill the first set's weight/reps when nothing's been logged yet
  // in the current performance. Subsequent sets carry within-session.
  lastTop,
  // Auto-progression seed. Non-null when the user hit the top of the
  // rep range on every working set in their last session — the first
  // set's default load bumps by one increment (2.5kg / 5lb).
  autoProgression,
  // RPE-aware suggestion from the intelligence engine. When this says
  // 'hold' or 'deload', it OVERRIDES auto-progression — the engine has
  // more signal (stagnation, regression, RPE 9 on the top set) than the
  // top-of-range check alone.
  suggestion,
  // Plate calculator inputs. null/undefined values fall back to
  // unit-aware defaults via src/data/plates.js.
  barWeight,
  plateInventory,
  plateCalculatorEnabled = true,
}) {
  // Reconcile auto-progression with the suggestion engine. The engine
  // sees the full RPE + stagnation history; auto-progression only sees
  // the most recent session. When the engine vetoes a bump (hold or
  // deload), it wins.
  const suggestionVetoesBump = suggestion?.kind === 'hold'
    || suggestion?.kind === 'deload';
  const effectiveProgression = suggestionVetoesBump ? null : autoProgression;

  // Defaults: within-session prior > suggestion weight > auto-progression
  //           bump > archive top set > prescription mid > ''.
  const withinSessionPrior = performance.sets.at(-1);
  const archivePriorWeight = lastTop?.top?.weight ?? '';
  const archivePriorReps = lastTop?.top?.reps ?? '';
  const bumpedWeight = effectiveProgression?.to ?? null;
  // If suggestion has a concrete weight (hold/deload/progress), prefer it
  // over the raw archive prior when there's no within-session prior.
  const suggestionWeight = suggestion?.weight ?? null;
  const defaultWeight = withinSessionPrior?.weight
    ?? (bumpedWeight !== null ? bumpedWeight : (suggestionWeight ?? archivePriorWeight));
  // When we bump weight, drop reps to the low end of the range (a real
  // working set at the new load isn't going to hit the top again).
  // When suggestion has reps, prefer those.
  const defaultReps = withinSessionPrior?.reps
    ?? (prescription.kind === 'straight'
      ? (bumpedWeight !== null
        ? (prescription.repsLow ?? prescription.repsMid ?? '')
        : (suggestion?.reps ?? prescription.repsMid ?? prescription.repsHigh ?? archivePriorReps ?? ''))
      : (suggestion?.reps ?? archivePriorReps ?? ''));

  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);
  const [rpe, setRpe] = useState(null);
  const [isWarmup, setIsWarmup] = useState(false);
  const [isDrop, setIsDrop] = useState(false);
  const haptic = useHaptics();

  // Plate breakdown derives from the current weight input, the bar, and
  // the plate inventory. Suppressed for empty/zero, for warmups (often
  // not loaded as plates), and when the user has disabled it.
  const plateBreakdown = (() => {
    if (!plateCalculatorEnabled || isWarmup) return null;
    const n = typeof weight === 'number' ? weight : Number(weight);
    if (!Number.isFinite(n) || n <= 0) return null;
    const bar = Number.isFinite(barWeight) ? barWeight : defaultBarFor(unit);
    return platesPerSide(n, { barWeight: bar, plates: plateInventory });
  })();

  function handleLog() {
    if (weight === '' || reps === '') return;
    onLogSet({
      weight: Number(weight),
      reps: Number(reps),
      rpe,
      unit,
      isWarmup: isWarmup || undefined,
      isDrop: isDrop || undefined,
    });
    haptic('doubleTap');
    setRpe(null);
    setIsWarmup(false);
    setIsDrop(false);
    // Keep weight; reset rpe + flags; nudge reps default for next set.
  }

  const setsRemaining = prescription.setsTotal
    ? Math.max(0, prescription.setsTotal - performance.sets.length)
    : null;

  return (
    <div data-testid="set-row" data-performance-id={performance.id}>
      {performance.sets.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {performance.sets.map((set, i) => (
            <LoggedSet
              key={set.index}
              set={set}
              isLast={i !== 0}
              onDiscard={onDiscardSet}
              unitDisplay={unit}
              isPR={prSetIds?.has(`${performance.id}:${set.index}`) ?? false}
            />
          ))}
        </div>
      )}

      <Stack direction="column" gap={3}>
        <Stack direction="row" gap={3} align="flex-end" wrap>
          <Stepper
            label="Load"
            value={weight}
            step={unit === 'kg' ? 2.5 : 5}
            suffix={unit}
            onDelta={(d) => setWeight((w) => {
              const base = typeof w === 'number' ? w : (Number(w) || 0);
              return Math.max(0, Math.round((base + d) * 100) / 100);
            })}
            onChange={setWeight}
          />
          <Stepper
            label="Reps"
            value={reps}
            step={1}
            onDelta={(d) => setReps((r) => {
              const base = typeof r === 'number' ? r : (Number(r) || 0);
              return Math.max(0, base + d);
            })}
            onChange={setReps}
          />
        </Stack>

        {/* Auto-progression nudge: only shows when this is the first set
            of the performance, the user hit the top of the rep range
            last session, AND the suggestion engine hasn't vetoed the
            bump (hold/deload). Quiet mono line, accent ink. */}
        {effectiveProgression && performance.sets.length === 0 && (
          <Text
            as="div"
            variant="mono-sm"
            data-testid="auto-progression-line"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              marginTop: -8,
              color: `var(--accent-${accent}-ink)`,
            }}
          >
            +{effectiveProgression.increment}{unit} ▲ · cleared the top rep last session
          </Text>
        )}

        {plateBreakdown && (plateBreakdown.perSide.length > 0 || plateBreakdown.residual > 0) && (
          <Text
            as="div"
            variant="mono-sm"
            tone="tertiary"
            data-testid="plate-breakdown"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              marginTop: -8,
            }}
          >
            {plateBreakdown.perSide.length > 0
              ? <>Per side · {formatPlateList(plateBreakdown.perSide)}</>
              : <>Per side · —</>}
            {plateBreakdown.residual > 0 && (
              <Text as="span" variant="mono-sm" style={{ color: 'var(--state-warn-ink)', marginLeft: 8 }}>
                · {plateBreakdown.residual}{unit} short
              </Text>
            )}
          </Text>
        )}

        <RpeRow value={rpe} onChange={setRpe} accent={accent} />

        <Stack direction="row" gap={2} align="center" wrap>
          <FlagToggle
            label="Warmup"
            active={isWarmup}
            onToggle={() => {
              setIsWarmup((v) => !v);
              if (!isWarmup) setIsDrop(false); // warmup + drop is nonsensical
            }}
            testId="flag-warmup"
          />
          <FlagToggle
            label="Drop set"
            active={isDrop}
            onToggle={() => {
              setIsDrop((v) => !v);
              if (!isDrop) setIsWarmup(false);
            }}
            testId="flag-drop"
          />
        </Stack>

        <Stack direction="row" gap={2} justify="space-between" align="center">
          {setsRemaining != null ? (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              {setsRemaining > 0
                ? `${setsRemaining} set${setsRemaining === 1 ? '' : 's'} remaining`
                : 'Prescription complete'}
            </Text>
          ) : <span />}
          <Button
            variant="primary"
            accent={accent}
            size="md"
            onClick={handleLog}
            disabled={weight === '' || reps === ''}
            data-testid="log-set-button"
          >
            Log set
          </Button>
        </Stack>
      </Stack>
    </div>
  );
}
