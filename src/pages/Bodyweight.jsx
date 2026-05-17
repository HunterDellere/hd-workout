// /me/bodyweight — daily bodyweight log with sparkline chart.
//
// Quiet by design: today's input at the top, a 90-day sparkline, then a
// list of recent entries. No stretch goals (BMI, body-fat estimation,
// trend bands) — the value is in the longitudinal record, not the
// computed take.

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
  MonoChipButton,
} from '../design-system/components';
import { useBodyweight, todayIso, latestEntry } from '../state/bodyweight-context.js';
import { useSettings } from '../state/settings-context.js';

function daysBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
}

function formatDate(iso) {
  // 'Today' / 'Yesterday' for the freshest two; ISO otherwise.
  const t = todayIso();
  if (iso === t) return 'Today';
  const yest = todayIso(new Date(Date.now() - 86400000));
  if (iso === yest) return 'Yesterday';
  return iso;
}

function Sparkline({ entries, unit }) {
  // Cutoff captured once per mount via lazy useState init — React 19
  // purity checker forbids Date.now() at the top level of render.
  // Sparkline scope is "last ~90 days from when this page first rendered."
  const [cutoff] = useState(() => todayIso(new Date(Date.now() - 90 * 86400000)));
  const points = entries
    .filter((e) => e.date >= cutoff && e.unit === unit)
    .map((e) => ({ date: e.date, value: e.value }));

  if (points.length < 2) {
    return (
      <Text as="p" variant="body-md" tone="tertiary" style={{ fontStyle: 'italic', padding: '32px 0' }}>
        Log a few entries to see the line.
      </Text>
    );
  }

  const W = 600;
  const H = 120;
  const PAD = 8;
  const startDate = points[0].date;
  const endDate = todayIso();
  const totalDays = Math.max(1, daysBetween(startDate, endDate));
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.5, max - min);

  const coords = points.map((p) => {
    const x = PAD + (daysBetween(startDate, p.date) / totalDays) * (W - PAD * 2);
    const y = H - PAD - ((p.value - min) / range) * (H - PAD * 2);
    return [x, y];
  });

  const path = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');

  const latest = points[points.length - 1];
  const first = points[0];
  const delta = latest.value - first.value;
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <div data-testid="bodyweight-sparkline" style={{ marginTop: 12 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        preserveAspectRatio="none"
        aria-label="Bodyweight trend"
        style={{ display: 'block' }}
      >
        <path
          d={path}
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === coords.length - 1 ? 3 : 1.5}
            fill={i === coords.length - 1 ? 'var(--accent-rust-ink)' : 'var(--text-secondary)'}
          />
        ))}
      </svg>
      <Stack direction="row" justify="space-between" align="baseline" style={{ marginTop: 8 }}>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          {first.date} → {latest.date}
        </Text>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          {deltaSign}{delta.toFixed(1)}{unit}
        </Text>
      </Stack>
    </div>
  );
}

function EntryRow({ entry, onDelete, isFirst }) {
  return (
    <li
      data-testid="bodyweight-row"
      data-date={entry.date}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 0',
        borderTop: isFirst ? 'none' : '1px solid var(--border-hairline)',
      }}
    >
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', minWidth: 100 }}>
        {formatDate(entry.date)}
      </Text>
      <Text as="span" variant="mono-lg" tone="primary" style={{ flex: 1 }}>
        {entry.value}
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 6 }}>
          {entry.unit}
        </Text>
      </Text>
      <button
        type="button"
        aria-label={`Delete entry for ${entry.date}`}
        onClick={() => onDelete(entry.date)}
        style={{
          all: 'unset',
          cursor: 'pointer',
          padding: '4px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
        }}
      >
        Delete
      </button>
    </li>
  );
}

export function Bodyweight() {
  const { log, logEntry, deleteEntry } = useBodyweight();
  const { settings } = useSettings();
  const unit = settings.units;

  // Today's seed = last entry's value, so the user is logging deltas
  // not retyping from scratch. Empty input on first ever log.
  const latest = latestEntry(log);
  const initialValue = latest ? String(latest.value) : '';
  const [draft, setDraft] = useState(initialValue);

  const todaysEntry = useMemo(
    () => log.find((e) => e.date === todayIso()) ?? null,
    [log],
  );

  function submit(e) {
    e.preventDefault();
    const v = Number(draft);
    if (!Number.isFinite(v) || v <= 0) return;
    logEntry({ value: v, unit });
  }

  // Recent entries: latest first (reverse the asc-sorted log).
  const recent = useMemo(() => [...log].reverse().slice(0, 30), [log]);

  return (
    <Page>
      <Button as={Link} to="/me" variant="bare" size="sm" style={{ padding: 0 }}>
        ← You
      </Button>

      <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
        You · Bodyweight
      </Text>
      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        Bodyweight
      </Text>
      <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
        One number a day. Not a verdict — a record.
      </Text>

      <BrushDivider style={{ marginTop: 32 }} />

      <Block gapTop={24} eyebrow="Log today">
        <form onSubmit={submit}>
          <Stack direction="row" gap={3} align="center" style={{ flexWrap: 'wrap', rowGap: 12 }}>
            <input
              type="number"
              data-testid="bodyweight-input"
              aria-label="Bodyweight"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              step={unit === 'lb' ? 0.5 : 0.1}
              min={0}
              inputMode="decimal"
              placeholder={latest ? String(latest.value) : (unit === 'lb' ? '180' : '80')}
              style={{
                width: 140,
                padding: '12px 14px',
                background: 'var(--surface-page)',
                border: '1px solid var(--border-strong)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 20,
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <Text as="span" variant="mono-lg" tone="tertiary">{unit}</Text>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!Number.isFinite(Number(draft)) || Number(draft) <= 0}
              data-testid="bodyweight-submit"
            >
              {todaysEntry ? 'Update today' : 'Log'}
            </Button>
          </Stack>
          {todaysEntry && (
            <Text as="p" variant="mono-sm" tone="tertiary" style={{ marginTop: 12, textTransform: 'uppercase' }}>
              Today logged · {todaysEntry.value}{todaysEntry.unit}
            </Text>
          )}
        </form>
      </Block>

      {/* Sparkline block only when there's data. The single empty-state
          line below carries the full empty message. */}
      {log.length >= 2 && (
        <Block gapTop={48} eyebrow="Last 90 days">
          <Sparkline entries={log} unit={unit} />
        </Block>
      )}

      {recent.length > 0 && (
        <Block gapTop={48} eyebrow="Recent">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recent.map((e, i) => (
              <EntryRow
                key={e.date}
                entry={e}
                onDelete={deleteEntry}
                isFirst={i === 0}
              />
            ))}
          </ul>
        </Block>
      )}

      {log.length === 0 && (
        <Block gapTop={32}>
          <Text
            as="p"
            variant="title-md"
            tone="secondary"
            data-testid="bodyweight-empty"
            style={{
              fontStyle: 'italic',
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              opacity: 0.78,
            }}
          >
            Empty log. Step on the scale, type the number, move on.
          </Text>
        </Block>
      )}

      {log.length > 0 && (
        <Block gapTop={48}>
          <Stack direction="row" gap={2}>
            <MonoChipButton
              onClick={() => {
                if (window.confirm('Clear all bodyweight entries? This cannot be undone.')) {
                  // Inline because the action is destructive.
                  log.forEach((e) => deleteEntry(e.date));
                }
              }}
              data-testid="bodyweight-clear"
            >
              Clear all
            </MonoChipButton>
          </Stack>
        </Block>
      )}
    </Page>
  );
}
