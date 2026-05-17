// SessionProgress — sticky mini-bar pinned below the page header during
// an active session. Surfaces three quiet numbers + a hairline progress
// fill so the user knows where they are in the session without scrolling
// to the bottom (audit item: "session has no top-level progress signal").
//
// Counts working sets (warmups excluded — same definition as the
// intelligence engine). Total prescribed = sum of parsed setsTotal across
// every performance.

import { useMemo } from 'react';
import { Stack, Text, MASTHEAD_HEIGHT_PX } from '../../design-system/components';
import { parsePrescription } from '../../data/prescription';

export function SessionProgress({ session, accent }) {
  const stats = useMemo(() => {
    if (!session) return null;
    let workingLogged = 0;
    let totalLogged = 0;
    let prescribed = 0;
    let prs = 0;
    for (const perf of session.performances ?? []) {
      const p = parsePrescription(perf.prescription?.sets ?? '');
      prescribed += p.setsTotal || 0;
      for (const s of perf.sets ?? []) {
        totalLogged += 1;
        if (!s.isWarmup) workingLogged += 1;
        if (s.pr) prs += 1;
      }
    }
    const pct = prescribed > 0 ? Math.min(1, workingLogged / prescribed) : 0;
    return { workingLogged, totalLogged, prescribed, prs, pct };
  }, [session]);

  if (!stats) return null;

  const isResting = Boolean(session.restStartedAt && session.restPerformanceId);
  const isComplete = stats.prescribed > 0 && stats.pct >= 1;

  return (
    <div
      data-testid="session-progress"
      data-resting={isResting ? '1' : '0'}
      data-complete={isComplete ? '1' : '0'}
      style={{
        position: 'sticky',
        top: MASTHEAD_HEIGHT_PX,
        zIndex: 2,
        background: 'var(--surface-page)',
        marginTop: -8,
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <Stack direction="row" align="center" justify="space-between" gap={3} style={{ marginBottom: 10 }}>
        <Stack direction="row" gap={2} align="center">
          {/* Status pip — solid when resting (pulses), hairline-ring when
              actively logging, filled square when the prescription is
              fully cleared. */}
          <span
            aria-hidden
            data-testid="session-status-pip"
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: isComplete ? 2 : 999,
              background: isResting || isComplete
                ? `var(--accent-${accent}-ink)`
                : 'transparent',
              border: isResting || isComplete
                ? `1px solid var(--accent-${accent}-ink)`
                : `1.5px solid var(--accent-${accent}-ink)`,
              animation: isResting ? 'hdw-pip-pulse 1.4s ease-in-out infinite' : undefined,
            }}
          />
          <Text
            as="span"
            variant="mono-sm"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontWeight: 600,
              color: isResting || isComplete
                ? `var(--accent-${accent}-ink)`
                : 'var(--text-secondary)',
            }}
          >
            {isComplete ? 'Complete' : (isResting ? 'Resting' : 'Working')}
          </Text>
          <Text
            as="span"
            variant="mono-sm"
            tone="tertiary"
            style={{ textTransform: 'uppercase', letterSpacing: '0.12em', marginLeft: 4 }}
          >
            · {stats.workingLogged}{stats.prescribed > 0 ? `/${stats.prescribed}` : ''} sets
          </Text>
          {stats.prs > 0 && (
            <Text
              as="span"
              variant="mono-sm"
              data-testid="progress-pr-count"
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--state-pr-ink, var(--text-primary))',
              }}
            >
              · {stats.prs} pr{stats.prs === 1 ? '' : 's'}
            </Text>
          )}
        </Stack>
        {stats.prescribed > 0 && (
          <Text
            as="span"
            variant="mono-sm"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              fontWeight: 600,
              color: isComplete ? `var(--accent-${accent}-ink)` : 'var(--text-secondary)',
            }}
          >
            {Math.round(stats.pct * 100)}%
          </Text>
        )}
      </Stack>
      <style>{`
        @keyframes hdw-pip-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.45; transform: scale(0.85); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-testid="session-status-pip"] { animation: none !important; }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: 'relative',
          width: '100%',
          height: 4,
          background: `var(--accent-${accent}-soft)`,
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${stats.pct * 100}%`,
            background: `var(--accent-${accent}-ink)`,
            transition: 'width 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}
