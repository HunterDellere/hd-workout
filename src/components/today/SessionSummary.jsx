// SessionSummary — the post-end "PR day" / "Logged." surface.
// Renders the PR roll-up if any, otherwise a quiet "no records, volume
// is its own progress" note. Done returns to Home; Insights link surfaces
// when intelligence is enabled.

import { Link } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
} from '../../design-system/components';
import { findExerciseById } from '../../data';
import { prsFromSession, gapSincePreviousPR } from '../../data/intelligence';
import { voiceFor } from '../../data/voice';
import { useSession } from '../../state/session-context.js';

const MS_DAY = 24 * 60 * 60 * 1000;

function gapLabel(ms) {
  if (ms == null) return null;
  const days = Math.floor(ms / MS_DAY);
  if (days < 7) return null; // <1w isn't notable
  if (days < 14) return 'Heaviest in over a week';
  if (days < 60) return `Heaviest in ${Math.round(days / 7)}w`;
  return `Heaviest in ${Math.round(days / 30)}mo`;
}

export function SessionSummary({
  session,
  accent,
  intelligenceEnabled,
  onDone,
  onOpenInsights,
  onResume,
}) {
  const { archive } = useSession();
  const prs = prsFromSession(session);
  const totalSets = session.performances.reduce((n, p) => n + p.sets.length, 0);
  const exerciseCount = session.performances.filter((p) => p.sets.length > 0).length;
  // Wave 6.3b: enrich each PR with how long since the last PR for the
  // same exercise. The archive at this point already includes the
  // current session, so we use the session's start as the "before" cutoff.
  const sessionStart = session.startedAt ?? new Date().toISOString();
  const prsWithGap = prs.map((pr) => ({
    ...pr,
    gapMs: gapSincePreviousPR(archive, pr.exerciseId, sessionStart),
  }));

  return (
    <Page>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
        Session complete
      </Text>
      <Text
        as="h1"
        variant="display-lg"
        style={{
          marginTop: 8,
          fontStyle: 'italic',
          color: prs.length > 0 ? 'var(--state-pr-ink, var(--text-primary))' : undefined,
        }}
      >
        {prs.length > 0 ? 'PR day.' : 'Logged.'}
      </Text>
      <Text
        as="p"
        variant="title-md"
        tone="secondary"
        style={{
          marginTop: 12,
          fontStyle: 'italic',
          fontFamily: 'var(--font-serif)',
          fontWeight: 300,
          opacity: 0.78,
        }}
      >
        {voiceFor(prs.length > 0 ? 'session-end-pr' : 'session-end-plain', session.id)}
      </Text>
      <Text
        as="p"
        variant="body-md"
        tone="tertiary"
        style={{
          marginTop: 16,
          maxWidth: 60 * 9,
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
        }}
      >
        {totalSets} sets · {exerciseCount} exercises
      </Text>
      <BrushDivider style={{ marginTop: 32 }} />
      {prs.length > 0 ? (
        <Block gapTop={24} eyebrow="Personal records">
          <ul data-testid="pr-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {prsWithGap.map((pr, i) => {
              const ex = findExerciseById(pr.exerciseId);
              const name = ex?.name ?? pr.exerciseId;
              const kind = pr.kinds.includes('weight') && pr.kinds.includes('reps')
                ? 'Weight + reps'
                : pr.kinds.includes('weight') ? 'Weight' : 'Reps';
              const gap = gapLabel(pr.gapMs);
              return (
                <li
                  key={i}
                  data-testid="pr-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 16,
                    padding: '12px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                    alignItems: 'baseline',
                  }}
                >
                  <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                    {kind}
                  </Text>
                  <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <Text as="span" variant="title-md">{name}</Text>
                    {gap && (
                      <Text
                        as="span"
                        variant="mono-sm"
                        data-testid="pr-gap"
                        style={{
                          marginTop: 2,
                          textTransform: 'uppercase',
                          letterSpacing: '0.10em',
                          color: 'var(--state-pr-ink, var(--text-secondary))',
                          opacity: 0.85,
                        }}
                      >
                        {gap}
                      </Text>
                    )}
                  </span>
                  <Text as="span" variant="mono-lg" style={{ color: 'var(--state-pr-ink, var(--text-primary))' }}>
                    {pr.set.weight}{pr.set.unit ?? ''} × {pr.set.reps}
                  </Text>
                </li>
              );
            })}
          </ul>
        </Block>
      ) : (
        <Block gapTop={24}>
          <Text as="p" variant="body-md" tone="secondary">
            No new records this time. Stacking volume is its own kind of progress.
          </Text>
        </Block>
      )}
      <Block gapTop={32}>
        <Stack direction="row" gap={2} style={{ flexWrap: 'wrap', rowGap: 8 }}>
          <Button
            variant="primary"
            accent={accent}
            size="md"
            data-testid="summary-done"
            onClick={onDone}
          >
            Done
          </Button>
          {intelligenceEnabled && (
            <Button
              as={Link}
              to="/log/insights"
              variant="soft"
              accent={accent}
              size="md"
              onClick={onOpenInsights}
            >
              Insights
            </Button>
          )}
          {onResume && (
            <Button
              variant="bare"
              size="md"
              data-testid="summary-resume"
              onClick={onResume}
              style={{ padding: 0 }}
            >
              Resume this session
            </Button>
          )}
        </Stack>
        <Text
          as="p"
          variant="body-sm"
          tone="tertiary"
          style={{ marginTop: 12, maxWidth: 60 * 9 }}
        >
          Tapped end by accident? Resume re-opens the session for more sets.
        </Text>
      </Block>
    </Page>
  );
}
