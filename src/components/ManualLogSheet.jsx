// ManualLogSheet — log a completed activity to the archive without
// running a live session. Use case: you walked earlier in the day, did a
// quick lift between calls, or finished a stretch routine away from the
// app. The entry lands in /log the same way a normal session would.
//
// Two-step flow:
//   1. Pick exercise (catalog search, like SlotPicker).
//   2. Fill the form — date/time + the input shape matching the
//      exercise's prescription kind (strength | duration | distance).
//
// Output goes through session.addManualLog() which archives a synthetic
// completed session blob (one performance, one or more sets).

import { useMemo, useState } from 'react';
import { Sheet, Stack, Text, BrushDivider, Button } from '../design-system/components';
import { rawCatalogList, findExerciseById } from '../data';
import { isExerciseExcludedByEquipment } from '../data/equipment';
import { parsePrescription } from '../data/prescription';
import { useSession } from '../state/session-context.js';
import { useSettings } from '../state/settings-context.js';

const stepBtnStyle = {
  all: 'unset',
  width: 44,
  height: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border-hairline)',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: 20,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  flexShrink: 0,
};

const inputStyle = {
  flex: 1,
  minWidth: 0,
  height: 44,
  border: '1px solid var(--border-strong)',
  borderRadius: 6,
  background: 'var(--surface-page)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 20,
  textAlign: 'center',
  outline: 'none',
  padding: '0 8px',
  WebkitAppearance: 'none',
};

// Format an ISO-ish datetime for a <input type="datetime-local">.
// Local time, trimmed to minutes.
function toDateTimeLocal(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDateTimeLocal(str) {
  // datetime-local lacks a timezone; treat as local and convert to ISO.
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function ExercisePickStep({ onPick }) {
  const [query, setQuery] = useState('');
  const { settings } = useSettings();
  const excludedEquipment = settings?.excludedEquipment ?? [];
  const catalog = useMemo(() => rawCatalogList(), []);
  const { visible, totalMatching } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = catalog.filter((ex) => !isExerciseExcludedByEquipment(ex, excludedEquipment));
    const matched = !q
      ? pool
      : pool.filter((ex) => {
        const terms = q.split(/\s+/).filter(Boolean);
        const hay = [
          ex.name,
          ex.id,
          ...(ex.tags ?? []),
          ...(ex.equipment ?? []),
          ...(ex.primaryMuscles ?? []),
        ].join(' ').toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
    return { visible: matched.slice(0, 50), totalMatching: matched.length };
  }, [query, catalog, excludedEquipment]);

  return (
    <>
      <Stack direction="column" gap={1}>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Manual entry
        </Text>
        <Text as="h2" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 6 }}>
          What did you do?
        </Text>
      </Stack>
      <BrushDivider style={{ marginTop: 32 }} />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search exercises (e.g. walk, ruck, deadlift)…"
        aria-label="Search exercises"
        data-testid="manual-log-search"
        style={{
          width: '100%',
          marginTop: 24,
          padding: '12px 16px',
          background: 'var(--surface-sunken)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 8,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {visible.length > 0 ? (
        <ul
          data-testid="manual-log-list"
          style={{ listStyle: 'none', padding: 0, margin: '24px 0 0' }}
        >
          {visible.map((ex, i) => (
            <li key={ex.id}>
              <button
                type="button"
                data-testid="manual-log-candidate"
                data-exercise-id={ex.id}
                onClick={() => onPick(ex.id)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'block',
                  width: '100%',
                  padding: '14px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                }}
              >
                <Stack direction="column" gap={1}>
                  <Text as="span" variant="title-md">{ex.name}</Text>
                  {ex.sets && (
                    <Text
                      as="span"
                      variant="mono-sm"
                      tone="tertiary"
                      style={{ textTransform: 'uppercase', letterSpacing: '0.10em' }}
                    >
                      {ex.sets}
                    </Text>
                  )}
                </Stack>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 24 }}>
          No matches.
        </Text>
      )}
      {totalMatching > visible.length && (
        <Text
          as="p"
          variant="mono-sm"
          tone="tertiary"
          style={{ marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.10em' }}
        >
          · {totalMatching - visible.length} more — refine your search
        </Text>
      )}
    </>
  );
}

function StrengthSetEditor({ unit, sets, onChange }) {
  function updateSet(i, patch) {
    const next = sets.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    onChange(next);
  }
  function removeSet(i) {
    onChange(sets.filter((_, idx) => idx !== i));
  }
  function addSet() {
    const last = sets[sets.length - 1] ?? { weight: '', reps: '' };
    onChange([...sets, { weight: last.weight, reps: last.reps }]);
  }
  return (
    <Stack direction="column" gap={3}>
      {sets.map((set, i) => (
        <Stack key={i} direction="column" gap={1}>
          <Stack direction="row" align="baseline" justify="space-between">
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Set {i + 1}
            </Text>
            {sets.length > 1 && (
              <button
                type="button"
                aria-label={`Remove set ${i + 1}`}
                onClick={() => removeSet(i)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.10em',
                  padding: '4px 8px',
                }}
              >
                Remove
              </button>
            )}
          </Stack>
          <Stack direction="row" gap={2} align="center">
            <input
              type="text"
              inputMode="decimal"
              value={set.weight}
              onChange={(e) => updateSet(i, { weight: e.target.value.replace(/[^0-9.]/g, '') })}
              aria-label={`Set ${i + 1} weight`}
              placeholder="0"
              style={inputStyle}
            />
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', flexShrink: 0 }}>{unit}</Text>
            <Text as="span" variant="mono-lg" tone="tertiary" style={{ flexShrink: 0 }}>×</Text>
            <input
              type="text"
              inputMode="numeric"
              value={set.reps}
              onChange={(e) => updateSet(i, { reps: e.target.value.replace(/[^0-9]/g, '') })}
              aria-label={`Set ${i + 1} reps`}
              placeholder="0"
              style={inputStyle}
            />
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', flexShrink: 0 }}>reps</Text>
          </Stack>
        </Stack>
      ))}
      <Button variant="ghost" onClick={addSet} data-testid="manual-log-add-set">
        + Add set
      </Button>
    </Stack>
  );
}

function DurationEntry({ value, onChange }) {
  // value = total seconds; UI shows minutes input (most natural for a walk).
  const minutes = value === '' ? '' : Math.round(value / 60);
  return (
    <Stack direction="column" gap={1}>
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        Duration
      </Text>
      <Stack direction="row" gap={2} align="center">
        <button
          type="button"
          aria-label="Decrease duration"
          onClick={() => onChange(Math.max(0, ((Number(minutes) || 0) - 5)) * 60)}
          style={stepBtnStyle}
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => {
            const next = e.target.value.replace(/[^0-9]/g, '');
            onChange(next === '' ? '' : Number(next) * 60);
          }}
          aria-label="Duration in minutes"
          placeholder="0"
          style={inputStyle}
        />
        <button
          type="button"
          aria-label="Increase duration"
          onClick={() => onChange(((Number(minutes) || 0) + 5) * 60)}
          style={stepBtnStyle}
        >
          +
        </button>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', flexShrink: 0 }}>min</Text>
      </Stack>
    </Stack>
  );
}

function DistanceEntry({ value, onChange }) {
  return (
    <Stack direction="column" gap={1}>
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        Distance
      </Text>
      <Stack direction="row" gap={2} align="center">
        <button
          type="button"
          aria-label="Decrease distance"
          onClick={() => onChange(Math.max(0, (Number(value) || 0) - 100))}
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
          aria-label="Distance in meters"
          placeholder="0"
          style={inputStyle}
        />
        <button
          type="button"
          aria-label="Increase distance"
          onClick={() => onChange((Number(value) || 0) + 100)}
          style={stepBtnStyle}
        >
          +
        </button>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', flexShrink: 0 }}>m</Text>
      </Stack>
    </Stack>
  );
}

// Classify an exercise into the manual-entry input shape. The
// prescription string is the strongest signal when present — it tells
// us exactly what was authored. When that's missing or free-text
// (e.g. Zone-2 Walk, which has no `sets` field), fall back to
// name/category/tag heuristics so a walk doesn't get the strength form.
function inferDefaultKind(ex) {
  if (!ex) return 'strength';
  const prescription = parsePrescription(ex.sets ?? '');
  if (prescription.kind === 'duration' || prescription.kind === 'rounds') return 'duration';
  if (prescription.kind === 'distance') return 'distance';

  const hay = [
    ex.name ?? '',
    ex.id ?? '',
    ...(ex.tags ?? []),
    ...(ex.categories ?? []),
  ].join(' ').toLowerCase();

  // Distance-first: any movement that's authored as covering ground.
  if (/\b(ruck|carry|farmer|sled\s*push|sled\s*drag|prowler)\b/.test(hay)) return 'distance';

  // Duration: cardio, conditioning, walks, runs, holds, intervals,
  // stretches. The healthspan/cardio categories cover Zone-2 Walk and
  // its siblings; the regex catches name-only signals.
  if (
    /\b(cardio|conditioning|healthspan)\b/.test(hay)
    || /\b(walk|run|jog|bike|row|hike|hang|hold|stretch|intervals|amrap)\b/.test(hay)
  ) {
    return 'duration';
  }
  return 'strength';
}

function EntryFormStep({ exerciseId, onBack, onSubmit }) {
  const ex = findExerciseById(exerciseId);
  const { settings } = useSettings();
  const unit = settings?.units ?? 'lb';
  const defaultKind = useMemo(() => inferDefaultKind(ex), [ex]);
  // Kind lives in state so the user can override the heuristic — e.g. a
  // walk authored as duration can be logged as distance if they tracked
  // it on a Garmin instead.
  const [kind, setKind] = useState(defaultKind);

  const [when, setWhen] = useState(() => toDateTimeLocal(new Date()));
  const [strengthSets, setStrengthSets] = useState([{ weight: '', reps: '' }]);
  const [durationSec, setDurationSec] = useState('');
  const [distanceM, setDistanceM] = useState('');
  const [notes, setNotes] = useState('');

  if (!ex) return null;

  const canSubmit = (() => {
    if (kind === 'strength') {
      return strengthSets.some((s) => s.weight !== '' && s.reps !== '');
    }
    if (kind === 'duration') return Number(durationSec) > 0;
    if (kind === 'distance') return Number(distanceM) > 0;
    return false;
  })();

  function handleSubmit() {
    const loggedAt = fromDateTimeLocal(when) ?? new Date().toISOString();
    let sets;
    if (kind === 'strength') {
      sets = strengthSets
        .filter((s) => s.weight !== '' && s.reps !== '')
        .map((s) => ({
          weight: Number(s.weight),
          reps: Number(s.reps),
          unit,
        }));
    } else if (kind === 'duration') {
      sets = [{ kind: 'duration', durationSec: Number(durationSec) }];
    } else {
      sets = [{ kind: 'distance', distanceM: Number(distanceM) }];
    }
    onSubmit({ exerciseId, loggedAt, sets, notes: notes.trim() });
  }

  return (
    <>
      <Stack direction="column" gap={1}>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Manual entry
        </Text>
        <Text as="h2" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 6 }}>
          {ex.name}
        </Text>
      </Stack>
      <BrushDivider style={{ marginTop: 32 }} />

      <Stack direction="column" gap={3} style={{ marginTop: 24 }}>
        <Stack direction="column" gap={1}>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Log as
          </Text>
          <Stack direction="row" gap={2} style={{ flexWrap: 'wrap', rowGap: 8 }}>
            {[
              { key: 'strength', label: 'Weight × Reps' },
              { key: 'duration', label: 'Duration' },
              { key: 'distance', label: 'Distance' },
            ].map((opt) => {
              const active = kind === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  data-testid={`manual-log-kind-${opt.key}`}
                  data-active={active ? '1' : '0'}
                  onClick={() => setKind(opt.key)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    padding: '8px 14px',
                    borderRadius: 4,
                    border: active
                      ? '1px solid var(--text-primary)'
                      : '1px solid var(--border-hairline)',
                    background: active ? 'var(--text-primary)' : 'transparent',
                    color: active ? 'var(--surface-page)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </Stack>
        </Stack>

        <Stack direction="column" gap={1}>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            When
          </Text>
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            aria-label="When"
            data-testid="manual-log-when"
            style={{
              ...inputStyle,
              width: '100%',
              flex: 'none',
              textAlign: 'left',
              fontFamily: 'var(--font-mono)',
              fontSize: 16,
            }}
          />
        </Stack>

        {kind === 'strength' && (
          <StrengthSetEditor unit={unit} sets={strengthSets} onChange={setStrengthSets} />
        )}
        {kind === 'duration' && (
          <DurationEntry value={durationSec} onChange={setDurationSec} />
        )}
        {kind === 'distance' && (
          <DistanceEntry value={distanceM} onChange={setDistanceM} />
        )}

        <Stack direction="column" gap={1}>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Note (optional)
          </Text>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel?"
            aria-label="Note"
            rows={2}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--surface-sunken)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </Stack>
      </Stack>

      <Stack direction="row" gap={2} justify="space-between" align="center" style={{ marginTop: 32 }}>
        <Button variant="ghost" onClick={onBack} data-testid="manual-log-back">
          ← Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          data-testid="manual-log-save"
        >
          Save entry
        </Button>
      </Stack>
    </>
  );
}

export function ManualLogSheet({ open, onClose }) {
  const { addManualLog } = useSession();
  const [exerciseId, setExerciseId] = useState(null);

  if (!open) return null;

  function reset() {
    setExerciseId(null);
  }
  function close() {
    reset();
    onClose();
  }

  async function handleSubmit(payload) {
    await addManualLog(payload);
    close();
  }

  return (
    <Sheet open={open} onClose={close} ariaLabel="Manual log entry">
      <div
        style={{
          padding: '20px 24px 96px',
          background: 'var(--surface-page)',
          color: 'var(--text-primary)',
          minHeight: '100%',
        }}
      >
        {!exerciseId ? (
          <ExercisePickStep onPick={setExerciseId} />
        ) : (
          <EntryFormStep
            exerciseId={exerciseId}
            onBack={() => setExerciseId(null)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </Sheet>
  );
}
