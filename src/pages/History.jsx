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
} from '../design-system/components';
import { Link } from 'react-router-dom';
import { useSession } from '../state/session-context.js';
import { useSettings } from '../state/settings-context.js';
import { findExerciseAnywhere } from '../data';
import { voiceFor } from '../data/voice';

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

function topExerciseLines(session, limit = 3) {
  const rows = [];
  for (const p of session.performances ?? []) {
    if (!p.sets || p.sets.length === 0) continue;
    const top = p.sets.reduce(
      (best, s) => (s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps) ? s : best),
      p.sets[0],
    );
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
            {(session.dayKey ?? 'session').toUpperCase()}
          </Text>
          {isActive && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', color: 'var(--text-accent, var(--text-primary))' }}>
              In progress
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
                {row.name} — {row.top.weight}{row.top.unit ?? ''} × {row.top.reps}
              </Text>
            ))}
          </Stack>
        )}
      </Stack>
    </button>
  );
}

// ─── Set editor (inline) ───────────────────────────────────────────────────

function SetEditor({ set, onChange, onDelete }) {
  return (
    <Stack direction="row" gap={2} style={{ alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--border-hairline)' }}>
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ width: 24 }}>
        {set.index}
      </Text>
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
      <input
        type="number"
        step="0.5"
        placeholder="RPE"
        value={set.rpe ?? ''}
        onChange={(e) => onChange({ ...set, rpe: e.target.value === '' ? null : Number(e.target.value) })}
        data-testid="edit-set-rpe"
        aria-label="RPE"
        style={{ ...inputStyle, maxWidth: 56 }}
      />
      <button
        type="button"
        onClick={onDelete}
        data-testid="edit-set-delete"
        aria-label="Delete set"
        style={{
          all: 'unset', cursor: 'pointer',
          padding: '4px 8px',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.10em', textTransform: 'uppercase',
        }}
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
          return (
            <div key={p.id} style={{ marginTop: 24 }}>
              <Stack direction="column" gap={1}>
                <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                  {p.sectionKey}
                </Text>
                <Text as="span" variant="title-md">
                  {found?.exercise?.name ?? p.exerciseId}
                </Text>
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
        <Stack direction="row" align="baseline" justify="space-between" gap={3}>
          <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
            <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              Log
            </Text>
            <Text as="h1" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 4 }}>
              Every session you've logged
            </Text>
          </Stack>
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

        <BrushDivider style={{ marginTop: 24 }} />

        {!hasSessions ? (
          <>
            <Text
              as="p"
              variant="title-md"
              tone="secondary"
              style={{
                marginTop: 32,
                fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                opacity: 0.78,
              }}
            >
              {voiceFor('history-empty') ?? 'No sessions yet.'}
            </Text>
            <Text as="p" variant="body-md" tone="tertiary" style={{ marginTop: 12, maxWidth: 30 * 16 }}>
              Start one from <em>Today</em> — it'll appear here the moment you log a set.
            </Text>
          </>
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
    </Page>
  );
}
