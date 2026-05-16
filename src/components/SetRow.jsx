// SetRow — one row of in-workout set input.
// Weight stepper · reps stepper · RPE dot row · Log set.
// Logged sets render above as compact summary lines.
//
// Designed mid-set, eyes-up: mono-lg numerals, generous tap targets,
// the load value carries the most visual weight.

import { useState } from 'react';
import { Stack, Text, Button } from '../design-system/components';
import { useHaptics } from '../hooks/useHaptics';

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

const stepBtnStyle = {
  all: 'unset',
  width: 36,
  height: 36,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border-hairline)',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: 18,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  flexShrink: 0,
};

const inputStyle = {
  width: 64,
  height: 36,
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
                width: 36,
                height: 36,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                border: active ? '1.5px solid transparent' : '1px solid var(--border-hairline)',
                background: active ? `var(--accent-${accent}-ink)` : 'transparent',
                color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
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
  return (
    <Stack
      direction="row"
      align="center"
      gap={3}
      style={{
        padding: '8px 0',
        borderTop: isLast ? '1px solid var(--border-hairline)' : 'none',
      }}
    >
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ width: 24, textTransform: 'uppercase' }}>
        {String(set.index).padStart(2, '0')}
      </Text>
      <Text
        as="span"
        variant="mono-lg"
        tone="primary"
        style={{
          flex: 1,
          color: isPR ? 'var(--state-pr-ink, var(--text-primary))' : undefined,
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
  );
}

export function SetRow({ performance, prescription, accent, unit, onLogSet, onDiscardSet, prSetIds }) {
  const defaultWeight = performance.sets.at(-1)?.weight ?? '';
  const defaultReps = prescription.kind === 'straight'
    ? (prescription.repsMid ?? prescription.repsHigh ?? '')
    : (performance.sets.at(-1)?.reps ?? '');

  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);
  const [rpe, setRpe] = useState(null);
  const haptic = useHaptics();

  function handleLog() {
    if (weight === '' || reps === '') return;
    onLogSet({
      weight: Number(weight),
      reps: Number(reps),
      rpe,
      unit,
    });
    haptic('doubleTap');
    setRpe(null);
    // Keep weight; reset rpe; nudge reps to prescription default for next set.
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

        <RpeRow value={rpe} onChange={setRpe} accent={accent} />

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
