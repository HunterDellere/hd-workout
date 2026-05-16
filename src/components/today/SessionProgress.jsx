// SessionProgress — sticky mini-bar pinned below the page header during
// an active session. Surfaces three quiet numbers + a hairline progress
// fill so the user knows where they are in the session without scrolling
// to the bottom (audit item: "session has no top-level progress signal").
//
// Counts working sets (warmups excluded — same definition as the
// intelligence engine). Total prescribed = sum of parsed setsTotal across
// every performance.

import { useMemo } from 'react';
import { Stack, Text } from '../../design-system/components';
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

  return (
    <div
      data-testid="session-progress"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        background: 'var(--surface-page)',
        marginTop: -8,
        paddingTop: 12,
        paddingBottom: 10,
      }}
    >
      <Stack direction="row" align="baseline" justify="space-between" gap={3} style={{ marginBottom: 8 }}>
        <Stack direction="row" gap={3} align="baseline">
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {stats.workingLogged}{stats.prescribed > 0 ? `/${stats.prescribed}` : ''} sets
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
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {Math.round(stats.pct * 100)}%
          </Text>
        )}
      </Stack>
      <div
        aria-hidden
        style={{
          position: 'relative',
          width: '100%',
          height: 2,
          background: 'var(--border-hairline)',
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
            transition: 'width 240ms ease',
          }}
        />
      </div>
    </div>
  );
}
