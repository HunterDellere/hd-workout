// WarmupCard — the general-warmup recommendation rendered at the top of
// /today, above the first PerformanceCard.
//
// Distinct from WarmupLadderBlock (which lives inside each foundational
// PerformanceCard and renders a 40/60/80 % ramp for the specific lift).
// WarmupCard is movement-prep: 2–4 minutes of pattern-specific drills
// before the first working set. Read-only — no logging, no set tracking.
//
// Source of data: `activeProgram.days[dayKey].warmup` array. The shape
// matches a normal section entry (`{ id, sets, rest }`) but the key
// 'warmup' is treated as synthetic by validate.js and skipped by the
// catalog hydrator — so it never enters the session performance model.
//
// IA placement:
//   SessionProgress
//   longGap prompt (if shown)
//   → WarmupCard (here)
//   first PerformanceCard …
//
// Visual idiom: hairline border + day-accent left edge — same language
// as the existing WarmupLadderBlock so the two warmup surfaces feel
// like a family.
//
// State model:
//   • Default = expanded on session start.
//   • User can hide via "× Hide warmup" link.
//   • Once the user logs the first working set in the session, the card
//     auto-collapses to a single-line "Warmup · N drills · ~M min" row
//     (still tappable to re-expand if the user wants to reference it),
//     mirroring the WarmupLadderBlock's `hasLogged` dismissal contract.
//   • State persists per-session in localStorage; switching sessions
//     resets it. Key: `warmupCard:${sessionId}` → 'expanded' | 'hidden'.
//   • Responsive: header row uses Stack which wraps cleanly under ~340px;
//     drill rows are single-column so they never overflow horizontally.

import { useMemo, useState } from 'react';
import { Stack, Text } from '../../design-system/components';
import { findExerciseById } from '../../data';

const STORAGE_PREFIX = 'warmupCard';

function readState(sessionId) {
  if (!sessionId || typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}:${sessionId}`);
  } catch {
    return null;
  }
}

function writeState(sessionId, value) {
  if (!sessionId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}:${sessionId}`, value);
  } catch {
    /* quota / private mode — ignore, the UI state still works in-memory */
  }
}

// Rough total-minutes estimate. Each entry contributes ~30 sec setup + work,
// plus its rest (which we parse loosely — only the leading "m:ss" matters).
// Used only for the "~M min" label; not load-bearing.
function estimateMinutes(entries) {
  if (!entries || entries.length === 0) return 0;
  let totalSec = 0;
  for (const e of entries) {
    totalSec += 45; // baseline movement time (light reps, ~30–60 sec)
    const r = (e.rest ?? '').match(/^(\d+):(\d{2})/);
    if (r) totalSec += parseInt(r[1], 10) * 60 + parseInt(r[2], 10);
  }
  return Math.max(1, Math.round(totalSec / 60));
}

function DrillRow({ entry, isFirst }) {
  const ex = findExerciseById(entry.id);
  if (!ex) return null;
  return (
    <div
      data-testid="warmup-drill"
      data-exercise-id={entry.id}
      style={{
        paddingTop: isFirst ? 10 : 8,
        paddingBottom: 8,
        borderTop: isFirst ? 'none' : '1px solid var(--border-hairline)',
      }}
    >
      <Stack direction="row" justify="space-between" align="baseline" gap={2}>
        <Text as="div" variant="body-md" style={{ flex: '1 1 auto', minWidth: 0 }}>
          {ex.name}
        </Text>
        <Text
          as="div"
          variant="mono-sm"
          tone="tertiary"
          style={{ fontFamily: 'var(--font-mono)', flexShrink: 0 }}
        >
          {entry.sets}
        </Text>
      </Stack>
    </div>
  );
}

export function WarmupCard({ warmup, sessionId, accent, hasLoggedAny, readOnly = false }) {
  // Preview surfaces (/day/:dayKey before session start, library day pages)
  // pass `readOnly` so the card always renders expanded, never persists,
  // and omits the hide affordance. The state hook still runs
  // unconditionally to keep React's hook order stable across renders.
  const stored = useMemo(
    () => (readOnly ? null : readState(sessionId)),
    [sessionId, readOnly],
  );
  // `explicitState` holds only the deliberate user choice ('hidden' or
  // 'expanded'), never an auto-derived value. Auto-collapse-on-log is
  // computed below from `hasLoggedAny` instead of mirrored into state —
  // that avoids a setState-in-effect cascade and means reload "just
  // works" because hasLoggedAny is itself derived from the session.
  const [explicitState, setExplicitState] = useState(stored);

  if (!warmup || warmup.length === 0) return null;

  // Hidden when EITHER:
  //   (a) the user explicitly hid it this session (storage roundtrip), or
  //   (b) no explicit choice yet AND they've started logging work — the
  //       warmup is over by then, the user shouldn't have to dismiss it
  //       manually. Read-only previews never hide.
  const isHidden = !readOnly
    && (explicitState === 'hidden'
        || (explicitState !== 'expanded' && hasLoggedAny));
  const minutes = estimateMinutes(warmup);
  const drillCount = warmup.length;

  // Toggle behaviour: tapping the header on a hidden card re-expands;
  // on an expanded card, only the explicit "× Hide" link collapses.
  // Keeps the affordance unambiguous (no chevron / no full-card toggle
  // that fights with text selection).
  const expand = () => {
    setExplicitState('expanded');
    writeState(sessionId, 'expanded');
  };
  const hide = () => {
    setExplicitState('hidden');
    writeState(sessionId, 'hidden');
  };

  return (
    <div
      data-testid="warmup-card"
      data-state={isHidden ? 'hidden' : 'expanded'}
      style={{
        marginTop: 24,
        padding: isHidden ? '10px 14px' : (readOnly ? '12px 14px 10px' : '12px 14px 4px'),
        border: '1px solid var(--border-hairline)',
        borderRadius: 8,
        // Same accent-left idiom as WarmupLadderBlock — establishes that
        // both warmup surfaces belong to the same visual family.
        borderLeft: `2px solid var(--accent-${accent}-solid)`,
      }}
    >
      {isHidden ? (
        // Collapsed: single tappable row. Whole row is the affordance —
        // no chevrons (sumi voice). The "Show" link on the right makes
        // the interaction explicit for screen readers and touch.
        <button
          type="button"
          data-testid="warmup-card-show"
          onClick={expand}
          aria-label="Show warmup recommendations"
          style={{
            all: 'unset',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            cursor: 'pointer',
            // 44px is the iOS / WCAG-AA touch-target floor. The padding
            // already gives the card some height; this enforces it
            // regardless of font scaling.
            minHeight: 44,
            boxSizing: 'border-box',
          }}
        >
          <Stack
            direction="row"
            justify="space-between"
            align="baseline"
            gap={2}
            style={{ width: '100%' }}
          >
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}
            >
              Warmup · {drillCount} drill{drillCount === 1 ? '' : 's'} · ~{minutes} min
            </Text>
            <Text
              as="span"
              variant="mono-sm"
              tone="secondary"
              style={{ flexShrink: 0 }}
            >
              + Show
            </Text>
          </Stack>
        </button>
      ) : (
        <>
          <Stack direction="row" justify="space-between" align="baseline" gap={2}>
            <Text
              as="div"
              variant="mono-sm"
              tone="tertiary"
              style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}
            >
              Warmup
            </Text>
            <Text as="div" variant="mono-sm" tone="tertiary">
              {drillCount} drill{drillCount === 1 ? '' : 's'} · ~{minutes} min
            </Text>
          </Stack>
          <div style={{ marginTop: 4 }}>
            {warmup.map((entry, i) => (
              <DrillRow key={entry.id} entry={entry} isFirst={i === 0} />
            ))}
          </div>
          {!readOnly && (
            <div
              style={{
                borderTop: '1px solid var(--border-hairline)',
                padding: '8px 0 6px',
                textAlign: 'right',
              }}
            >
              <button
                type="button"
                data-testid="warmup-card-hide"
                onClick={hide}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                }}
              >
                × Hide warmup
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
