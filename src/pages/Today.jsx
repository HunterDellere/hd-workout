// /today — the in-workout session surface.
//
// Resolves today's dayKey from settings.split[weekday]. Three branches:
//   1. Rest day → <RestDay />
//   2. No day mapped to today's key → "No day scheduled" stub
//   3. Training day → pre-start preview (PreviewSection list + TodayHero)
//                     OR active session (PerformanceCard list)
//
// After the user ends a session, the end-summary surface (<SessionSummary />)
// replaces the page until they tap Done.

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
  MonoChipButton,
} from '../design-system/components';
import { dayLineageAccent } from '../design-system/tokens';
import { findExerciseById } from '../data';
import { parsePrescription } from '../data/prescription';
import {
  historyForExercise,
  lastTopSetForExercise,
  lastWorkingSetsForExercise,
  autoProgressionFor,
} from '../data/history';
import { suggestNextLoad, annotatePRs } from '../data/intelligence';
import { useSettings, effectiveTodayKey } from '../state/settings-context.js';
import { useSession, lastLoggedAt } from '../state/session-context.js';
import { useOverlay } from '../state/overlay-context.js';
import { SubstituteSheet } from '../components/SubstituteSheet';
import { SlotPicker } from '../components/SlotPicker';
import { AddGroupSheet } from '../components/AddGroupSheet';
import { ReorderSectionsSheet } from '../components/ReorderSectionsSheet';
import { SwapDaySheet } from '../components/SwapDaySheet';
import { PerformanceCard } from '../components/today/PerformanceCard';
import { CollapsedPerformanceRow } from '../components/today/CollapsedPerformanceRow';
import { RestDay } from '../components/today/RestDay';
import { SessionSummary } from '../components/today/SessionSummary';
import { DayPlanner } from '../components/today/DayPlanner';
import { SessionProgress } from '../components/today/SessionProgress';
import { useLongGap } from '../hooks/useLongGap';

export function Today() {
  const navigate = useNavigate();
  const { settings, setTodayOverride, clearTodayOverride } = useSettings();
  const {
    activeSession,
    archive,
    endSession,
    logSet,
    discardSet,
    editSet,
    swapExercise,
    addPerformance,
    addSectionToActiveSession,
    removePerformance,
    clearRestTimer,
    dismissResumePrompt,
    resumeArchivedSession,
    setPerformanceNote,
    reorderSections,
    adjustPrescribedSets,
    creditManualEntry,
  } = useSession();

  const {
    days: overlayDays,
  } = useOverlay();

  // Compute today's effective key from settings — honours a one-day
  // override stamped on settings.todayOverride (Recovery instead of Push
  // for an under-the-weather day, etc.). The override silently expires
  // when its stamped date no longer matches today.
  const { dayKey: scheduledTodayKey, fromOverride, scheduledKey } = effectiveTodayKey(settings);
  const todayKey = activeSession?.dayKey ?? scheduledTodayKey;
  const isRest = todayKey === 'rest';
  const [swapDayOpen, setSwapDayOpen] = useState(false);
  // Pre-start preview reads the overlay-applied day so user edits show up;
  // active sessions read the snapshot the session was started with via
  // `activeSession.performances` directly, so overlay edits during a
  // session don't perturb in-flight work.
  const day = useMemo(
    () => (todayKey && !isRest ? overlayDays[todayKey] : null),
    [todayKey, isRest, overlayDays],
  );
  const accent = todayKey ? (dayLineageAccent[todayKey] ?? 'stone') : 'stone';

  // In-session sheet state. Pre-start overlay edits live in DayPlanner.
  const [swapPerformanceId, setSwapPerformanceId] = useState(null);
  const [pickerSectionKey, setPickerSectionKey] = useState(null);
  const [pendingSectionTitle, setPendingSectionTitle] = useState(null);
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [endedSummary, setEndedSummary] = useState(null);
  const [endConfirming, setEndConfirming] = useState(false);
  // Dismissal lives on the session blob so it survives reloads.
  const resumeDismissed = Boolean(activeSession?.resumePromptDismissed);

  // Live PR annotations — run annotatePRs against the in-flight session
  // and the archive so every logged set knows whether it's a PR at log
  // time. Pure derivation; recomputed when either the session or the
  // archive shifts.
  const annotatedSession = useMemo(
    () => (activeSession ? annotatePRs(activeSession, archive) : null),
    [activeSession, archive],
  );
  // Wave 22 — focus mode. In-session view: one expanded card at a time,
  // others collapse to one-line summary rows. Focus starts at the first
  // incomplete performance and auto-advances when the current one fills
  // its prescribed set count. Warmup performances are EXCLUDED from the
  // auto-focus consideration — they live in their own section above the
  // first working lift and the user opens / dismisses them at will. If
  // we counted them as "first incomplete", focus would snap back to a
  // warmup drill after every working set log, which is disruptive.
  const firstIncompleteId = useMemo(() => {
    if (!activeSession) return null;
    for (const p of activeSession.performances ?? []) {
      if (p.sectionKey === 'warmup') continue;
      const prescription = parsePrescription(p.prescription?.sets ?? '');
      const done = (p.sets ?? []).filter((s) => !s.isWarmup).length;
      const target = prescription.setsTotal ?? 1;
      if (done < target) return p.id;
    }
    // All complete — keep the last performance focused so the lifter
    // sees their final logged sets rather than collapsing everything.
    return activeSession.performances?.[activeSession.performances.length - 1]?.id ?? null;
  }, [activeSession]);

  // Focus is derived: user-override (from a tap) takes precedence;
  // otherwise the first incomplete performance is focused. When the
  // override target becomes complete, the override is auto-cleared so
  // the lifter snaps forward to the next incomplete exercise.
  const [focusOverride, setFocusOverride] = useState(null);
  const focusedPerformanceId = useMemo(() => {
    if (!activeSession) return null;
    if (focusOverride) {
      // Honour any explicit tap — even on completed exercises — so the
      // lifter can re-open a finished card to review sets or add an
      // extra. Auto-snap-forward only kicks in when there's no override.
      const target = activeSession.performances?.find((p) => p.id === focusOverride);
      if (target) return focusOverride;
      // Stale override (swap/remove deleted the target). Fall through.
    }
    return firstIncompleteId;
  }, [activeSession, focusOverride, firstIncompleteId]);

  const livePRSetIds = useMemo(() => {
    if (!annotatedSession) return new Set();
    const ids = new Set();
    for (const p of annotatedSession.performances ?? []) {
      for (const s of p.sets ?? []) {
        if (s.pr) ids.add(`${p.id}:${s.index}`);
      }
    }
    return ids;
  }, [annotatedSession]);

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
    // Custom titles for user-added sections live on the active session blob.
    const customTitle = activeSession?.customSectionTitles?.[sectionKey];
    if (!day) return { title: customTitle ?? sectionKey, blurb: null };
    const found = day.sections.find((s) => s.key === sectionKey);
    return {
      title: found?.title ?? customTitle ?? sectionKey,
      blurb: found?.blurb ?? null,
    };
  }

  const referenceTime = activeSession
    ? (lastLoggedAt(activeSession) ?? activeSession.startedAt)
    : null;
  const longGap = useLongGap(referenceTime);

  const swapPerformance = swapPerformanceId
    ? activeSession?.performances.find((p) => p.id === swapPerformanceId)
    : null;

  // ─── Branch: end-of-session summary ─────────────────────────────────
  if (endedSummary) {
    return (
      <SessionSummary
        session={endedSummary}
        accent={accent}
        intelligenceEnabled={settings.intelligenceEnabled}
        onDone={() => { setEndedSummary(null); navigate('/'); }}
        onOpenInsights={() => setEndedSummary(null)}
        onResume={async () => {
          const ok = await resumeArchivedSession(endedSummary.id);
          if (ok) setEndedSummary(null);
        }}
      />
    );
  }

  // ─── Branch: rest day ────────────────────────────────────────────────
  if (isRest) {
    return (
      <>
        <RestDay
          onOpenSwap={() => setSwapDayOpen(true)}
          fromOverride={fromOverride}
          scheduledKey={scheduledKey}
          onResetToScheduled={clearTodayOverride}
        />
        <SwapDaySheet
          open={swapDayOpen}
          onClose={() => setSwapDayOpen(false)}
          currentKey={todayKey}
          scheduledKey={scheduledKey}
          isOverridden={fromOverride}
          onPick={(key) => {
            if (key === scheduledKey && fromOverride) {
              clearTodayOverride();
            } else if (key !== todayKey) {
              setTodayOverride(key);
            }
            setSwapDayOpen(false);
          }}
          onResetToScheduled={() => {
            clearTodayOverride();
            setSwapDayOpen(false);
          }}
        />
      </>
    );
  }

  // ─── Branch: weekday has a key but the program doesn't define it ────
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
          {todayKey
            ? `Your split has "${todayKey}" today, but your active program doesn't define it. `
              + 'Change today\'s day in Settings, or switch programs.'
            : 'The current weekday has no day assigned in your split.'}
        </Text>
        <BrushDivider style={{ marginTop: 32 }} />
        <Stack direction="row" gap={2} style={{ marginTop: 24, flexWrap: 'wrap', rowGap: 8 }}>
          <Button as={Link} to="/me/settings" variant="soft" accent="stone" size="md">
            Edit your split
          </Button>
          <Button
            variant="bare"
            accent="stone"
            size="md"
            onClick={() => setSwapDayOpen(true)}
            data-testid="swap-day-from-stub"
          >
            Swap today's routine
          </Button>
        </Stack>
        <SwapDaySheet
          open={swapDayOpen}
          onClose={() => setSwapDayOpen(false)}
          currentKey={todayKey}
          scheduledKey={scheduledKey}
          isOverridden={fromOverride}
          onPick={(key) => {
            if (key === scheduledKey && fromOverride) {
              clearTodayOverride();
            } else if (key !== todayKey) {
              setTodayOverride(key);
            }
            setSwapDayOpen(false);
          }}
          onResetToScheduled={() => {
            clearTodayOverride();
            setSwapDayOpen(false);
          }}
        />
      </Page>
    );
  }

  // ─── Branch: training day (pre-start or active) ─────────────────────
  return (
    <Page>
      {!activeSession ? (
        <DayPlanner
          dayKey={todayKey}
          viewMode="today"
          onOpenSwapDay={() => setSwapDayOpen(true)}
          swapDayActive={fromOverride}
          scheduledDayKey={scheduledKey}
        />
      ) : (
        <>
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
            <Text
              as="div"
              variant="mono-sm"
              tone="tertiary"
              style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}
            >
              {day.key}
            </Text>
          </Stack>
          <Text as="h1" variant="display-lg" style={{ marginTop: 6, fontStyle: 'italic' }}>
            {day.name}
          </Text>

          <BrushDivider style={{ marginTop: 24 }} />

          {/* Wave 5.2: sticky session progress lives below the page header
              so the user always sees how far in they are. Uses the working-
              set definition + the prescribed total. */}
          <SessionProgress session={annotatedSession} accent={accent} />

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
                {longGap.hours >= 1 ? `${longGap.hours}h` : 'A while'} since your last set.
              </Text>
              <Stack direction="row" gap={2} style={{ marginTop: 12 }}>
                <Button
                  variant="soft"
                  accent={accent}
                  size="sm"
                  data-testid="resume-continue"
                  onClick={() => dismissResumePrompt()}
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
            // Section-level completion: count performances whose working
            // sets have met their prescribed total. Gives the user a
            // tangible "X of Y exercises done in this section" cue.
            // The warmup section is binary per drill: each warmup
            // PerformanceCard logs a single completion event regardless
            // of the parsed setsTotal (CompletionSetRow renders one
            // pill per drill — "8 cycles" or "2 × 10" is one bout).
            // So a warmup performance is "done" iff it has any logged
            // set. Working sections still use the prescribed-vs-logged
            // working-set comparison.
            const isWarmupSection = sectionKey === 'warmup';
            const sectionTotals = performances.reduce((acc, p) => {
              acc.total += 1;
              if (isWarmupSection) {
                if ((p.sets ?? []).length > 0) acc.done += 1;
              } else {
                const presc = parsePrescription(p.prescription?.sets ?? '');
                const target = presc.setsTotal ?? null;
                const done = (p.sets ?? []).filter((s) => !s.isWarmup).length;
                if (target != null && done >= target) acc.done += 1;
              }
              return acc;
            }, { done: 0, total: 0 });
            const sectionComplete = sectionTotals.total > 0
              && sectionTotals.done === sectionTotals.total;
            return (
              <section
                key={sectionKey}
                data-testid="section-group"
                data-section-key={sectionKey}
                data-section-complete={sectionComplete ? '1' : '0'}
                style={{ marginTop: isWarmupSection ? 20 : 40 }}
              >
                <Stack direction="row" align="center" justify="space-between" gap={2}>
                  <Stack direction="row" align="center" gap={2} style={{ minWidth: 0, flex: 1 }}>
                    <span
                      aria-hidden
                      style={{
                        display: 'inline-block',
                        width: 3,
                        height: isWarmupSection ? 12 : 16,
                        flexShrink: 0,
                        borderRadius: 2,
                        background: sectionComplete
                          ? `var(--accent-${accent}-ink)`
                          : `var(--accent-${accent}-solid)`,
                        opacity: sectionComplete ? 1 : (isWarmupSection ? 0.35 : 0.55),
                      }}
                    />
                    <Text
                      as="div"
                      variant="mono-sm"
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        fontWeight: isWarmupSection ? 400 : 600,
                        color: sectionComplete
                          ? `var(--accent-${accent}-ink)`
                          : (isWarmupSection ? 'var(--text-tertiary)' : 'var(--text-secondary)'),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {meta.title}
                    </Text>
                  </Stack>
                  <Text
                    as="div"
                    variant="mono-sm"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.10em',
                      color: sectionComplete
                        ? `var(--accent-${accent}-ink)`
                        : 'var(--text-tertiary)',
                      fontWeight: sectionComplete ? 600 : 400,
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sectionTotals.done}/{sectionTotals.total}
                    {sectionComplete ? ' ✓' : ''}
                  </Text>
                </Stack>
                {/* Section blurbs are planning copy — suppressed mid-session
                    to let the work surface dominate. They still appear in the
                    pre-session DayPlanner. */}
                {performances.map((perf) => {
                  // Wave 22: focus mode. Only the focused performance
                  // renders the full input card; others collapse to a
                  // one-line summary that promotes to focus on tap.
                  const isFocused = perf.id === focusedPerformanceId;
                  if (!isFocused) {
                    return (
                      <CollapsedPerformanceRow
                        key={perf.id}
                        performance={perf}
                        accent={accent}
                        onFocus={(id) => setFocusOverride(id)}
                      />
                    );
                  }
                  return (
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
                      autoProgression={autoProgressionFor(
                        lastWorkingSetsForExercise(archive, perf.exerciseId),
                        parsePrescription(perf.prescription?.sets ?? ''),
                        settings.units,
                      )}
                      barWeight={settings.units === 'lb'
                        ? (settings.barWeightLb ?? null)
                        : (settings.barWeightKg ?? null)}
                      plateInventory={settings.units === 'lb'
                        ? (settings.platesLb ?? null)
                        : (settings.platesKg ?? null)}
                      plateCalculatorEnabled={settings.plateCalculatorEnabled !== false}
                      suggestion={settings.intelligenceEnabled
                        ? suggestNextLoad(
                          historyForExercise(archive, perf.exerciseId),
                          parsePrescription(perf.prescription?.sets ?? ''),
                          settings.units,
                        )
                        : null}
                      manualEntriesToday={archive.filter((s) => (
                        s.manual === true
                        && s.performances?.[0]?.exerciseId === perf.exerciseId
                        && s.startedAt
                        && activeSession.startedAt
                        && (() => {
                          const a = new Date(s.startedAt);
                          const b = new Date(activeSession.startedAt);
                          return a.getFullYear() === b.getFullYear()
                            && a.getMonth() === b.getMonth()
                            && a.getDate() === b.getDate();
                        })()
                      ))}
                      onCreditManualEntry={creditManualEntry}
                      onLogSet={logSet}
                      onDiscardSet={discardSet}
                      onEditSet={editSet}
                      onSwap={setSwapPerformanceId}
                      onStopRest={clearRestTimer}
                      onRemove={perf.addedInSession && perf.sets.length === 0
                        ? () => removePerformance(perf.id)
                        : null}
                      onSetNote={setPerformanceNote}
                      onAdjustSets={adjustPrescribedSets}
                      prSetIds={livePRSetIds}
                    />
                  );
                })}
                <div style={{ marginTop: 16 }}>
                  <MonoChipButton
                    variant="dashed"
                    size="md"
                    onClick={() => setPickerSectionKey(sectionKey)}
                    data-testid="add-to-section"
                    data-section-key={sectionKey}
                  >
                    + Add exercise
                  </MonoChipButton>
                </div>
              </section>
            );
          })}

          <Stack direction="row" gap={2} style={{ marginTop: 28, flexWrap: 'wrap', rowGap: 8 }}>
            <MonoChipButton
              variant="dashed"
              size="md"
              data-testid="add-group"
              onClick={() => setAddGroupOpen(true)}
            >
              + Add group
            </MonoChipButton>
            <MonoChipButton
              size="md"
              data-testid="session-reorder"
              onClick={() => setReorderOpen(true)}
              disabled={performancesBySection.length < 2}
            >
              Reorder
            </MonoChipButton>
          </Stack>

          {/* Wave 5.2: end-session rail. Lives at the bottom of the doc
              flow so it doesn't overlap the BottomNav, but with extra
              breathing room. The session progress bar at the top is the
              persistent surface; this is the commit. */}
          {/* End-session: two-tap confirm when sets have been logged.
              Without it, an accidental tap drops a session into the
              archive with no undo path beyond the History edit screen.
              Sessions with no sets logged end with one tap (no work
              to lose). */}
          <Block gapTop={48}>
            <BrushDivider />
            <Stack
              direction="row"
              justify="flex-end"
              align="center"
              gap={3}
              style={{ marginTop: 24 }}
            >
              {endConfirming ? (
                <>
                  <Text
                    as="span"
                    variant="mono-sm"
                    tone="tertiary"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
                  >
                    End session?
                  </Text>
                  <Button
                    variant="bare"
                    size="md"
                    onClick={() => setEndConfirming(false)}
                    data-testid="end-session-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="soft"
                    accent={accent}
                    size="md"
                    data-testid="end-session-confirm"
                    onClick={async () => {
                      setEndConfirming(false);
                      const completed = await endSession();
                      if (completed && settings.intelligenceEnabled) {
                        setEndedSummary(completed);
                      } else {
                        navigate('/');
                      }
                    }}
                  >
                    End
                  </Button>
                </>
              ) : (() => {
                // Promote to CTA variant when every prescribed working
                // set is logged — a tangible "you're done, commit it"
                // affordance. Stays soft when there's still work left.
                const totals = activeSession?.performances?.reduce((acc, p) => {
                  const presc = parsePrescription(p.prescription?.sets ?? '');
                  const target = presc.setsTotal ?? null;
                  const done = (p.sets ?? []).filter((s) => !s.isWarmup).length;
                  if (target != null) {
                    acc.target += target;
                    acc.done += Math.min(done, target);
                  }
                  return acc;
                }, { done: 0, target: 0 }) ?? { done: 0, target: 0 };
                const fullyDone = totals.target > 0 && totals.done >= totals.target;
                return (
                  <Button
                    variant={fullyDone ? 'cta' : 'soft'}
                    accent={accent}
                    size="md"
                    data-testid="end-session"
                    onClick={async () => {
                      // No sets logged → end immediately (no data to lose).
                      const hasLogged = activeSession?.performances?.some(
                        (p) => p.sets && p.sets.length > 0,
                      );
                      if (!hasLogged) {
                        const completed = await endSession();
                        if (completed && settings.intelligenceEnabled) {
                          setEndedSummary(completed);
                        } else {
                          navigate('/');
                        }
                        return;
                      }
                      setEndConfirming(true);
                    }}
                  >
                    {fullyDone ? 'Finish session →' : 'End session'}
                  </Button>
                );
              })()}
            </Stack>
          </Block>
        </>
      )}

      <AddGroupSheet
        open={addGroupOpen}
        onClose={() => setAddGroupOpen(false)}
        onSubmit={(title) => {
          const sectionKey = `custom-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
          setPendingSectionTitle(title);
          setAddGroupOpen(false);
          setPickerSectionKey(sectionKey);
        }}
      />

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
        sectionExercises={
          pickerSectionKey && activeSession
            ? activeSession.performances
              .filter((p) => p.sectionKey === pickerSectionKey)
              .map((p) => findExerciseById(p.exerciseId))
              .filter(Boolean)
            : []
        }
        excludeIds={activeSession ? activeSession.performances.map((p) => p.exerciseId) : []}
        onPick={(exerciseId) => {
          const ex = findExerciseById(exerciseId);
          if (ex && pickerSectionKey) {
            // If the section is brand-new (no performances yet), this is the
            // first exercise → treat as add-section (keeps the title alive).
            const isNewSection = !activeSession.performances.some(
              (p) => p.sectionKey === pickerSectionKey,
            );
            if (isNewSection && pendingSectionTitle) {
              addSectionToActiveSession(pickerSectionKey, ex, pendingSectionTitle);
              setPendingSectionTitle(null);
            } else {
              addPerformance(pickerSectionKey, ex);
            }
          }
          setPickerSectionKey(null);
        }}
      />

      {/* Mid-session reorder. Pulls a section list from the live
          performancesBySection grouping so user-added sections show up
          alongside program sections. Commits via session.reorderSections
          (not the overlay), since the session is the source of truth
          once started. */}
      <ReorderSectionsSheet
        open={reorderOpen}
        onClose={() => setReorderOpen(false)}
        sections={performancesBySection.map(({ key, performances }) => ({
          key,
          title: sectionMeta(key).title,
          exercises: performances,
        }))}
        onSave={(orderedKeys) => reorderSections(orderedKeys)}
      />

      {/* Pre-start overlay-editing sheets are owned by DayPlanner now. */}

      {/* One-day routine swap. Suppressed during an active session — the
          session is locked to the day it was started in; the user can swap
          individual exercises but not the whole day. */}
      {!activeSession && (
        <SwapDaySheet
          open={swapDayOpen}
          onClose={() => setSwapDayOpen(false)}
          currentKey={todayKey}
          scheduledKey={scheduledKey}
          isOverridden={fromOverride}
          onPick={(key) => {
            if (key === scheduledKey && fromOverride) {
              clearTodayOverride();
            } else if (key !== todayKey) {
              setTodayOverride(key);
            }
            setSwapDayOpen(false);
          }}
          onResetToScheduled={() => {
            clearTodayOverride();
            setSwapDayOpen(false);
          }}
        />
      )}
    </Page>
  );
}
