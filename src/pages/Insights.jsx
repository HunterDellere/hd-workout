// /insights — Phase 3 surface: PR roll-up, weekly volume per pattern,
// frequency heatmap, summary callout, top movements, trend arrows.
// Gated behind settings.intelligenceEnabled.

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
import { useBodyweight } from '../state/bodyweight-context.js';
import { voiceFor } from '../data/voice';
import {
  weeklyVolume,
  frequencyHeatmap,
  prsFromSession,
} from '../data/intelligence';
import {
  sessionStreak,
  topExercises,
  weeklyVolumeDelta,
  patternTrends,
  prsThisMonth,
} from '../data/insights';
import { PATTERNS, PATTERN_BY_KEY } from '../data/patterns';
import { findExerciseAnywhere } from '../data';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function SummaryStat({ label, value, sub, accent }) {
  // accent: 'up' | 'down' | null — tints the value when it's notable.
  const color = accent === 'up' ? 'var(--state-moss-ink, var(--text-primary))'
    : accent === 'down' ? 'var(--state-warn-ink, var(--text-primary))'
    : 'var(--text-primary)';
  return (
    <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 100 }}>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        {label}
      </Text>
      <Text as="div" variant="display-lg" style={{ color, fontStyle: 'normal', fontWeight: 500 }}>
        {value}
      </Text>
      {sub && (
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', opacity: 0.85 }}>
          {sub}
        </Text>
      )}
    </Stack>
  );
}

function BodyweightSpark({ entries, unit }) {
  // 90-day window — same as the dedicated bodyweight page sparkline,
  // here it lives as a small Block above PRs so the user can see if
  // their progress aligns with weight changes.
  if (!entries || entries.length < 2) return null;
  const points = entries
    .filter((e) => e.unit === unit)
    .slice(-30);
  if (points.length < 2) return null;
  const W = 600;
  const H = 60;
  const PAD = 4;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.5, max - min);
  const coords = points.map((p, i) => {
    const x = PAD + (i / (points.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((p.value - min) / range) * (H - PAD * 2);
    return [x, y];
  });
  const path = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.value - first.value;
  const sign = delta >= 0 ? '+' : '';
  return (
    <div data-testid="insights-bw-spark">
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
          stroke="var(--text-secondary)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <Stack direction="row" justify="space-between" align="baseline" style={{ marginTop: 6 }}>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          {first.date} → {last.date}
        </Text>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          {first.value}{unit} → {last.value}{unit} ({sign}{delta.toFixed(1)})
        </Text>
      </Stack>
    </div>
  );
}

function TrendArrow({ direction }) {
  if (direction === 'up') {
    return (
      <Text as="span" variant="mono-sm" style={{ color: 'var(--state-moss-ink, var(--text-primary))', marginLeft: 6 }}>
        ▲
      </Text>
    );
  }
  if (direction === 'down') {
    return (
      <Text as="span" variant="mono-sm" style={{ color: 'var(--state-warn-ink, var(--text-secondary))', marginLeft: 6 }}>
        ▼
      </Text>
    );
  }
  return null;
}

function VolumeRow({ patternKey, weeks, max, trend }) {
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
        <Stack direction="row" align="baseline" gap={1}>
          <Text as="span" variant="title-md">{meta?.label ?? patternKey}</Text>
          {trend && <TrendArrow direction={trend.direction} />}
        </Stack>
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
  // Cap cell size so the heatmap doesn't grow into a 800px+ slab on
  // desktop. The original aspectRatio:1 design ballooned at full-width
  // rendering. 28px per cell × 8 rows ≈ 270px total which reads as a
  // module instead of a screen.
  return (
    <div data-testid="heatmap" style={{ maxWidth: 360 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(7, 28px)',
          gap: 3,
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
            style={{ textAlign: 'center', textTransform: 'uppercase', fontSize: 9 }}
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
      <Text as="span" variant="mono-sm" tone="tertiary" style={{ textAlign: 'right', fontSize: 10 }}>
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
              width: 28,
              height: 28,
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
  const { log: bodyweightLog } = useBodyweight();

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

  const weeklyDelta = useMemo(() => weeklyVolumeDelta(volume), [volume]);
  const trendsByPattern = useMemo(() => patternTrends(volume), [volume]);
  const streak = useMemo(() => sessionStreak(archive), [archive]);
  const top5 = useMemo(() => topExercises(archive, { days: 30, limit: 5 }), [archive]);
  const monthPRs = useMemo(() => prsThisMonth(archive), [archive]);

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

  const hasData = volume.weeks.length > 0 || streak.longest > 0;

  return (
    <Page>
      <Button as={Link} to="/log" variant="bare" size="sm" style={{ padding: 0 }}>
        ← Log
      </Button>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
        Log · Insights
      </Text>
      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        Insights
      </Text>
      <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
        Personal records, weekly volume, and how often you actually show up.
      </Text>
      {!hasData && (
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

      {/* Summary callout: streak, weekly delta, monthly PRs. Reads at a
          glance — "where am I right now?" rather than "what happened?". */}
      {hasData && (
        <Stack
          direction="row"
          gap={5}
          style={{
            marginTop: 32,
            padding: '20px 0',
            borderTop: '1px solid var(--border-hairline)',
            borderBottom: '1px solid var(--border-hairline)',
            flexWrap: 'wrap',
            rowGap: 16,
          }}
          data-testid="insights-summary"
        >
          <SummaryStat
            label="Streak"
            value={streak.current > 0 ? `${streak.current}d` : '—'}
            sub={streak.longest > streak.current
              ? `best · ${streak.longest}d`
              : (streak.current > 0 ? 'best ever' : null)}
          />
          <SummaryStat
            label="This week"
            value={Math.round(weeklyDelta.thisWeek).toLocaleString()}
            sub={(() => {
              if (weeklyDelta.pct === null) return weeklyDelta.thisWeek > 0 ? 'first logged week' : null;
              const sign = weeklyDelta.pct >= 0 ? '+' : '';
              return `${sign}${Math.round(weeklyDelta.pct)}% vs. last`;
            })()}
            accent={weeklyDelta.pct != null && weeklyDelta.pct >= 10 ? 'up'
              : (weeklyDelta.pct != null && weeklyDelta.pct <= -10 ? 'down' : null)}
          />
          <SummaryStat
            label="PRs · month"
            value={monthPRs.length > 0 ? String(monthPRs.length) : '—'}
            sub={monthPRs.length > 0
              ? `${new Set(monthPRs.map((p) => p.perf.exerciseId)).size} exercises`
              : null}
          />
        </Stack>
      )}

      {top5.length > 0 && (
        <Block gapTop={32} eyebrow="Top movements · last 30 days">
          <ol data-testid="top-movements" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {top5.map((entry, i) => {
              const found = findExerciseAnywhere(entry.exerciseId);
              const name = found?.exercise?.name ?? entry.exerciseId;
              return (
                <li
                  key={entry.exerciseId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 12,
                    padding: '10px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                    alignItems: 'baseline',
                  }}
                >
                  <Text as="span" variant="mono-sm" tone="tertiary" style={{ width: 22 }}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Text as="span" variant="title-md">{name}</Text>
                  <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                    {entry.sets} set{entry.sets === 1 ? '' : 's'}
                  </Text>
                </li>
              );
            })}
          </ol>
        </Block>
      )}

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Frequency · last 8 weeks">
        {hydrated ? (
          <Heatmap archive={archive} />
        ) : (
          <Text as="p" variant="body-sm" tone="tertiary">Loading…</Text>
        )}
      </Block>


      {/* Volume block: only renders when there's actual data. The single
          empty-state line near the page top is the only empty message. */}
      {volume.weeks.length > 0 && (
        <Block gapTop={56} eyebrow="Weekly volume · per pattern">
          {PATTERNS.map((p) => (
            <VolumeRow
              key={p.key}
              patternKey={p.key}
              weeks={volume.weeks}
              max={maxAcrossPatterns}
              trend={trendsByPattern[p.key]}
            />
          ))}
        </Block>
      )}

      {bodyweightLog && bodyweightLog.length >= 2 && (
        <Block gapTop={56} eyebrow="Bodyweight · last 30 entries">
          <BodyweightSpark entries={bodyweightLog} unit={settings.units} />
        </Block>
      )}

      {/* Records: also only when there's something to show. */}
      {allPRs.length > 0 && (
        <Block gapTop={56} eyebrow="Records">
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
        </Block>
      )}


      {/* Explainer is reference content, not primary signal. Hide behind a
          disclosure so the page doesn't end on a wall of definitions. */}
      {hasData && (
        <Block gapTop={56}>
          <details
            data-testid="insights-explainer"
            style={{
              borderTop: '1px solid var(--border-hairline)',
              paddingTop: 16,
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                listStyle: 'none',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                userSelect: 'none',
              }}
            >
              How this is computed +
            </summary>
            <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}>
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
          </details>
        </Block>
      )}
    </Page>
  );
}
