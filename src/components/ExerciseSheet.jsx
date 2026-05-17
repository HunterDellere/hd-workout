// ExerciseSheet — full-bleed bottom sheet showing one exercise.
// Content is theme-reactive (v2 primitives + CSS vars only); the outer
// Sheet shell still uses the legacy bridge and is queued for rewrite in
// Session 10 along with the bridge teardown.
//
// Structure, top to bottom:
//   eyebrow (tier label, accent ink)
//   serif name (display-lg, italic)
//   mono close button (top right)
//   sets / rest — two stacked rows of mono-sm eyebrow + mono-lg value
//   brush divider
//   equipment / muscles — body-md with mono-sm eyebrow
//   brush divider
//   cues — numbered, mono index hanging in the gutter, body-lg copy
//   brush divider
//   safety — vermilion-ink eyebrow, body-md, no chrome
//   brush divider
//   variants — VariantList
//   brush divider
//   tags — mono row

import { Sheet } from '../design-system';
import { Stack, Text, BrushDivider } from '../design-system/components';
import { VariantList } from './VariantList';
import { HistoryStrip } from './HistoryStrip';
import { ExerciseArc } from './ExerciseArc';
import { FavoriteStar } from './FavoriteStar';
import { useSession } from '../state/session-context.js';

const TIER_LABEL = {
  S: 'Foundational',
  A: 'Primary alt',
  B: 'Accessory',
  C: 'Accessory',
};

function StatRow({ label, value, accent }) {
  return (
    <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
      <Text
        as="div"
        variant="mono-sm"
        tone="tertiary"
        style={{ textTransform: 'uppercase' }}
      >
        {label}
      </Text>
      <Text
        as="div"
        variant="mono-lg"
        style={{ color: `var(--accent-${accent}-ink)` }}
      >
        {value}
      </Text>
    </Stack>
  );
}

function Eyebrow({ children, accent, color }) {
  return (
    <Text
      as="div"
      variant="mono-sm"
      style={{
        textTransform: 'uppercase',
        color: color ?? (accent ? `var(--accent-${accent}-ink)` : 'var(--text-tertiary)'),
      }}
    >
      {children}
    </Text>
  );
}

function SectionBlock({ children, style }) {
  return <div style={{ marginTop: 28, ...style }}>{children}</div>;
}

function CuesList({ items }) {
  return (
    <ol style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      counterReset: 'cue',
    }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '24px 1fr',
            gap: 12,
            padding: '8px 0',
            borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
          }}
        >
          <Text
            as="span"
            variant="mono-sm"
            tone="tertiary"
            style={{ textTransform: 'uppercase', paddingTop: 4 }}
          >
            {String(i + 1).padStart(2, '0')}
          </Text>
          <Text as="span" variant="body-lg" tone="primary">{item}</Text>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items, tone = 'secondary' }) {
  return (
    <ul style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
    }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            padding: '8px 0',
            borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
          }}
        >
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              marginTop: 10,
              width: 4,
              height: 4,
              borderRadius: 1,
              background: 'var(--state-warn)',
            }}
          />
          <Text as="span" variant="body-md" tone={tone}>{item}</Text>
        </li>
      ))}
    </ul>
  );
}

export function ExerciseSheet({ open, onClose, exercise }) {
  const { activeSession } = useSession();
  if (!exercise) {
    return <Sheet open={open} onClose={onClose} ariaLabel="Exercise detail" />;
  }

  // The legacy callsite passes `accent` as a hex from `accentFor(dayKey)`.
  // The rewritten content takes an accent *token name* — derive it from the
  // exercise's day so theme-reactive CSS vars resolve correctly. Fallback to
  // slate if the day is unknown.
  const DAY_TO_ACCENT = { push: 'rust', pull: 'sea', legs: 'sand', core: 'sky' };
  const accent = DAY_TO_ACCENT[exercise._day] ?? 'stone';
  const tierLabel = TIER_LABEL[exercise.tier] ?? exercise.tier;

  // Wave 6.4: if there's an in-flight performance for this exercise, surface
  // the active session's prescription instead of the catalog's "—". Catalog
  // entries have no sets/rest after the Phase-4 catalog/program split.
  const livePerf = activeSession?.performances?.find((p) => p.exerciseId === exercise.id);
  const liveSets = livePerf?.prescription?.sets;
  const liveRest = livePerf?.prescription?.rest;
  const displaySets = exercise.sets ?? liveSets ?? '—';
  const displayRest = exercise.rest ?? liveRest ?? '—';

  return (
    <Sheet open={open} onClose={onClose} ariaLabel={exercise.name}>
      <div
        style={{
          padding: '20px 24px 96px',
          background: 'var(--surface-page)',
          color: 'var(--text-primary)',
          minHeight: '100%',
        }}
      >
        <Stack direction="row" align="flex-start" justify="space-between" gap={3}>
          <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow accent={accent}>
              Tier {exercise.tier}  ·  {tierLabel}
            </Eyebrow>
            <Text
              as="h2"
              variant="display-lg"
              style={{ marginTop: 8, fontStyle: 'italic' }}
            >
              {exercise.name}
            </Text>
          </Stack>
          <Stack direction="row" gap={2} align="center" style={{ flexShrink: 0 }}>
            <FavoriteStar exerciseId={exercise.id} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: '1px solid var(--border-hairline)',
                color: 'var(--text-secondary)',
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </Stack>
        </Stack>

        <SectionBlock>
          <Stack direction="row" gap={5}>
            <StatRow label="Sets" value={displaySets} accent={accent} />
            <StatRow label="Rest" value={displayRest} accent={accent} />
          </Stack>
        </SectionBlock>

        <BrushDivider style={{ marginTop: 32 }} />
        <SectionBlock style={{ marginTop: 20 }}>
          <Eyebrow>History</Eyebrow>
          <div style={{ marginTop: 12 }}>
            <HistoryStrip exerciseId={exercise.id} accent={accent} />
          </div>
          <ExerciseArc exerciseId={exercise.id} accent={accent} />
        </SectionBlock>

        {(exercise.equipment?.length > 0
          || exercise.primaryMuscles?.length > 0
          || exercise.secondaryMuscles?.length > 0) && (
          <>
            <BrushDivider style={{ marginTop: 32 }} />
            <SectionBlock style={{ marginTop: 20 }}>
              <Stack direction="column" gap={4}>
                {exercise.equipment?.length > 0 && (
                  <Stack direction="column" gap={2}>
                    <Eyebrow>Equipment</Eyebrow>
                    <Text as="p" variant="body-md" tone="primary">
                      {exercise.equipment.join(' · ')}
                    </Text>
                  </Stack>
                )}
                {(exercise.primaryMuscles?.length > 0 || exercise.secondaryMuscles?.length > 0) && (
                  <Stack direction="column" gap={2}>
                    <Eyebrow>Muscles worked</Eyebrow>
                    {exercise.primaryMuscles?.length > 0 && (
                      <Text as="p" variant="body-md" tone="primary">
                        {exercise.primaryMuscles.join(' · ')}
                      </Text>
                    )}
                    {exercise.secondaryMuscles?.length > 0 && (
                      <Text as="p" variant="body-sm" tone="tertiary">
                        Secondary: {exercise.secondaryMuscles.join(' · ')}
                      </Text>
                    )}
                  </Stack>
                )}
              </Stack>
            </SectionBlock>
          </>
        )}

        {exercise.cues?.length > 0 && (
          <>
            <BrushDivider style={{ marginTop: 32 }} />
            <SectionBlock style={{ marginTop: 20 }}>
              <Eyebrow>Technique</Eyebrow>
              <div style={{ marginTop: 12 }}>
                <CuesList items={exercise.cues} />
              </div>
            </SectionBlock>
          </>
        )}

        {exercise.variants?.length > 0 && (
          <>
            <BrushDivider style={{ marginTop: 32 }} />
            <SectionBlock style={{ marginTop: 20 }}>
              <Eyebrow>Variants</Eyebrow>
              <div style={{ marginTop: 8 }}>
                <VariantList variants={exercise.variants} accent={accent} />
              </div>
            </SectionBlock>
          </>
        )}

        {exercise.tags?.length > 0 && (
          <>
            <BrushDivider style={{ marginTop: 32 }} />
            <SectionBlock style={{ marginTop: 20 }}>
              <Eyebrow>Tags</Eyebrow>
              <Text
                as="p"
                variant="mono-sm"
                tone="secondary"
                style={{ marginTop: 8, textTransform: 'uppercase' }}
              >
                {exercise.tags.join('  ·  ')}
              </Text>
            </SectionBlock>
          </>
        )}

        {exercise.safetyNotes?.length > 0 && (
          <>
            <BrushDivider style={{ marginTop: 32 }} />
            <SectionBlock style={{ marginTop: 20 }}>
              <details data-testid="safety-disclosure">
                <summary
                  style={{
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '4px 0',
                    color: 'var(--state-warn-ink)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  <span aria-hidden="true" style={{ display: 'inline-block', width: 10, textAlign: 'center' }}>
                    +
                  </span>
                  Safety notes
                  <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                    ({exercise.safetyNotes.length})
                  </Text>
                </summary>
                <div style={{ marginTop: 12 }}>
                  <BulletList items={exercise.safetyNotes} tone="primary" />
                </div>
              </details>
            </SectionBlock>
          </>
        )}
      </div>
    </Sheet>
  );
}
