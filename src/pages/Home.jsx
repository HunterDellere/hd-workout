// Home — the cold-open. Wordmark, a contextual Today card (the primary
// action), the four day rooms, the Library shortcut. Type-led hierarchy;
// no neon; one accent per row, used semantically.

import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dayList, getDay } from '../data';
import { Page, Block, Text, Stack, BrushDivider, Button } from '../design-system/components';
import { motion as motionTokens, dayLineageAccent } from '../design-system/tokens';
import { useHaptics } from '../hooks/useHaptics';
import { useSettings, dayKeyForToday } from '../state/settings-context.js';
import { useSession } from '../state/session-context.js';

export function Home() {
  const navigate = useNavigate();
  const haptic = useHaptics();
  const { settings } = useSettings();
  const { activeSession } = useSession();

  const todayKey = activeSession?.dayKey ?? dayKeyForToday(settings.split);
  const todayDay = todayKey && todayKey !== 'rest' ? getDay(todayKey) : null;
  const accent = todayKey ? (dayLineageAccent[todayKey] ?? 'stone') : 'stone';

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
          HDW
        </Text>

        <Text
          as="h1"
          variant="display-lg"
          tone="primary"
          style={{ fontStyle: 'italic', maxWidth: 18 * 16 }}
        >
          Your training, written down.
        </Text>

        <Text
          as="p"
          variant="body-lg"
          tone="secondary"
          style={{ marginTop: 24, maxWidth: 30 * 16 }}
        >
          Push, pull, legs, core. A notebook for what you lift, how you lift
          it, and what worked last time.
        </Text>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...motionTokens.base, delay: 0.08 }}
      >
        <TodayCard
          activeSession={activeSession}
          todayKey={todayKey}
          todayName={todayDay?.name ?? null}
          accent={accent}
          onResume={() => { haptic('select'); navigate('/today'); }}
          onStart={() => { haptic('select'); navigate('/today'); }}
        />
      </motion.div>

      <Block eyebrow="Days" gapTop={56}>
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
          Browse by movement.
        </Text>
        <LibraryLink onClick={() => { haptic('select'); navigate('/library'); }} />
      </Block>

      <Block gapTop={64}>
        <BrushDivider />
        <Stack direction="row" justify="space-between" align="baseline" style={{ marginTop: 24, flexWrap: 'wrap', rowGap: 12 }}>
          <Stack direction="row" gap={3} align="baseline">
            <FootLink to="/history" label="← History" />
            {settings.intelligenceEnabled && <FootLink to="/insights" label="Insights" />}
          </Stack>
          <FootLink to="/me/about" label="About →" />
        </Stack>
      </Block>
    </Page>
  );
}

function FootLink({ to, label }) {
  return (
    <Text
      as={Link}
      to={to}
      variant="mono-sm"
      tone="tertiary"
      style={{ textTransform: 'uppercase', textDecoration: 'none' }}
    >
      {label}
    </Text>
  );
}

// The contextual primary action. Three shapes:
//   1. Active session → "Resume {dayName}" with a softer "in progress" eyebrow.
//   2. Today is a training day → "Today is {dayName}" + Start button.
//   3. Today is rest / unmapped → quiet copy nudging the user to the Library.
function TodayCard({ activeSession, todayKey, todayName, accent, onResume, onStart }) {
  const hasSession = !!activeSession;
  const isTraining = todayKey && todayKey !== 'rest' && !!todayName;

  if (hasSession) {
    return (
      <div
        data-testid="home-today-card"
        style={cardStyle(accent)}
      >
        <Stack direction="row" align="baseline" gap={2} style={{ marginBottom: 8 }}>
          <span aria-hidden style={accentSquareStyle(accent)} />
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            In progress
          </Text>
        </Stack>
        <Text as="div" variant="title-lg" style={{ fontStyle: 'italic' }}>
          {todayName ?? 'Session running'}
        </Text>
        <Stack direction="row" gap={3} style={{ marginTop: 20 }}>
          <Button variant="primary" accent={accent} size="md" onClick={onResume} data-testid="home-resume">
            Resume session
          </Button>
        </Stack>
      </div>
    );
  }

  if (isTraining) {
    return (
      <div
        data-testid="home-today-card"
        style={cardStyle(accent)}
      >
        <Stack direction="row" align="baseline" gap={2} style={{ marginBottom: 8 }}>
          <span aria-hidden style={accentSquareStyle(accent)} />
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            Today
          </Text>
        </Stack>
        <Text as="div" variant="title-lg" style={{ fontStyle: 'italic' }}>
          {todayName}
        </Text>
        <Stack direction="row" gap={3} style={{ marginTop: 20 }}>
          <Button variant="primary" accent={accent} size="md" onClick={onStart} data-testid="home-start">
            Open today
          </Button>
        </Stack>
      </div>
    );
  }

  // Rest day or unmapped — quiet card, no big CTA.
  return (
    <div
      data-testid="home-today-card"
      style={cardStyle('stone')}
    >
      <Stack direction="row" align="baseline" gap={2} style={{ marginBottom: 8 }}>
        <span aria-hidden style={accentSquareStyle('stone')} />
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Today · rest
        </Text>
      </Stack>
      <Text as="div" variant="title-lg" style={{ fontStyle: 'italic' }}>
        A day off the floor.
      </Text>
      <Text as="p" variant="body-md" tone="secondary" style={{ marginTop: 16, maxWidth: 28 * 16 }}>
        Browse a movement or read a glossary entry — keeping a hand on the work counts too.
      </Text>
    </div>
  );
}

function cardStyle(accent) {
  // Subtle raised surface, accent-tinted hairline on the left edge.
  return {
    marginTop: 40,
    padding: '24px 24px 28px',
    background: 'var(--surface-raised, var(--surface-page))',
    border: '1px solid var(--border-hairline)',
    borderLeft: `2px solid var(--accent-${accent}-solid)`,
    borderRadius: 8,
    boxShadow: 'var(--shadow-1, 0 1px 0 rgba(0,0,0,0.02))',
  };
}

function accentSquareStyle(accent) {
  return {
    display: 'inline-block',
    width: 8,
    height: 8,
    background: `var(--accent-${accent}-solid)`,
    borderRadius: 1,
    transform: 'translateY(-1px)',
  };
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
