// /me/glossary — plain-language definitions for terms surfacing in the app.
// Notebook colophon shape: term, then a short definition; no examples bloat.
// Lives at /me/glossary; linked from /me and from /me/about as a "What the
// words mean" footnote.

import { Link } from 'react-router-dom';
import {
  Page,
  Block,
  Text,
  Button,
  BrushDivider,
} from '../design-system/components';

const TERMS = [
  {
    term: 'Top set',
    body: 'The heaviest working set you completed for an exercise in a session. The intelligence in this app reads top sets to judge progress — not averages, not totals.',
  },
  {
    term: 'PR (personal record)',
    body: 'A set that exceeds your prior best for an exercise: either a heavier weight than you have ever lifted, or more reps at a weight you have lifted before. A fresh weight is recorded as a weight PR (not a rep PR) to avoid double-stamping.',
  },
  {
    term: 'Volume',
    body: 'Weight × reps, summed across the sets you logged. Most useful per movement pattern per week; rising volume at the same intensity means you are doing more work.',
  },
  {
    term: 'Rep range',
    body: 'The prescribed window for a working set, e.g. "5–8". Aim for the bottom on early sets; finish at the top before adding weight.',
  },
  {
    term: 'Hold',
    body: 'Same weight as last time. Finish the rep range before progressing. The default suggestion when you have not yet cleared the top of the range.',
  },
  {
    term: 'Progress',
    body: 'Add the next increment of weight. Triggered when you cleared the top of the prescribed rep range on your top set.',
  },
  {
    term: 'Deload',
    body: 'Drop the working weight by ~10 % to reset and rebuild. Suggested when you have stalled at the same load for three sessions without rep improvement. One bad day is not a stall.',
  },
  {
    term: 'Stagnation',
    body: 'No rep improvement across three same-weight sessions in a row. The threshold is small enough to catch real plateaus and large enough to ignore noise.',
  },
  {
    term: 'Pattern',
    body: 'A movement family — horizontal press, vertical pull, hip hinge, and so on. Volume in this app is grouped by pattern because that is what governs recovery and balance, not which day of the week you trained.',
  },
  {
    term: 'Increment',
    body: 'The smallest meaningful jump in load. 2.5 kg or 5 lb on a barbell; gym plates make smaller jumps awkward in practice.',
  },
  {
    term: 'RPE',
    body: 'Rate of Perceived Exertion, 1–10. A set at RPE 7 is three reps from failure; RPE 10 is a grind to failure. Tap an RPE chip on a logged set and the next-session suggestion uses it: ≤7 progresses, 8 holds, ≥9 holds or deloads.',
  },
];

export function Glossary() {
  return (
    <Page>
      <Button as={Link} to="/me" variant="bare" size="sm" style={{ padding: 0 }}>
        ← You
      </Button>

      <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
        Glossary
      </Text>
      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        Words
      </Text>
      <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
        Short definitions for the language surfacing in the app. Calibration,
        not jargon.
      </Text>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24}>
        <dl
          data-testid="glossary-list"
          style={{ margin: 0 }}
        >
          {TERMS.map((entry, i) => (
            <div
              key={entry.term}
              data-testid="glossary-entry"
              data-term={entry.term}
              style={{
                padding: '20px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
              }}
            >
              <Text as="dt" variant="title-md">{entry.term}</Text>
              <Text
                as="dd"
                variant="body-md"
                tone="secondary"
                style={{ margin: '6px 0 0', maxWidth: 60 * 9 }}
              >
                {entry.body}
              </Text>
            </div>
          ))}
        </dl>
      </Block>
    </Page>
  );
}
