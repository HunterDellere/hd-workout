// /today — the in-workout session surface.
//
// Resolves today's dayKey from settings.split[weekday]. If no session is
// active, shows the prescribed exercises with a Start button. If a session
// is active, shows each performance with a SetRow + swap affordance + the
// rest timer between sets.

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
} from '../design-system/components';
import { dayLineageAccent } from '../design-system/tokens';
import { getDay, findExerciseAnywhere } from '../data';
import { parsePrescription } from '../data/prescription';
import { lastTopSetForExercise } from '../data/history';
import { REST_DAY, ACTIVE_REST_ACTIVITIES } from '../data/rest';
import { useSettings, dayKeyForToday } from '../state/settings-context.js';
import { useSession, lastLoggedAt } from '../state/session-context.js';
import { SetRow } from '../components/SetRow';
import { RestTimer } from '../components/RestTimer';
import { SubstituteSheet } from '../components/SubstituteSheet';

function PerformanceCard({ performance, accent, unit, restTimerMode, isResting, restStartedAt, restRaw, lastTop, onLogSet, onDiscardSet, onSwap, onStopRest }) {
  const found = findExerciseAnywhere(performance.exerciseId);
  if (!found) return null;
  const ex = found.exercise;
  const prescription = parsePrescription(performance.prescription?.sets ?? ex.sets);
  const hasLogged = performance.sets.length > 0;

  return (
    <div
      data-testid="performance-card"
      data-performance-id={performance.id}
      style={{
        marginTop: 32,
        padding: '20px 0',
        borderTop: '1px solid var(--border-hairline)',
      }}
    >
      <Stack direction="row" align="flex-start" justify="space-between" gap={3}>
        <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            {performance.prescription?.sets ?? ex.sets}
            {performance.prescription?.rest && ` · rest ${performance.prescription.rest}`}
          </Text>
          <Text as="h2" variant="title-lg">
            {ex.name}
          </Text>
          {performance.swappedFromId && (
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              Swapped in this session
            </Text>
          )}
          {lastTop && lastTop.top && (
            <Text
              as="span"
              variant="mono-sm"
              tone="tertiary"
              data-testid="last-time"
              style={{ textTransform: 'uppercase' }}
            >
              Last time · {lastTop.top.weight}{lastTop.top.unit ?? ''} × {lastTop.top.reps}
            </Text>
          )}
        </Stack>
        <button
          type="button"
          onClick={() => onSwap(performance.id)}
          data-testid="swap-button"
          aria-label={`Swap ${ex.name}`}
          style={{
            all: 'unset',
            cursor: 'pointer',
            padding: '6px 12px',
            border: '1px solid var(--border-hairline)',
            borderRadius: 4,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
          }}
        >
          Swap
        </button>
      </Stack>

      <div style={{ marginTop: 20 }}>
        <SetRow
          performance={performance}
          prescription={prescription}
          accent={accent}
          unit={unit}
          onLogSet={(payload) => onLogSet(performance.id, payload)}
          onDiscardSet={(setIdx) => onDiscardSet(performance.id, setIdx)}
        />
      </div>

      {isResting && hasLogged && (
        <div style={{ marginTop: 20 }}>
          <RestTimer
            startedAt={restStartedAt}
            restRaw={restRaw}
            mode={restTimerMode}
            accent={accent}
            onStop={onStopRest}
          />
        </div>
      )}
    </div>
  );
}

export function Today() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const {
    activeSession,
    archive,
    startSession,
    endSession,
    logSet,
    discardSet,
    swapExercise,
    clearRestTimer,
  } = useSession();

  const todayKey = activeSession?.dayKey ?? dayKeyForToday(settings.split);
  const isRest = todayKey === 'rest';
  const day = useMemo(() => (todayKey && !isRest ? getDay(todayKey) : null), [todayKey, isRest]);
  const accent = todayKey ? (dayLineageAccent[todayKey] ?? 'stone') : 'stone';

  const [swapPerformanceId, setSwapPerformanceId] = useState(null);
  const [resumeDismissed, setResumeDismissed] = useState(false);

  const [longGap, setLongGap] = useState(null);
  const referenceTime = activeSession
    ? (lastLoggedAt(activeSession) ?? activeSession.startedAt)
    : null;
  useEffect(() => {
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    function tick() {
      if (!referenceTime) {
        setLongGap((prev) => (prev === null ? prev : null));
        return;
      }
      const ageMs = Date.now() - new Date(referenceTime).getTime();
      if (ageMs < FOUR_HOURS) {
        setLongGap((prev) => (prev === null ? prev : null));
        return;
      }
      const hours = Math.floor(ageMs / (60 * 60 * 1000));
      setLongGap((prev) => (prev && prev.hours === hours ? prev : { hours }));
    }
    const id = setTimeout(tick, 0);
    const tickId = setInterval(tick, 60_000);
    return () => { clearTimeout(id); clearInterval(tickId); };
  }, [referenceTime]);

  const swapPerformance = swapPerformanceId
    ? activeSession?.performances.find((p) => p.id === swapPerformanceId)
    : null;

  if (isRest) {
    return (
      <Page>
        <Stack direction="row" align="center" gap={2}>
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              background: 'var(--accent-stone-solid)',
              borderRadius: 1,
            }}
          />
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            Today · rest
          </Text>
        </Stack>
        <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
          {REST_DAY.name}
        </Text>
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
          {REST_DAY.description}
        </Text>

        <BrushDivider style={{ marginTop: 40 }} />

        <Block gapTop={24} eyebrow="Active rest" headingVariant="title-lg">
          <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 16, maxWidth: 60 * 9 }}>
            If you want to move. None of this is required.
          </Text>
          <ul
            data-testid="active-rest-list"
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
          >
            {ACTIVE_REST_ACTIVITIES.map((a, i) => (
              <li
                key={a.key}
                data-activity-key={a.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 16,
                  padding: '16px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                  alignItems: 'baseline',
                }}
              >
                <Text as="span" variant="mono-sm" tone="tertiary" style={{ width: 24, textTransform: 'uppercase' }}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Stack direction="column" gap={1}>
                  <Text as="span" variant="title-md">{a.name}</Text>
                  <Text as="span" variant="body-sm" tone="secondary">{a.detail}</Text>
                </Stack>
              </li>
            ))}
          </ul>
        </Block>

        <Block gapTop={48}>
          <BrushDivider />
          <Text as="p" variant="body-sm" tone="tertiary" style={{ marginTop: 24 }}>
            Edit your week in <Link to="/me/settings" style={{ color: 'inherit', textDecoration: 'underline' }}>settings</Link>.
          </Text>
        </Block>
      </Page>
    );
  }

  if (!day) {
    return (
      <Page>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Today
        </Text>
        <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
          No day scheduled
        </Text>
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16 }}>
          The current weekday has no day assigned in your split.
        </Text>
        <BrushDivider style={{ marginTop: 32 }} />
        <div style={{ marginTop: 24 }}>
          <Button as={Link} to="/me/settings" variant="soft" accent="stone" size="md">
            Edit your split
          </Button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <Stack direction="row" align="center" gap={2}>
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
          Today · {day.key}
        </Text>
      </Stack>
      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        {day.name}
      </Text>
      <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
        {day.description}
      </Text>

      <BrushDivider style={{ marginTop: 40 }} />

      {!activeSession ? (
        <Block gapTop={24}>
          <Stack direction="column" gap={4}>
            <Text as="p" variant="body-lg" tone="secondary">
              {day.sections.reduce((n, s) => n + s.exercises.length, 0)} exercises, {day.sections.length} sections.
            </Text>
            <div>
              <Button
                variant="primary"
                accent={accent}
                size="lg"
                onClick={() => startSession(day)}
                data-testid="start-session"
              >
                Start session
              </Button>
            </div>
            <BrushDivider />
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {day.sections.flatMap((section) =>
                section.exercises.map((ex, i) => (
                  <li
                    key={ex.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      padding: '12px 0',
                      borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                    }}
                  >
                    <Text as="span" variant="body-lg" style={{ flex: 1 }}>
                      {ex.name}
                    </Text>
                    <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                      {ex.sets}
                    </Text>
                  </li>
                ))
              )}
            </ul>
          </Stack>
        </Block>
      ) : (
        <>
          {longGap && !resumeDismissed && (
            <div
              data-testid="resume-prompt"
              style={{
                marginTop: 24,
                padding: 16,
                border: '1px solid var(--border-strong)',
                borderRadius: 6,
                background: 'var(--surface-sunken)',
              }}
            >
              <Text as="p" variant="body-md" tone="primary">
                {longGap.hours >= 1 ? `${longGap.hours}h` : 'a while'} since your last set.
                Continue this session or end it now?
              </Text>
              <Stack direction="row" gap={2} style={{ marginTop: 12 }}>
                <Button
                  variant="soft"
                  accent={accent}
                  size="sm"
                  data-testid="resume-continue"
                  onClick={() => setResumeDismissed(true)}
                >
                  Continue
                </Button>
                <Button
                  variant="bare"
                  size="sm"
                  data-testid="resume-end"
                  onClick={() => {
                    endSession();
                    navigate('/');
                  }}
                >
                  End now
                </Button>
              </Stack>
            </div>
          )}
          {activeSession.performances.map((perf) => (
            <PerformanceCard
              key={perf.id}
              performance={perf}
              accent={accent}
              unit={settings.units}
              restTimerMode={settings.restTimerMode}
              isResting={activeSession.restPerformanceId === perf.id}
              restStartedAt={activeSession.restStartedAt}
              restRaw={perf.prescription?.rest}
              lastTop={lastTopSetForExercise(archive, perf.exerciseId)}
              onLogSet={logSet}
              onDiscardSet={discardSet}
              onSwap={setSwapPerformanceId}
              onStopRest={clearRestTimer}
            />
          ))}

          <Block gapTop={48}>
            <BrushDivider />
            <Stack direction="row" justify="space-between" align="center" gap={3} style={{ marginTop: 24 }}>
              <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                {activeSession.performances.reduce((n, p) => n + p.sets.length, 0)} sets logged
              </Text>
              <Button
                variant="soft"
                accent={accent}
                size="md"
                data-testid="end-session"
                onClick={() => {
                  endSession();
                  navigate('/');
                }}
              >
                End session
              </Button>
            </Stack>
          </Block>
        </>
      )}

      <SubstituteSheet
        open={Boolean(swapPerformance)}
        onClose={() => setSwapPerformanceId(null)}
        currentExerciseId={swapPerformance?.exerciseId}
        hasLoggedSets={swapPerformance ? swapPerformance.sets.length > 0 : false}
        onPick={(newId) => {
          if (swapPerformance) swapExercise(swapPerformance.id, newId);
          setSwapPerformanceId(null);
        }}
      />
    </Page>
  );
}
