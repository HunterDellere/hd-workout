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
import { prsFromSession } from '../../data/intelligence';
import { voiceFor } from '../../data/voice';

export function SessionSummary({ session, accent, intelligenceEnabled, onDone, onOpenInsights }) {
  const prs = prsFromSession(session);
  const totalSets = session.performances.reduce((n, p) => n + p.sets.length, 0);
  const exerciseCount = session.performances.filter((p) => p.sets.length > 0).length;

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
            {prs.map((pr, i) => {
              const ex = findExerciseById(pr.exerciseId);
              const name = ex?.name ?? pr.exerciseId;
              const kind = pr.kinds.includes('weight') && pr.kinds.includes('reps')
                ? 'Weight + reps'
                : pr.kinds.includes('weight') ? 'Weight' : 'Reps';
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
                  <Text as="span" variant="title-md">{name}</Text>
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
        <Stack direction="row" gap={2}>
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
              to="/insights"
              variant="soft"
              accent={accent}
              size="md"
              onClick={onOpenInsights}
            >
              Insights
            </Button>
          )}
        </Stack>
      </Block>
    </Page>
  );
}
