// /:dayKey — one day's program. Sections list, each with its exercises.
// Rewritten Session 10: off the legacy bridge, on Page/Block, calm chrome.

import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getDay } from '../data';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
} from '../design-system/components';
import { dayLineageAccent, space as spaceScale } from '../design-system/tokens';
import { ExerciseCardV2 } from '../components/ExerciseCardV2';
import { useHaptics } from '../hooks/useHaptics';

// Wave 4.2 #14: role="tab" without role="tabpanel" was an a11y dead end —
// SR users heard "tab selected" with no corresponding panel to switch to.
// This is an in-page anchor nav now: a <nav> of <button> elements
// (button-styled-as-link to preserve the smooth scroll behaviour and
// haptic). The scrollspy intent is preserved by data-active.
function SectionNav({ sections, activeKey, onPick, accent }) {
  return (
    <nav
      aria-label="Sections in this day"
      style={{
        display: 'flex',
        gap: spaceScale[4],
        overflowX: 'auto',
        scrollbarWidth: 'none',
        paddingBottom: 8,
        marginTop: 4,
        borderBottom: '1px solid var(--border-hairline)',
      }}
    >
      {sections.map((s) => {
        const active = s.key === activeKey;
        const label = (s.title.split(' — ')[1] || s.title).trim();
        return (
          <button
            key={s.key}
            type="button"
            data-section-anchor={s.key}
            data-active={active ? '1' : '0'}
            aria-current={active ? 'true' : undefined}
            onClick={() => onPick(s.key)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              padding: '8px 0',
              borderBottom: active
                ? `1.5px solid var(--accent-${accent}-ink)`
                : '1.5px solid transparent',
              marginBottom: -1,
              color: active
                ? `var(--accent-${accent}-ink)`
                : 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: active ? 600 : 500,
              whiteSpace: 'nowrap',
              transition: 'color 120ms ease, border-color 120ms ease',
            }}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export function Day() {
  const { dayKey } = useParams();
  const navigate = useNavigate();
  const haptic = useHaptics();
  const day = useMemo(() => getDay(dayKey), [dayKey]);

  const [prevDayKey, setPrevDayKey] = useState(dayKey);
  const [activeKey, setActiveKey] = useState(day?.sections?.[0]?.key ?? null);
  const sectionRefs = useRef({});
  if (dayKey !== prevDayKey) {
    setPrevDayKey(dayKey);
    setActiveKey(day?.sections?.[0]?.key ?? null);
  }

  if (!day) {
    return (
      <Page>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Not found
        </Text>
        <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
          Unknown day
        </Text>
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16 }}>
          No day called <code style={{ fontFamily: 'var(--font-mono)' }}>{dayKey}</code> exists.
          The four rooms are push, pull, legs, and core.
        </Text>
        <BrushDivider style={{ marginTop: 32 }} />
        <div style={{ marginTop: 24 }}>
          <Button as={Link} to="/library" variant="soft" accent="stone" size="md">
            Back to library
          </Button>
        </div>
      </Page>
    );
  }

  const accent = dayLineageAccent[day.key] ?? 'stone';

  function scrollToSection(key) {
    const el = sectionRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveKey(key);
      haptic('light');
    }
  }

  return (
    <Page>
      <Button as={Link} to="/library" variant="bare" size="sm" style={{ padding: 0 }}>
        ← Library
      </Button>

      <Stack direction="row" align="center" gap={2} style={{ marginTop: 24 }}>
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            background: `var(--accent-${accent}-solid)`,
            borderRadius: 1,
          }}
        />
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Day · {day.key}
        </Text>
      </Stack>

      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        {day.name}
      </Text>
      {day.description && (
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
          {day.description}
        </Text>
      )}

      <div style={{ marginTop: 32, position: 'sticky', top: 0, background: 'var(--surface-page)', zIndex: 1 }}>
        <SectionNav
          sections={day.sections}
          activeKey={activeKey}
          onPick={scrollToSection}
          accent={accent}
        />
      </div>

      {day.sections.map((section, sectionIndex) => {
        const sectionTitle = (section.title.split(' — ')[1] || section.title).trim();
        return (
          <section
            key={section.key}
            ref={(el) => { sectionRefs.current[section.key] = el; }}
            style={{
              marginTop: sectionIndex === 0 ? 40 : 56,
              scrollMarginTop: 64,
            }}
          >
            <Stack direction="row" align="flex-start" justify="space-between" gap={3}>
              <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
                <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                  Section
                </Text>
                <Text as="h2" variant="title-lg">
                  {sectionTitle}
                </Text>
                {section.blurb && (
                  <Text as="p" variant="body-md" tone="secondary" style={{ marginTop: 4 }}>
                    {section.blurb}
                  </Text>
                )}
              </Stack>
              {section.mandatory && (
                <Text
                  as="span"
                  variant="mono-sm"
                  style={{
                    textTransform: 'uppercase',
                    color: 'var(--state-warn-ink)',
                    paddingTop: 4,
                  }}
                >
                  Mandatory
                </Text>
              )}
            </Stack>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: spaceScale[2] }}>
              {section.exercises.map((ex, i) => (
                <ExerciseCardV2
                  key={ex.id}
                  exercise={ex}
                  dayKey={day.key}
                  index={i}
                  onOpen={() => {
                    haptic('select');
                    navigate(`/library/exercises/${ex.id}`);
                  }}
                />
              ))}
            </div>
          </section>
        );
      })}

      <Block gapTop={64}>
        <BrushDivider />
      </Block>
    </Page>
  );
}
