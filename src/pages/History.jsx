// /log — archived sessions list + drill-in editor.
//
// This is the "Log" destination (sitemap.md). The page also surfaces an
// Insights anchor when intelligenceEnabled, opening /log/insights for the
// derived view (PRs, weekly volume, frequency heatmap).
//
// Two modes on a single page:
//   - List view: chronological list of completed sessions, newest first.
//     The active in-progress session (if any) appears at the top with an
//     "In progress" badge so the user always sees that their current work
//     is being persisted continuously.
//   - Detail view: tap a row → show every performance + every set; tap
//     a set to edit weight/reps/RPE; delete the session entirely from
//     the trash affordance.
//
// Editing an archived session re-runs PR annotation against the rest of
// the archive so the per-set "first-PR" highlight stays correct after
// the edit lands.

import { useMemo, useState } from 'react';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
  MonoChipButton,
} from '../design-system/components';
import { Link } from 'react-router-dom';
import { useSession } from '../state/session-context.js';
import { useSettings } from '../state/settings-context.js';
import { findExerciseAnywhere } from '../data';
import { voiceFor } from '../data/voice';
import { ManualLogSheet } from '../components/ManualLogSheet';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function totalSets(session) {
  return (session.performances ?? []).reduce((n, p) => n + (p.sets?.length ?? 0), 0);
}

function describeTopSet(set) {
  if (set?.kind === 'duration' || set?.kind === 'rounds') {
    const s = set.durationSec ?? 0;
    if (s >= 60) return `${Math.round(s / 60)} min`;
    return `${s}s`;
  }
  if (set?.kind === 'distance') {
    return `${Math.round(set.distanceM ?? 0)}m`;
  }
  if (set?.weight != null && set?.reps != null) {
    return `${set.weight}${set.unit ?? ''} × ${set.reps}`;
  }
  return '—';
}

function topExerciseLines(session, limit = 3) {
  const rows = [];
  for (const p of session.performances ?? []) {
    if (!p.sets || p.sets.length === 0) continue;
    const weighted = p.sets.filter((s) => s.weight != null);
    const top = weighted.length > 0
      ? weighted.reduce(
        (best, s) => (s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps) ? s : best),
        weighted[0],
      )
      : p.sets[0];
    const found = findExerciseAnywhere(p.exerciseId);
    rows.push({
      name: found?.exercise?.name ?? p.exerciseId,
      top,
    });
  }
  return rows.slice(0, limit);
}

// ─── Session row in list view ──────────────────────────────────────────────

function SessionListRow({ session, isActive, onOpen }) {
  const sets = totalSets(session);
  const top = topExerciseLines(session, 2);
  const when = session.endedAt ?? session.startedAt;
  const isManual = session.manual === true || session.dayKey === 'manual';
  const heading = (() => {
    if (!isManual) return (session.dayKey ?? 'session').toUpperCase();
    const perf = session.performances?.[0];
    if (!perf) return 'MANUAL';
    const found = findExerciseAnywhere(perf.exerciseId);
    return (found?.exercise?.name ?? perf.exerciseId).toUpperCase();
  })();
  return (
    <button
      type="button"
      data-testid="history-row"
      data-session-id={session.id}
      onClick={() => onOpen(session.id)}
      onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = '8px'; }}
      onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = '0px'; }}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'block',
        width: '100%',
        padding: '16px 0',
        borderTop: '1px solid var(--border-hairline)',
        transition: 'padding-left 160ms ease',
      }}
    >
      <Stack direction="column" gap={1}>
        <Stack direction="row" gap={2} style={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text as="span" variant="title-md">
            {heading}
          </Text>
          {isActive && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', color: 'var(--text-accent, var(--text-primary))' }}>
              In progress
            </Text>
          )}
          {isManual && !isActive && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              Manual
            </Text>
          )}
        </Stack>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          {formatDate(when)} · {sets} set{sets === 1 ? '' : 's'}
        </Text>
        {top.length > 0 && (
          <Stack direction="column" gap={0} style={{ marginTop: 4 }}>
            {top.map((row, i) => (
              <Text key={i} as="span" variant="body-sm" tone="secondary">
                {row.name} — {describeTopSet(row.top)}
              </Text>
            ))}
          </Stack>
        )}
      </Stack>
    </button>
  );
}

// ─── Set editor (inline) ───────────────────────────────────────────────────

function formatDurationSec(sec) {
  const s = Math.max(0, Math.round(sec ?? 0));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function describePerformance(sets) {
  if (!sets || sets.length === 0) return '';
  const first = sets[0];
  if (first.kind === 'duration' || first.kind === 'rounds') {
    const total = sets.reduce((n, s) => n + (s.durationSec ?? 0), 0);
    const label = total >= 60 ? `${Math.round(total / 60)} min` : `${total}s`;
    return `${sets.length} set${sets.length === 1 ? '' : 's'} · ${label} total`;
  }
  if (first.kind === 'distance') {
    const total = sets.reduce((n, s) => n + (s.distanceM ?? 0), 0);
    return `${sets.length} set${sets.length === 1 ? '' : 's'} · ${Math.round(total)}m total`;
  }
  const weighted = sets.filter((s) => s.weight != null);
  if (weighted.length === 0) return `${sets.length} set${sets.length === 1 ? '' : 's'}`;
  const top = weighted.reduce(
    (best, s) => (s.weight > best.weight || (s.weight === best.weight && (s.reps ?? 0) > (best.reps ?? 0)) ? s : best),
    weighted[0],
  );
  return `${sets.length} set${sets.length === 1 ? '' : 's'} · top ${top.weight}${top.unit ?? ''} × ${top.reps}`;
}

function formatSetSummary(set) {
  if (set.kind === 'rounds') {
    const dur = set.durationSec ?? 0;
    return dur > 0 ? `Round ${set.index} · ${formatDurationSec(dur)}` : `Round ${set.index}`;
  }
  if (set.kind === 'duration') {
    const time = formatDurationSec(set.durationSec);
    return set.side ? `${time} · ${set.side}` : time;
  }
  if (set.kind === 'distance') {
    const dist = `${Math.round(set.distanceM ?? 0)}m`;
    return set.side ? `${dist} · ${set.side}` : dist;
  }
  if (set.weight == null && set.reps == null) return '—';
  const tags = [];
  if (set.isWarmup) tags.push('warmup');
  if (set.isDrop) tags.push('drop');
  const weight = set.weight != null ? `${set.weight}${set.unit ?? ''}` : '—';
  const reps = set.reps ?? '—';
  let line = `${weight} × ${reps}`;
  if (set.rpe != null) line += ` · RPE ${set.rpe}`;
  if (tags.length) line += ` · ${tags.join(' · ')}`;
  return line;
}

function SetEditor({ set, onChange, onDelete }) {
  const [editing, setEditing] = useState(false);
  const isWeight = set.kind == null;
  const isTimeBased = set.kind === 'duration' || set.kind === 'rounds';
  const isDistance = set.kind === 'distance';
  const isRounds = set.kind === 'rounds';

  if (!editing) {
    return (
      <Stack
        direction="row"
        gap={2}
        style={{
          alignItems: 'center',
          padding: '10px 0',
          borderTop: '1px solid var(--border-hairline)',
        }}
      >
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ width: 24, flexShrink: 0 }}>
          {String(set.index).padStart(2, '0')}
        </Text>
        <button
          type="button"
          onClick={() => setEditing(true)}
          data-testid="edit-set-toggle"
          aria-label={`Edit set ${set.index}`}
          style={{
            all: 'unset',
            cursor: 'pointer',
            flex: 1,
            minWidth: 0,
            padding: '4px 0',
          }}
        >
          <Text as="span" variant="mono-lg" tone="primary" style={{ display: 'block' }}>
            {formatSetSummary(set)}
          </Text>
        </button>
        <button
          type="button"
          onClick={onDelete}
          data-testid="edit-set-delete"
          aria-label="Delete set"
          style={iconBtnStyle}
        >
          ✕
        </button>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      gap={2}
      style={{
        alignItems: 'center',
        padding: '8px 0',
        borderTop: '1px solid var(--border-hairline)',
        flexWrap: 'wrap',
        rowGap: 8,
      }}
    >
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ width: 24, flexShrink: 0 }}>
        {String(set.index).padStart(2, '0')}
      </Text>

      {isWeight && (
        <>
          <input
            type="number"
            step="0.5"
            value={set.weight ?? ''}
            onChange={(e) => onChange({ ...set, weight: e.target.value === '' ? null : Number(e.target.value) })}
            data-testid="edit-set-weight"
            aria-label="Weight"
            style={inputStyle}
          />
          <Text as="span" variant="mono-sm" tone="tertiary">{set.unit ?? ''}</Text>
          <Text as="span" variant="mono-sm" tone="tertiary">×</Text>
          <input
            type="number"
            value={set.reps ?? ''}
            onChange={(e) => onChange({ ...set, reps: e.target.value === '' ? null : Number(e.target.value) })}
            data-testid="edit-set-reps"
            aria-label="Reps"
            style={inputStyle}
          />
          <Stack direction="row" align="center" gap={1}>
            <Text as="span" variant="mono-sm" tone="tertiary">RPE</Text>
            <input
              type="number"
              step="0.5"
              value={set.rpe ?? ''}
              onChange={(e) => onChange({ ...set, rpe: e.target.value === '' ? null : Number(e.target.value) })}
              data-testid="edit-set-rpe"
              aria-label="RPE"
              style={{ ...inputStyle, maxWidth: 56 }}
            />
          </Stack>
        </>
      )}

      {isTimeBased && (
        <>
          {isRounds && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              Round {set.index}
            </Text>
          )}
          <input
            type="number"
            value={set.durationSec ?? ''}
            onChange={(e) => onChange({ ...set, durationSec: e.target.value === '' ? null : Number(e.target.value) })}
            data-testid="edit-set-duration"
            aria-label="Duration in seconds"
            style={inputStyle}
          />
          <Text as="span" variant="mono-sm" tone="tertiary">sec</Text>
          {set.side && (
            <Text as="span" variant="mono-sm" tone="tertiary">· {set.side}</Text>
          )}
        </>
      )}

      {isDistance && (
        <>
          <input
            type="number"
            value={set.distanceM ?? ''}
            onChange={(e) => onChange({ ...set, distanceM: e.target.value === '' ? null : Number(e.target.value) })}
            data-testid="edit-set-distance"
            aria-label="Distance in meters"
            style={inputStyle}
          />
          <Text as="span" variant="mono-sm" tone="tertiary">m</Text>
          {set.side && (
            <Text as="span" variant="mono-sm" tone="tertiary">· {set.side}</Text>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => setEditing(false)}
        data-testid="edit-set-done"
        aria-label="Done editing set"
        style={iconBtnStyle}
      >
        Done
      </button>
      <button
        type="button"
        onClick={onDelete}
        data-testid="edit-set-delete"
        aria-label="Delete set"
        style={iconBtnStyle}
      >
        ✕
      </button>
    </Stack>
  );
}

const inputStyle = {
  width: 64,
  padding: '6px 8px',
  background: 'var(--surface-page)',
  border: '1px solid var(--border-hairline)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 14,
};

const iconBtnStyle = {
  all: 'unset',
  cursor: 'pointer',
  padding: '4px 8px',
  color: 'var(--text-tertiary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
};

// ─── Detail view ───────────────────────────────────────────────────────────

function SessionDetail({ session, isActive, onBack, onSave, onDelete }) {
  const [draft, setDraft] = useState(session);

  function updateSet(perfId, setIndex, nextSet) {
    setDraft((d) => ({
      ...d,
      performances: d.performances.map((p) => {
        if (p.id !== perfId) return p;
        return {
          ...p,
          sets: p.sets.map((s) => (s.index === setIndex ? nextSet : s)),
        };
      }),
    }));
  }

  function deleteSet(perfId, setIndex) {
    setDraft((d) => ({
      ...d,
      performances: d.performances.map((p) => {
        if (p.id !== perfId) return p;
        return {
          ...p,
          sets: p.sets
            .filter((s) => s.index !== setIndex)
            // Renumber so set.index stays 1..N.
            .map((s, i) => ({ ...s, index: i + 1 })),
        };
      }),
    }));
  }

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(session), [draft, session]);

  return (
    <Page>
      <Block>
        <Stack direction="row" gap={2} style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={onBack} data-testid="history-back">
            ← Back
          </Button>
          <Stack direction="row" gap={2}>
            {!isActive && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (window.confirm('Delete this session? This cannot be undone.')) onDelete();
                }}
                data-testid="history-delete"
              >
                Delete
              </Button>
            )}
            {dirty && (
              <Button variant="primary" onClick={() => onSave(draft)} data-testid="history-save">
                Save
              </Button>
            )}
          </Stack>
        </Stack>

        <Stack direction="column" gap={1} style={{ marginTop: 24 }}>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {formatDate(session.endedAt ?? session.startedAt)} · {formatTime(session.startedAt)}
            {isActive ? ' · In progress' : ''}
          </Text>
          <Text as="h1" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 4 }}>
            {(session.dayKey ?? 'Session').replace(/^./, (c) => c.toUpperCase())}
          </Text>
        </Stack>

        <BrushDivider style={{ marginTop: 24 }} />

        {draft.performances.map((p) => {
          const found = findExerciseAnywhere(p.exerciseId);
          const summary = describePerformance(p.sets);
          return (
            <div key={p.id} style={{ marginTop: 24 }}>
              <Stack direction="column" gap={1}>
                <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                  {p.sectionKey}
                </Text>
                <Text as="span" variant="title-md">
                  {found?.exercise?.name ?? p.exerciseId}
                </Text>
                {summary && (
                  <Text as="span" variant="body-sm" tone="secondary">
                    {summary}
                  </Text>
                )}
              </Stack>
              {p.sets.length === 0 ? (
                <Text as="p" variant="body-sm" tone="tertiary" style={{ marginTop: 8 }}>
                  No sets logged.
                </Text>
              ) : (
                <div style={{ marginTop: 8 }}>
                  {p.sets.map((s) => (
                    <SetEditor
                      key={s.index}
                      set={s}
                      onChange={(next) => updateSet(p.id, s.index, next)}
                      onDelete={() => deleteSet(p.id, s.index)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isActive && (
          <Text as="p" variant="body-sm" tone="tertiary" style={{ marginTop: 32 }}>
            This session is in progress and auto-saves continuously. Use <em>/today</em> to log sets;
            return here to edit history after it ends.
          </Text>
        )}
      </Block>
    </Page>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export function History() {
  const {
    activeSession,
    archive,
    hydrated,
    updateArchivedSession,
    deleteArchivedSession,
  } = useSession();
  const { settings } = useSettings();
  const [openId, setOpenId] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);

  // Newest first.
  const sortedArchive = useMemo(() => {
    return [...(archive ?? [])].sort((a, b) => {
      const ax = a.endedAt ?? a.startedAt ?? '';
      const bx = b.endedAt ?? b.startedAt ?? '';
      return ax < bx ? 1 : ax > bx ? -1 : 0;
    });
  }, [archive]);

  const openSession = useMemo(() => {
    if (!openId) return null;
    if (activeSession?.id === openId) return activeSession;
    return sortedArchive.find((s) => s.id === openId) ?? null;
  }, [openId, activeSession, sortedArchive]);

  if (!hydrated) {
    return (
      <Page>
        <Block>
          <Text as="p" variant="body-lg" tone="secondary">Loading…</Text>
        </Block>
      </Page>
    );
  }

  if (openSession) {
    const isActive = activeSession?.id === openSession.id;
    return (
      <SessionDetail
        session={openSession}
        isActive={isActive}
        onBack={() => setOpenId(null)}
        onSave={async (draft) => {
          if (isActive) return; // active session edits route through /today
          await updateArchivedSession(openSession.id, draft);
          setOpenId(null);
        }}
        onDelete={async () => {
          await deleteArchivedSession(openSession.id);
          setOpenId(null);
        }}
      />
    );
  }

  const hasSessions = activeSession || sortedArchive.length > 0;

  return (
    <Page>
      <Block>
        <Stack direction="column" gap={1}>
          <Stack direction="row" align="baseline" justify="space-between" gap={2}>
            <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Log
            </Text>
            {settings.intelligenceEnabled && (
              <Text
                as={Link}
                to="/log/insights"
                variant="mono-sm"
                tone="tertiary"
                data-testid="log-insights-link"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Insights →
              </Text>
            )}
          </Stack>
          <Text as="h1" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 4 }}>
            History
          </Text>
        </Stack>

        <Stack direction="row" gap={2} style={{ marginTop: 16, flexWrap: 'wrap', rowGap: 8 }}>
          <MonoChipButton
            onClick={() => setManualOpen(true)}
            data-testid="log-manual-entry"
          >
            + Add entry
          </MonoChipButton>
        </Stack>

        <BrushDivider style={{ marginTop: 24 }} />

        {!hasSessions ? (
          <Stack direction="column" gap={3} style={{ marginTop: 32, maxWidth: 60 * 9 }}>
            <Text
              as="p"
              variant="title-md"
              tone="secondary"
              data-testid="history-empty"
              style={{
                fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                opacity: 0.78,
              }}
            >
              {voiceFor('history-empty') ?? 'No sessions yet.'}
            </Text>
            <Text as="p" variant="body-sm" tone="tertiary">
              Finished a session, walk, or stretch outside the app? Log it
              manually so the record stays complete.
            </Text>
          </Stack>
        ) : (
          <ul data-testid="history-list" style={{ listStyle: 'none', padding: 0, margin: '24px 0 0' }}>
            {activeSession && totalSets(activeSession) > 0 && (
              <li>
                <SessionListRow session={activeSession} isActive onOpen={setOpenId} />
              </li>
            )}
            {sortedArchive.map((s) => (
              <li key={s.id}>
                <SessionListRow session={s} isActive={false} onOpen={setOpenId} />
              </li>
            ))}
          </ul>
        )}
      </Block>
      <ManualLogSheet open={manualOpen} onClose={() => setManualOpen(false)} />
    </Page>
  );
}
