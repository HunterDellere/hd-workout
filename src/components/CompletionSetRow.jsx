// CompletionSetRow — minimal log surface for warmup drills.
//
// Warmup drills are unloaded (band pull-aparts, leg swings, CARs) — the
// user doesn't log weight or even count reps. They just do the prescribed
// movement and tap Done. This row renders one Done pill per prescribed
// set; tapping a pill logs a completion (an `isWarmup: true` set with no
// weight/reps/duration data attached).
//
// IA / UX:
//   • One pill per prescribed set, side-by-side. Mobile keeps them
//     tappable; wraps cleanly on narrow widths via Stack wrap.
//   • Tapping a pill fills it (logs a set). Pills must be tapped in
//     order — the next-up pill is the only enabled one, all later ones
//     are dimmed but visible so the user sees what's ahead.
//   • Logged pills show the day's accent ink fill; pending pills are
//     hairline outlined.
//   • Swipe-left to undo (matches SetRow / DurationSetRow behaviour but
//     simplified to the most recent set only, since there's nothing to
//     edit — just to undo).
//
// The logged set carries `isWarmup: true` so SessionProgress filters it
// out of the working-set progress count automatically.

import { Stack, Text } from '../design-system/components';
import { useHaptics } from '../hooks/useHaptics';

// Note: the parent passes `prescription` like it does to every other
// set-row variant, but warmup drills are always a single Done tap
// regardless of parsed setsTotal — so we don't destructure it here.
// (React passes it as part of the rest spread silently.)
export function CompletionSetRow({
  performance,
  accent,
  onLogSet,
  onDiscardSet,
}) {
  const haptic = useHaptics();
  // Warmup drills are always a single bout — the user does the whole
  // prescription ("8 cycles", "2 × 10 each direction", "5 each direction
  // each side") in one go, then taps done. Rendering N pills per drill
  // both clutters the UI and misrepresents the practice: cat-cow's
  // "8 cycles" is one continuous flow, not eight isolated sets. We
  // intentionally ignore the parser's setsTotal here and render one pill.
  const total = 1;
  const completed = (performance.sets ?? []).length > 0 ? 1 : 0;
  const next = completed >= total ? -1 : 0;

  function logOne(index) {
    // Only the next-up pill is tappable; ignore taps on later ones.
    if (index !== next || completed >= total) return;
    onLogSet({ kind: 'completion', isWarmup: true });
    haptic('doubleTap');
  }

  function undo() {
    if (completed === 0) return;
    onDiscardSet(completed - 1);
    haptic('light');
  }

  return (
    <div data-testid="set-row" data-performance-id={performance.id}>
      <Stack direction="row" gap={2} align="center" wrap>
        {Array.from({ length: total }).map((_, i) => {
          const isDone = i < completed;
          const isNext = i === next && completed < total;
          return (
            <button
              key={i}
              type="button"
              data-testid="completion-pill"
              data-set-index={i}
              data-done={isDone ? '1' : '0'}
              onClick={() => logOne(i)}
              disabled={!isNext}
              aria-label={isDone ? `Set ${i + 1} done` : `Mark set ${i + 1} done`}
              style={{
                all: 'unset',
                cursor: isNext ? 'pointer' : 'default',
                minHeight: 44,
                minWidth: 64,
                padding: '0 14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                boxSizing: 'border-box',
                background: isDone ? `var(--accent-${accent}-ink)` : 'transparent',
                color: isDone
                  ? 'var(--surface-page)'
                  : (isNext ? 'var(--text-primary)' : 'var(--text-tertiary)'),
                border: isDone
                  ? `1px solid var(--accent-${accent}-ink)`
                  : `1px solid var(--border-hairline)`,
                opacity: isDone || isNext ? 1 : 0.5,
                transition: 'background-color 160ms ease, color 160ms ease, opacity 160ms ease',
              }}
            >
              {isDone ? '✓ Done' : `Set ${i + 1}`}
            </button>
          );
        })}
        {completed > 0 && completed < total && (
          <button
            type="button"
            data-testid="completion-undo"
            onClick={undo}
            style={{
              all: 'unset',
              cursor: 'pointer',
              minHeight: 44,
              padding: '0 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-tertiary)',
              letterSpacing: '0.04em',
            }}
          >
            × Undo
          </button>
        )}
      </Stack>
      {completed >= total && (
        <Stack direction="row" justify="space-between" align="baseline" gap={2} style={{ marginTop: 10 }}>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Complete
          </Text>
          <button
            type="button"
            data-testid="completion-undo"
            onClick={undo}
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-tertiary)',
              letterSpacing: '0.04em',
            }}
          >
            × Undo
          </button>
        </Stack>
      )}
    </div>
  );
}
