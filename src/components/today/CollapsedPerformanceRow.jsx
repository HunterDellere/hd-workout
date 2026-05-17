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
  const workingSetsLogged = (performance.sets ?? []).filter((s) => !s.isWarmup).length;
  const setsTotal = prescription.setsTotal ?? null;
  const isComplete = setsTotal != null && workingSetsLogged >= setsTotal;
  const hasStarted = workingSetsLogged > 0;

  return (
    <button
      type="button"
      data-testid="collapsed-performance-row"
      data-performance-id={performance.id}
      data-exercise-id={performance.exerciseId}
      data-complete={isComplete ? '1' : '0'}
      onClick={() => onFocus(performance.id)}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'block',
        width: '100%',
        padding: '14px 0',
        borderTop: '1px solid var(--border-hairline)',
        // Keep keyboard focus visible — design-system uses --focus-color.
        outline: 'none',
        opacity: isComplete ? 0.78 : 1,
        '--focus-color': `var(--accent-${accent}-ink)`,
      }}
      aria-label={`Focus ${ex.name}`}
    >
      <Stack direction="row" align="baseline" gap={3}>
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
          style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}
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
              color: `var(--accent-${accent}-ink)`,
              whiteSpace: 'nowrap',
            }}
          >
            ✓ Done
          </Text>
        ) : (
          <Text
            as="span"
            variant="mono-sm"
            tone={hasStarted ? 'secondary' : 'tertiary'}
            data-testid="row-status"
            style={{ whiteSpace: 'nowrap' }}
          >
            {setsTotal != null ? `${workingSetsLogged}/${setsTotal}` : `${workingSetsLogged} set${workingSetsLogged === 1 ? '' : 's'}`}
          </Text>
        )}
        <Text
          as="span"
          variant="mono-sm"
          tone="tertiary"
          style={{ whiteSpace: 'nowrap', textTransform: 'uppercase' }}
        >
          {performance.prescription?.sets ?? ex.sets}
        </Text>
      </Stack>
    </button>
  );
}
