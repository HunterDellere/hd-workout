// CollapsedPerformanceRow — one-line summary of an in-session
// performance when it is NOT the currently-focused exercise.
//
// Visual:
//   [tier]  Name                   2/4   ·   4 × 5-8
//
// Or when complete:
//   [tier]  Name        ✓ Done          ·   4 × 5-8
//
// Tapping anywhere on the row promotes this performance to focus.
//
// The whole row is a button so the entire surface is the tap target —
// no fishing for a small chevron. Sumi-on-washi voice: no shadows,
// no chevrons, just hairline + type.

import { findExerciseById } from '../../data';
import { parsePrescription } from '../../data/prescription';
import { Stack, Text } from '../../design-system/components';

export function CollapsedPerformanceRow({
  performance,
  accent,
  onFocus,
}) {
  const ex = findExerciseById(performance.exerciseId);
  if (!ex) return null;
  const prescription = parsePrescription(performance.prescription?.sets ?? ex.sets);
  const isWarmup = performance.sectionKey === 'warmup';
  // Warmup drills are binary — one tap to mark the whole bout done.
  // CompletionSetRow caps logged sets at one regardless of the parsed
  // setsTotal, so we mirror that contract here: any logged set = done.
  const setsLogged = isWarmup
    ? Math.min((performance.sets ?? []).length, 1)
    : (performance.sets ?? []).filter((s) => !s.isWarmup).length;
  const setsTotal = isWarmup ? 1 : (prescription.setsTotal ?? null);
  const isComplete = setsTotal != null && setsLogged >= setsTotal;
  const hasStarted = setsLogged > 0;

  // Three rendering states — drives the rail color, status chip, and
  // background tint. Order matters: complete > in-progress > pending.
  const state = isComplete ? 'complete' : (hasStarted ? 'progress' : 'pending');

  const railStyle = (() => {
    if (state === 'complete') return {
      background: `var(--accent-${accent}-ink)`,
    };
    if (state === 'progress') return {
      background: `var(--accent-${accent}-ink)`,
      opacity: 0.55,
    };
    return {
      background: 'var(--border-hairline)',
    };
  })();

  const bgStyle = state === 'progress'
    ? `var(--accent-${accent}-soft)`
    : 'transparent';

  return (
    <button
      type="button"
      data-testid="collapsed-performance-row"
      data-performance-id={performance.id}
      data-exercise-id={performance.exerciseId}
      data-complete={isComplete ? '1' : '0'}
      data-state={state}
      onClick={() => onFocus(performance.id)}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'block',
        width: '100%',
        padding: '14px 12px 14px 14px',
        borderTop: '1px solid var(--border-hairline)',
        background: bgStyle,
        position: 'relative',
        outline: 'none',
        opacity: isComplete ? 0.82 : 1,
        transition: 'background-color 200ms ease, opacity 200ms ease',
        '--focus-color': `var(--accent-${accent}-ink)`,
      }}
      aria-label={`Focus ${ex.name}`}
    >
      {/* Left signal rail — quiet for pending, accent for in-progress
          (faint) and complete (solid). Mirrors the focused card's
          accent stripe so the surface reads as one connected language. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 8,
          bottom: 8,
          width: 3,
          borderRadius: 2,
          ...railStyle,
        }}
      />
      <Stack direction="row" align="center" gap={3}>
        {ex.tier ? (
          <Text
            as="span"
            variant="mono-sm"
            style={{
              width: 14,
              flexShrink: 0,
              color: ex.tier === 'S'
                ? `var(--accent-${accent}-ink)`
                : 'var(--text-tertiary)',
              opacity: ex.tier === 'S' ? 0.95 : 0.6,
              fontWeight: 600,
              fontSize: 10,
            }}
          >
            {ex.tier}
          </Text>
        ) : <span style={{ width: 14, flexShrink: 0 }} />}
        <Text
          as="span"
          variant="title-md"
          style={{
            flex: 1,
            minWidth: 0,
            lineHeight: 1.25,
            textDecoration: isComplete ? 'line-through' : 'none',
            textDecorationColor: isComplete ? `var(--accent-${accent}-ink)` : undefined,
            textDecorationThickness: isComplete ? '1px' : undefined,
          }}
        >
          {ex.name}
        </Text>
        {/* Set progress — done/working/pending */}
        {isComplete ? (
          <Text
            as="span"
            variant="mono-sm"
            data-testid="row-status"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              padding: '3px 8px',
              borderRadius: 999,
              background: `var(--accent-${accent}-ink)`,
              color: 'var(--text-on-accent)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            ✓ Done
          </Text>
        ) : state === 'progress' ? (
          <Text
            as="span"
            variant="mono-sm"
            data-testid="row-status"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              padding: '3px 8px',
              borderRadius: 999,
              border: `1px solid var(--accent-${accent}-ink)`,
              color: `var(--accent-${accent}-ink)`,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {setsTotal != null ? `${setsLogged}/${setsTotal}` : `${setsLogged}`}
          </Text>
        ) : (
          <Text
            as="span"
            variant="mono-sm"
            tone="tertiary"
            data-testid="row-status"
            style={{ whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.10em' }}
          >
            {setsTotal != null ? `0/${setsTotal}` : '—'}
          </Text>
        )}
        {/* Prescription string suppressed — the status chip already
            carries the working/total count, and the full prescription
            (with rest) lives one tap away in the focused card. */}
      </Stack>
    </button>
  );
}
