// ExerciseArc — the trend view for a single exercise.
//
// Three quiet visualisations stacked vertically:
//   1. Top-set weight sparkline over time. One stroke + dots; PR sessions
//      get a filled accent dot.
//   2. Estimated 1RM line via Epley (reps ≤ 10 only; the spec's reasonable
//      bound). Drawn at 0.5 opacity in the same stroke.
//   3. Per-session volume bars (Σ weight × reps across working sets).
//
// Renders nothing until there are ≥2 sessions for the exercise. Below
// that the strip is enough.

import { useMemo, useState } from 'react';
import { Text, Stack } from '../design-system/components';
import { useSession } from '../state/session-context.js';
import { historyForExercise } from '../data/history';
import { diagnoseStagnation } from '../data/intelligence';

// Epley: 1RM ≈ weight × (1 + reps/30). Reasonable for rep ranges ≤ 10.
function estimateOneRm(weight, reps) {
  if (typeof weight !== 'number' || typeof reps !== 'number') return null;
  if (reps < 1 || reps > 10) return null;
  return weight * (1 + reps / 30);
}

function workingVolume(sets) {
  let total = 0;
  for (const s of sets ?? []) {
    if (s.isWarmup) continue;
    if (typeof s.weight !== 'number' || typeof s.reps !== 'number') continue;
    total += s.weight * s.reps;
  }
  return total;
}

// Light sparkline using inline SVG. Width is responsive; the parent caps it.
function Sparkline({ values, oneRms, prFlags, accent, height = 56 }) {
  if (!values || values.length < 2) return null;
  const allPoints = [...values, ...oneRms.filter((v) => v != null)];
  const min = Math.min(...allPoints);
  const max = Math.max(...allPoints);
  const range = max - min || 1;
  const pad = 4;
  const w = 100;
  const h = height;
  const yFor = (v) => pad + (h - pad * 2) * (1 - (v - min) / range);
  const xFor = (i) => pad + ((w - pad * 2) * i) / (values.length - 1);

  const linePath = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`)
    .join(' ');
  const oneRmPath = oneRms.every((v) => v == null)
    ? null
    : oneRms
      .map((v, i) => (v == null ? null : `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`))
      .filter(Boolean)
      .join(' ');

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Top-set weight over recent sessions"
      style={{ width: '100%', height: h, display: 'block' }}
    >
      {oneRmPath && (
        <path
          d={oneRmPath}
          fill="none"
          stroke={`var(--accent-${accent}-ink)`}
          strokeWidth={0.5}
          strokeDasharray="2 2"
          opacity={0.4}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={`var(--accent-${accent}-ink)`}
        strokeWidth={1.2}
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={xFor(i)}
          cy={yFor(v)}
          r={prFlags[i] ? 1.8 : 1.2}
          fill={prFlags[i] ? `var(--state-pr-ink, var(--accent-${accent}-ink))` : `var(--accent-${accent}-ink)`}
        />
      ))}
    </svg>
  );
}

// Volume bars beneath the sparkline. Same width domain.
function VolumeBars({ values, accent, height = 32 }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 100;
  const h = height;
  const barW = (w - 4) / values.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Working-set volume per session"
      style={{ width: '100%', height: h, display: 'block' }}
    >
      {values.map((v, i) => {
        const barH = (v / max) * (h - 4);
        return (
          <rect
            key={i}
            x={2 + i * barW}
            y={h - 2 - barH}
            width={barW * 0.7}
            height={barH}
            fill={`var(--accent-${accent}-ink)`}
            opacity={0.35}
          />
        );
      })}
    </svg>
  );
}

// Pure span formatter: days → "5d" / "3w" / "4mo".
function spanLabel(days) {
  if (days < 14) return `${days}d`;
  if (days < 90) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

export function ExerciseArc({ exerciseId, accent = 'stone' }) {
  const { archive, hydrated } = useSession();
  // Stable mount timestamp. React 19's purity checker rejects Date.now()
  // in render; useState's lazy initialiser is the sanctioned escape hatch
  // — it runs once on mount, never again.
  const [now] = useState(() => Date.now());
  const data = useMemo(() => {
    const rows = historyForExercise(archive, exerciseId);
    if (rows.length < 2) return null;
    const weights = rows.map((r) => r.top.weight);
    const oneRms = rows.map((r) => estimateOneRm(r.top.weight, r.top.reps));
    const prFlags = rows.map((r) => Boolean(r.top.pr));
    const volumes = rows.map((r) => {
      const session = archive.find((s) => s.id === r.sessionId);
      const perf = session?.performances?.find((p) => p.exerciseId === exerciseId);
      return workingVolume(perf?.sets);
    });
    const heaviest = Math.max(...weights);
    const peak1Rm = Math.max(...oneRms.filter((v) => v != null), 0);
    const totalSessions = rows.length;
    const firstStamp = rows[0].endedAt;
    const days = firstStamp
      ? Math.floor((now - new Date(firstStamp).getTime()) / (24 * 3600 * 1000))
      : null;
    const span = days != null ? spanLabel(days) : null;
    const stagnation = diagnoseStagnation(rows);
    return { weights, oneRms, prFlags, volumes, heaviest, peak1Rm, totalSessions, span, stagnation };
  }, [archive, exerciseId, now]);

  if (!hydrated || !data) return null;

  return (
    <div data-testid="exercise-arc" style={{ marginTop: 16 }}>
      <Stack direction="row" align="baseline" justify="space-between" gap={3}>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Arc · last {data.totalSessions} sessions {data.span ? `· ${data.span}` : ''}
        </Text>
        {data.peak1Rm > 0 && (
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            est 1rm · {Math.round(data.peak1Rm)}
          </Text>
        )}
      </Stack>

      <div style={{ marginTop: 12 }}>
        <Sparkline
          values={data.weights}
          oneRms={data.oneRms}
          prFlags={data.prFlags}
          accent={accent}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <VolumeBars values={data.volumes} accent={accent} />
      </div>

      <Stack direction="row" gap={3} style={{ marginTop: 10 }}>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Heaviest · {data.heaviest}
        </Text>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Volume · bar
        </Text>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Est 1RM · dashed
        </Text>
      </Stack>

      {data.stagnation && (
        <div
          data-testid="stagnation-card"
          style={{
            marginTop: 20,
            padding: '14px 16px',
            border: '1px solid var(--border-hairline)',
            borderLeft: `3px solid var(--state-warn-ink, var(--accent-${accent}-ink))`,
            borderRadius: 4,
            background: 'var(--surface-sunken)',
          }}
        >
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Stalled
          </Text>
          <Text as="p" variant="body-md" tone="primary" style={{ marginTop: 4, fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
            Three sessions at {data.stagnation.weight} for {data.stagnation.reps.join(', ')} reps. Consider a variation, a deload, or a technical reset.
          </Text>
        </div>
      )}
    </div>
  );
}
