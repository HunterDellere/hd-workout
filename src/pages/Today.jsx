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
import { historyForExercise, lastTopSetForExercise } from '../data/history';
import { suggestNextLoad, annotatePRs } from '../data/intelligence';
import { useSettings, dayKeyForToday } from '../state/settings-context.js';
import { useSession, lastLoggedAt } from '../state/session-context.js';
import { useOverlay } from '../state/overlay-context.js';
import { SubstituteSheet } from '../components/SubstituteSheet';
import { SlotPicker } from '../components/SlotPicker';
import { AddGroupSheet } from '../components/AddGroupSheet';
import { ReorderSectionsSheet } from '../components/ReorderSectionsSheet';
import { PerformanceCard } from '../components/today/PerformanceCard';
import { RestDay } from '../components/today/RestDay';
import { SessionSummary } from '../components/today/SessionSummary';
import { DayPlanner } from '../components/today/DayPlanner';
import { SessionProgress } from '../components/today/SessionProgress';
import { useLongGap } from '../hooks/useLongGap';

export function Today() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const {
    activeSession,
    archive,
    endSession,
    logSet,
    discardSet,
    swapExercise,
    addPerformance,
    addSectionToActiveSession,
    removePerformance,
    clearRestTimer,
    dismissResumePrompt,
    resumeArchivedSession,
    setPerformanceNote,
    reorderSections,
  } = useSession();

  const {
    days: overlayDays,
  } = useOverlay();

  const todayKey = activeSession?.dayKey ?? dayKeyForToday(settings.split);
  const isRest = todayKey === 'rest';
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
  if (isRest) return <RestDay />;

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
        <div style={{ marginTop: 24 }}>
          <Button as={Link} to="/me/settings" variant="soft" accent="stone" size="md">
            Edit your split
          </Button>
        </div>
      </Page>
    );
  }

  // ─── Branch: training day (pre-start or active) ─────────────────────
  return (
    <Page>
      {!activeSession ? (
        <DayPlanner dayKey={todayKey} viewMode="today" />
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

          <BrushDivider style={{ marginTop: 32 }} />

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
                {longGap.hours >= 1 ? `${longGap.hours}h` : 'a while'} since your last set.
                Continue this session or end it now?
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
                    onLogSet={logSet}
                    onDiscardSet={discardSet}
                    onSwap={setSwapPerformanceId}
                    onStopRest={clearRestTimer}
                    onRemove={perf.addedInSession && perf.sets.length === 0
                      ? () => removePerformance(perf.id)
                      : null}
                    onSetNote={setPerformanceNote}
                    prSetIds={livePRSetIds}
                  />
                ))}
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

          <Stack direction="row" gap={2} style={{ marginTop: 32, flexWrap: 'wrap', rowGap: 8 }}>
            <MonoChipButton
              variant="dashed"
              size="md"
              data-testid="add-group"
              onClick={() => setAddGroupOpen(true)}
            >
              + Add custom group
            </MonoChipButton>
            <MonoChipButton
              size="md"
              data-testid="session-reorder"
              onClick={() => setReorderOpen(true)}
              disabled={performancesBySection.length < 2}
            >
              Reorder sections
            </MonoChipButton>
          </Stack>

          {/* Wave 5.2: end-session rail. Lives at the bottom of the doc
              flow so it doesn't overlap the BottomNav, but with extra
              breathing room. The session progress bar at the top is the
              persistent surface; this is the commit. */}
          <Block gapTop={48}>
            <BrushDivider />
            <Stack
              direction="row"
              justify="flex-end"
              align="center"
              gap={3}
              style={{ marginTop: 24 }}
            >
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
    </Page>
  );
}
