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
import { historyForExercise, lastTopSetForExercise } from '../data/history';
import { prsFromSession, suggestNextLoad } from '../data/intelligence';
import { REST_DAY, ACTIVE_REST_ACTIVITIES } from '../data/rest';
import { useSettings, dayKeyForToday } from '../state/settings-context.js';
import { useSession, lastLoggedAt } from '../state/session-context.js';
import { SetRow } from '../components/SetRow';
import { RestTimer } from '../components/RestTimer';
import { SubstituteSheet } from '../components/SubstituteSheet';
import { SlotPicker } from '../components/SlotPicker';

function suggestionLine(suggestion, unit) {
  if (!suggestion) return null;
  switch (suggestion.kind) {
    case 'progress':
      return `Try ${suggestion.weight}${unit} × ${suggestion.reps} · +${suggestion.increment}${unit}`;
    case 'hold':
      return suggestion.reason
        ? `Hold ${suggestion.weight}${unit} × ${suggestion.reps} · ${suggestion.reason}`
        : `Hold ${suggestion.weight}${unit} × ${suggestion.reps}`;
    case 'deload':
      return `Deload to ${suggestion.weight}${unit} · ${suggestion.reason}`;
    default:
      return null;
  }
}

function PerformanceCard({ performance, accent, unit, restTimerMode, isResting, restStartedAt, restRaw, lastTop, suggestion, onLogSet, onDiscardSet, onSwap, onStopRest, onRemove }) {
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
          {suggestionLine(suggestion, unit) && (
            <Text
              as="span"
              variant="mono-sm"
              data-testid="suggestion-line"
              data-suggestion-kind={suggestion.kind}
              style={{
                textTransform: 'uppercase',
                color: suggestion.kind === 'deload'
                  ? 'var(--state-warn-ink)'
                  : `var(--accent-${accent}-ink)`,
              }}
            >
              {suggestionLine(suggestion, unit)}
            </Text>
          )}
        </Stack>
        <Stack direction="row" gap={2} align="center">
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
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              data-testid="remove-performance"
              aria-label={`Remove ${ex.name}`}
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
              Remove
            </button>
          )}
        </Stack>
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
    addPerformance,
    removePerformance,
    clearRestTimer,
  } = useSession();

  const todayKey = activeSession?.dayKey ?? dayKeyForToday(settings.split);
  const isRest = todayKey === 'rest';
  const day = useMemo(() => (todayKey && !isRest ? getDay(todayKey) : null), [todayKey, isRest]);
  const accent = todayKey ? (dayLineageAccent[todayKey] ?? 'stone') : 'stone';

  const [swapPerformanceId, setSwapPerformanceId] = useState(null);
  const [pickerSectionKey, setPickerSectionKey] = useState(null);
  const [resumeDismissed, setResumeDismissed] = useState(false);
  const [endedSummary, setEndedSummary] = useState(null);

  // Group active-session performances by their original section. Preserves
  // the encounter order of section keys so the warmup/main/finisher
  // progression authored in the catalog reads top-to-bottom.
  const performancesBySection = useMemo(() => {
    if (!activeSession) return [];
    const order = [];
    const map = new Map();
    for (const perf of activeSession.performances) {
      if (!map.has(perf.sectionKey)) {
        map.set(perf.sectionKey, []);
        order.push(perf.sectionKey);
      }
      map.get(perf.sectionKey).push(perf);
    }
    return order.map((key) => ({ key, performances: map.get(key) }));
  }, [activeSession]);

  function sectionMeta(sectionKey) {
    if (!day) return { title: sectionKey, blurb: null };
    const found = day.sections.find((s) => s.key === sectionKey);
    return { title: found?.title ?? sectionKey, blurb: found?.blurb ?? null };
  }


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

  if (endedSummary) {
    const prs = prsFromSession(endedSummary);
    const totalSets = endedSummary.performances.reduce((n, p) => n + p.sets.length, 0);
    return (
      <Page>
        <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Session complete
        </Text>
        <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
          {prs.length > 0 ? 'PR day.' : 'Logged.'}
        </Text>
        <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
          {totalSets} sets across {endedSummary.performances.filter((p) => p.sets.length > 0).length} exercises.
        </Text>
        <BrushDivider style={{ marginTop: 32 }} />
        {prs.length > 0 ? (
          <Block gapTop={24} eyebrow="Personal records">
            <ul data-testid="pr-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {prs.map((pr, i) => {
                const found = findExerciseAnywhere(pr.exerciseId);
                const name = found?.exercise?.name ?? pr.exerciseId;
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
                    <Text as="span" variant="mono-lg" style={{ color: `var(--accent-${accent}-ink)` }}>
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
              onClick={() => { setEndedSummary(null); navigate('/'); }}
            >
              Done
            </Button>
            {settings.intelligenceEnabled && (
              <Button
                as={Link}
                to="/insights"
                variant="soft"
                accent={accent}
                size="md"
                onClick={() => setEndedSummary(null)}
              >
                Insights
              </Button>
            )}
          </Stack>
        </Block>
      </Page>
    );
  }

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
            <div>
              {day.sections.map((section) => (
                <div key={section.key} data-testid="preview-section" style={{ marginTop: 24 }}>
                  <Stack direction="row" align="baseline" justify="space-between" gap={2}>
                    <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                      {section.title}
                    </Text>
                    <Text as="div" variant="mono-sm" tone="tertiary">
                      {section.exercises.length}
                    </Text>
                  </Stack>
                  {section.blurb && (
                    <Text as="p" variant="body-sm" tone="secondary" style={{ marginTop: 8, maxWidth: 60 * 9 }}>
                      {section.blurb}
                    </Text>
                  )}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
                    {section.exercises.map((ex, i) => (
                      <li
                        key={ex.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 16,
                          padding: '10px 0',
                          borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                        }}
                      >
                        <Text as="span" variant="body-md" style={{ flex: 1 }}>
                          {ex.name}
                        </Text>
                        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                          {ex.sets}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
          {performancesBySection.map(({ key: sectionKey, performances }) => {
            const meta = sectionMeta(sectionKey);
            return (
              <section
                key={sectionKey}
                data-testid="section-group"
                data-section-key={sectionKey}
                style={{ marginTop: 40 }}
              >
                <Stack direction="row" align="baseline" justify="space-between" gap={2}>
                  <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                    {meta.title}
                  </Text>
                  <Text as="div" variant="mono-sm" tone="tertiary">
                    {performances.length}
                  </Text>
                </Stack>
                {meta.blurb && (
                  <Text as="p" variant="body-sm" tone="secondary" style={{ marginTop: 8, maxWidth: 60 * 9 }}>
                    {meta.blurb}
                  </Text>
                )}
                {performances.map((perf) => (
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
                    suggestion={settings.intelligenceEnabled
                      ? suggestNextLoad(
                        historyForExercise(archive, perf.exerciseId),
                        parsePrescription(perf.prescription?.sets ?? ''),
                        settings.units,
                      )
                      : null}
                    onLogSet={logSet}
                    onDiscardSet={discardSet}
                    onSwap={setSwapPerformanceId}
                    onStopRest={clearRestTimer}
                    onRemove={perf.addedInSession && perf.sets.length === 0
                      ? () => removePerformance(perf.id)
                      : null}
                  />
                ))}
                <div style={{ marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setPickerSectionKey(sectionKey)}
                    data-testid="add-to-section"
                    data-section-key={sectionKey}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      border: '1px dashed var(--border-hairline)',
                      borderRadius: 6,
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      display: 'inline-block',
                    }}
                  >
                    + Add to {meta.title}
                  </button>
                </div>
              </section>
            );
          })}

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
                onClick={async () => {
                  const completed = await endSession();
                  if (completed && settings.intelligenceEnabled) {
                    setEndedSummary(completed);
                  } else {
                    navigate('/');
                  }
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

      <SlotPicker
        open={Boolean(pickerSectionKey)}
        onClose={() => setPickerSectionKey(null)}
        sectionKey={pickerSectionKey}
        sectionTitle={pickerSectionKey ? sectionMeta(pickerSectionKey).title : null}
        excludeIds={activeSession ? activeSession.performances.map((p) => p.exerciseId) : []}
        onPick={(exerciseId) => {
          const found = findExerciseAnywhere(exerciseId);
          if (found && pickerSectionKey) {
            addPerformance(pickerSectionKey, found.exercise);
          }
          setPickerSectionKey(null);
        }}
      />
    </Page>
  );
}
