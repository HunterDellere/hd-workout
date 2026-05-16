// HistoryStrip — last N sessions that touched this exercise as a mono
// list of top-set weight × reps. Reads from the session archive in
// IDB-backed state. Renders nothing if there's no history.

import { useMemo } from 'react';
import { Text, Stack } from '../design-system/components';
import { useSession } from '../state/session-context.js';
import { historyForExercise } from '../data/history';

const MS_DAY = 24 * 60 * 60 * 1000;

function formatRelative(iso, now = new Date()) {
  if (!iso) return '—';
  const then = new Date(iso);
  const days = Math.floor((now - then) / MS_DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function HistoryStrip({ exerciseId, limit = 6, accent = 'stone' }) {
  const { archive, hydrated } = useSession();
  const rows = useMemo(
    () => historyForExercise(archive, exerciseId, limit),
    [archive, exerciseId, limit],
  );
  if (!hydrated) return null;
  if (rows.length === 0) {
    return (
      <Text as="p" variant="body-sm" tone="tertiary">
        No history yet. Log a set on this exercise to start tracking.
      </Text>
    );
  }
  return (
    <ol
      data-testid="history-strip"
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {rows.slice().reverse().map((row, i) => (
        <li
          key={row.sessionId}
          data-history-row={row.sessionId}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 16,
            padding: '10px 0',
            borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
            alignItems: 'baseline',
          }}
        >
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {formatRelative(row.endedAt)}
          </Text>
          <Stack direction="row" gap={2} align="baseline" style={{ minWidth: 0 }}>
            <Text
              as="span"
              variant="mono-lg"
              style={{ color: `var(--accent-${accent}-ink)` }}
            >
              {row.top ? `${row.top.weight}${row.top.unit ?? ''}` : '—'}
            </Text>
            <Text as="span" variant="mono-sm" tone="secondary">
              × {row.top?.reps ?? '—'}
            </Text>
          </Stack>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {row.setCount} set{row.setCount === 1 ? '' : 's'}
          </Text>
        </li>
      ))}
    </ol>
  );
}
