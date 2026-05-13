// Home — the cold-open. Wordmark, intro, the four day rooms, the Library
// shortcut. Type-led hierarchy; no neon; one accent per row, used semantically.

import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dayList } from '../data';
import { Page, Block, Text, Stack, BrushDivider } from '../design-system/components';
import { motion as motionTokens, dayLineageAccent } from '../design-system/tokens';
import { useHaptics } from '../hooks/useHaptics';

export function Home() {
  const navigate = useNavigate();
  const haptic = useHaptics();

  return (
    <Page topPad={56}>
      <motion.header
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTokens.base}
      >
        <Text
          as="div"
          variant="mono-sm"
          tone="tertiary"
          style={{ textTransform: 'uppercase', marginBottom: 18 }}
        >
          HDW · A daily practice
        </Text>

        <Text
          as="h1"
          variant="display-lg"
          tone="primary"
          style={{ fontStyle: 'italic', maxWidth: 18 * 16 }}
        >
          A reference for the four rooms of the body.
        </Text>

        <Text
          as="p"
          variant="body-lg"
          tone="secondary"
          style={{ marginTop: 24, maxWidth: 30 * 16 }}
        >
          Push, pull, legs, core. Every movement pattern, every cue, every
          variant. Kept like a notebook. Read on the couch; used on the gym
          floor.
        </Text>
      </motion.header>

      <Block eyebrow="The rooms" gapTop={56}>
        <Stack as="ul" gap={0} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {dayList.map((d, i) => (
            <DayRow
              key={d.key}
              name={d.name}
              subtitle={d.subtitle}
              accent={dayLineageAccent[d.key]}
              first={i === 0}
              onClick={() => {
                haptic('select');
                navigate(`/${d.key}`);
              }}
            />
          ))}
        </Stack>
      </Block>

      <Block eyebrow="Or" gapTop={56}>
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 16 }}>
          Browse by movement pattern instead.
        </Text>
        <LibraryLink onClick={() => { haptic('select'); navigate('/library'); }} />
      </Block>

      <Block gapTop={64}>
        <BrushDivider />
        <Stack direction="row" justify="space-between" align="baseline" style={{ marginTop: 24 }}>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            HDW · A daily practice
          </Text>
          <Text
            as={Link}
            to="/me/about"
            variant="mono-sm"
            tone="tertiary"
            style={{ textTransform: 'uppercase', textDecoration: 'none' }}
          >
            About →
          </Text>
        </Stack>
      </Block>
    </Page>
  );
}

// A single day "room" — quiet hairline-divided row. Accent appears only as
// a 6px square mark to the left of the name, never as a fill.
function DayRow({ name, subtitle, accent, first, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-label={`${name} — ${subtitle}`}
        style={{
          all: 'unset',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'baseline',
          gap: 16,
          width: '100%',
          padding: '20px 0',
          borderTop: first ? 'none' : '1px solid var(--border-hairline)',
          cursor: 'pointer',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            background: `var(--accent-${accent}-solid)`,
            borderRadius: 1,
            transform: 'translateY(-2px)',
          }}
        />
        <span style={{ display: 'block' }}>
          <Text as="div" variant="title-md" tone="primary">
            {name}
          </Text>
          <Text as="div" variant="body-sm" tone="secondary" style={{ marginTop: 4 }}>
            {subtitle}
          </Text>
        </span>
        <Text
          as="span"
          variant="mono-sm"
          tone="tertiary"
          aria-hidden="true"
          style={{ alignSelf: 'center' }}
        >
          →
        </Text>
      </button>
    </li>
  );
}

function LibraryLink({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: 'unset',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        border: '1px solid var(--border-strong)',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-primary)',
      }}
    >
      Open library
      <span aria-hidden="true">→</span>
    </button>
  );
}
