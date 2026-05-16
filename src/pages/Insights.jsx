// /insights — Phase 3 surface: PR roll-up, weekly volume per pattern,
// frequency heatmap. Gated behind settings.intelligenceEnabled.

import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
} from '../design-system/components';
import { useSettings } from '../state/settings-context.js';
import { useSession } from '../state/session-context.js';
import { voiceFor } from '../data/voice';
import {
  weeklyVolume,
  frequencyHeatmap,
  prsFromSession,
} from '../data/intelligence';
import { PATTERNS, PATTERN_BY_KEY } from '../data/patterns';
import { findExerciseAnywhere } from '../data';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function VolumeRow({ patternKey, weeks, max }) {
  const meta = PATTERN_BY_KEY[patternKey];
  const series = weeks.map((w) => w.perPattern[patternKey] ?? 0);
  const total = series.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  return (
    <div
      data-testid="volume-row"
      data-pattern={patternKey}
      style={{
        padding: '14px 0',
        borderTop: '1px solid var(--border-hairline)',
      }}
    >
      <Stack direction="row" align="baseline" justify="space-between" gap={2}>
        <Text as="span" variant="title-md">{meta?.label ?? patternKey}</Text>
        <Text as="span" variant="mono-sm" tone="tertiary">
          {Math.round(total).toLocaleString()} tot
        </Text>
      </Stack>
      <div
        aria-hidden
        style={{
          marginTop: 10,
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
          gap: 3,
          alignItems: 'end',
          height: 56,
        }}
      >
        {series.map((v, i) => {
          const ratio = max > 0 ? v / max : 0;
          return (
            <div
              key={i}
              title={`${weeks[i].label}: ${Math.round(v)}`}
              style={{
                height: `${Math.max(2, ratio * 100)}%`,
                background: v > 0 ? 'var(--text-primary)' : 'var(--border-hairline)',
                borderRadius: 1,
                opacity: v > 0 ? 1 : 0.4,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function Heatmap({ archive }) {
  const { weeks, grid, max } = useMemo(
    () => frequencyHeatmap(archive, { weeks: 8 }),
    [archive],
  );
  return (
    <div data-testid="heatmap">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(7, 1fr)',
          gap: 4,
          alignItems: 'center',
        }}
      >
        <div />
        {WEEKDAY_LABELS.map((d, i) => (
          <Text
            key={i}
            as="span"
            variant="mono-sm"
            tone="tertiary"
            style={{ textAlign: 'center', textTransform: 'uppercase' }}
          >
            {d}
          </Text>
        ))}
        {grid.map((row, ri) => (
          <ReactRow
            key={weeks[ri]}
            label={weeks[ri].slice(5)}
            counts={row}
            max={max}
          />
        ))}
      </div>
    </div>
  );
}

function ReactRow({ label, counts, max }) {
  return (
    <>
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ textAlign: 'right' }}>
        {label}
      </Text>
      {counts.map((c, ci) => {
        const ratio = max > 0 ? c / max : 0;
        return (
          <div
            key={ci}
            data-count={c}
            aria-label={`${c} sessions`}
            style={{
              aspectRatio: '1 / 1',
              borderRadius: 2,
              background: c > 0 ? 'var(--text-primary)' : 'var(--surface-sunken)',
              opacity: c > 0 ? Math.max(0.35, ratio) : 1,
            }}
          />
        );
      })}
    </>
  );
}

export function Insights() {
  const { settings } = useSettings();
  const { archive, hydrated } = useSession();

  const volume = useMemo(() => weeklyVolume(archive), [archive]);
  const maxAcrossPatterns = useMemo(() => {
    let m = 0;
    for (const w of volume.weeks) {
      for (const v of Object.values(w.perPattern)) {
        if (v > m) m = v;
      }
    }
    return m;
  }, [volume]);

  // PR roll-up across all archived sessions.
  const allPRs = useMemo(() => {
    const out = [];
    for (const session of archive) {
      const prs = prsFromSession(session);
      for (const pr of prs) {
        out.push({ session, ...pr });
      }
    }
    return out.sort((a, b) => (
      (b.session.endedAt ?? '').localeCompare(a.session.endedAt ?? '')
    ));
  }, [archive]);

  if (!settings.intelligenceEnabled) {
    return <Navigate to="/me" replace />;
  }

  return (
    <Page>
      <Button as={Link} to="/me" variant="bare" size="sm" style={{ padding: 0 }}>
        ← You
      </Button>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
        Insights
      </Text>
      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        Insights
      </Text>
      <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
        Personal records, weekly volume, and how often you actually show up.
      </Text>
      {volume.weeks.length === 0 && (
        <Text
          as="p"
          variant="title-md"
          tone="secondary"
          style={{
            marginTop: 28,
            fontStyle: 'italic',
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            opacity: 0.78,
            maxWidth: 60 * 9,
          }}
        >
          {voiceFor('insights-empty') ?? 'Numbers want sets. Log a few and the picture sharpens.'}
        </Text>
      )}

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Frequency · last 8 weeks">
        {hydrated ? (
          <Heatmap archive={archive} />
        ) : (
          <Text as="p" variant="body-sm" tone="tertiary">Loading…</Text>
        )}
      </Block>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Weekly volume · per pattern">
        {volume.weeks.length === 0 ? (
          <Text as="p" variant="body-md" tone="secondary">
            No archive yet. End a session with logged sets and the bars start rendering.
          </Text>
        ) : (
          <>
            <Text as="p" variant="body-sm" tone="tertiary" style={{ marginBottom: 16 }}>
              Σ weight × reps. Split evenly across patterns when an exercise is in more than one.
            </Text>
            {PATTERNS.map((p) => (
              <VolumeRow
                key={p.key}
                patternKey={p.key}
                weeks={volume.weeks}
                max={maxAcrossPatterns}
              />
            ))}
          </>
        )}
      </Block>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Records">
        {allPRs.length === 0 ? (
          <Text as="p" variant="body-md" tone="secondary">
            No PRs logged yet. They’ll surface here after the first record-breaking set lands in the archive.
          </Text>
        ) : (
          <ul data-testid="pr-rollup" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {allPRs.map((pr, i) => {
              const found = findExerciseAnywhere(pr.exerciseId);
              const name = found?.exercise?.name ?? pr.exerciseId;
              const kind = pr.kinds.includes('weight') && pr.kinds.includes('reps')
                ? 'Weight + reps'
                : pr.kinds.includes('weight') ? 'Weight' : 'Reps';
              const date = (pr.session.endedAt ?? '').slice(0, 10);
              return (
                <li
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 12,
                    padding: '10px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                    alignItems: 'baseline',
                  }}
                >
                  <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                    {date}
                  </Text>
                  <Stack direction="column" gap={1}>
                    <Text as="span" variant="title-md">{name}</Text>
                    <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                      {kind}
                    </Text>
                  </Stack>
                  <Text as="span" variant="mono-lg">
                    {pr.set.weight}{pr.set.unit ?? ''} × {pr.set.reps}
                  </Text>
                </li>
              );
            })}
          </ul>
        )}
      </Block>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="How this is computed">
        <ul
          data-testid="insights-explainer"
          style={{ listStyle: 'none', padding: 0, margin: 0 }}
        >
          {[
            ['Records', 'A set breaks a record when its weight exceeds your prior heaviest at this exercise, or its reps exceed your prior best at the same weight.'],
            ['Volume', 'Σ (weight × reps) across logged sets. When an exercise belongs to two movement patterns, its volume is split evenly between them.'],
            ['Frequency', 'One mark per completed session, placed on the day it ended. Last 8 weeks.'],
            ['Suggestions', 'Cleared the top of the rep range last session → bump weight. Mid-range → hold. Three sessions at the same load with no improvement → deload 10%.'],
          ].map(([title, body], i) => (
            <li
              key={title}
              style={{
                padding: '12px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
              }}
            >
              <Text
                as="div"
                variant="mono-sm"
                tone="tertiary"
                style={{ textTransform: 'uppercase' }}
              >
                {title}
              </Text>
              <Text as="p" variant="body-sm" tone="secondary" style={{ marginTop: 6, maxWidth: 60 * 9 }}>
                {body}
              </Text>
            </li>
          ))}
        </ul>
      </Block>
    </Page>
  );
}
