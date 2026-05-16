// DayPlanner — pre-start surface for any day (today or planned-ahead).
// Hosts TodayHero, the per-section previews with overlay-aware
// swap/remove/add affordances, and the swap/add sheets.
//
// Used by:
//   - /today (Today.jsx) for the today-day surface
//   - /:dayKey (Day.jsx) for plan-ahead editing/starting another day
//
// Edits flow through useOverlay (location- and program-scoped, not
// date-scoped). Starting a session here calls startSession(day, programKey)
// and navigates to '/' so the user lands on the active-session view.

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Block, Stack, Text } from '../../design-system/components';
import { dayLineageAccent } from '../../design-system/tokens';
import { findExerciseById } from '../../data';
import { useSettings } from '../../state/settings-context.js';
import { useSession } from '../../state/session-context.js';
import { useOverlay } from '../../state/overlay-context.js';
import { voiceFor } from '../../data/voice';
import { recoveryDebt } from '../../data/intelligence';
import { patternToExercises } from '../../data/derive';
import { SubstituteSheet } from '../SubstituteSheet';
import { SlotPicker } from '../SlotPicker';
import { TodayHero } from './TodayHero';
import { PreviewSection } from './PreviewSection';
import { estimateDayMinutes } from './estimateDayMinutes';

// Map a day's exercises to their movement patterns so we can decide which
// recovery-debt entries apply. Pure derivation.
function patternsInDay(day) {
  if (!day) return new Set();
  const out = new Set();
  const map = patternToExercises();
  const exerciseIds = new Set(
    (day.sections ?? []).flatMap((s) => (s.exercises ?? []).map((e) => e.id)),
  );
  for (const [patternKey, list] of Object.entries(map)) {
    if (list.some((ex) => exerciseIds.has(ex.id))) out.add(patternKey);
  }
  return out;
}

const PATTERN_LABEL = {
  'horizontal-press': 'horizontal pressing',
  'vertical-press': 'vertical pressing',
  'horizontal-pull': 'horizontal pulling',
  'vertical-pull': 'vertical pulling',
  'squat': 'squatting',
  'hinge': 'hinging',
  'lunge': 'lunging',
  'core-anti': 'anti-rotation core',
  'core-flexion': 'flexion core',
  'mobility': 'mobility',
  'corrective': 'corrective',
  'healthspan': 'healthspan',
};

export function DayPlanner({ dayKey, viewMode = 'today' }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { activeSession, archive, startSession } = useSession();
  const {
    overlay,
    days: overlayDays,
    swapExerciseOverlay,
    hideExercise,
    unhideExercise,
    addExercise,
    removeAddedExercise,
    resetDay,
  } = useOverlay();

  const [editSwap, setEditSwap] = useState(null);
  const [editAdd, setEditAdd] = useState(null);

  const day = overlayDays[dayKey] ?? null;

  // Wave 6.3c: pre-start recovery-debt nudge. Filters the day's patterns
  // against recoveryDebt() and surfaces the worst over-baseline one.
  const debtNudge = useMemo(() => {
    if (!day) return null;
    const debt = recoveryDebt(archive);
    const dayPatterns = patternsInDay(day);
    let worst = null;
    for (const [pattern, info] of Object.entries(debt)) {
      if (!dayPatterns.has(pattern)) continue;
      if (!worst || info.ratio > worst.ratio) worst = { pattern, ...info };
    }
    return worst;
  }, [archive, day]);

  if (!day) return null;

  const accent = dayLineageAccent[dayKey] ?? 'stone';
  const exerciseCount = day.sections.reduce((n, s) => n + s.exercises.length, 0);
  const sectionCount = day.sections.length;
  const estMinutes = estimateDayMinutes(day);
  const heroVoice = voiceFor(dayKey);
  const programKey = settings.activeProgramKey ?? 'full-spectrum';
  const hasOverlay = Boolean(overlay?.[programKey]?.[dayKey]);
  const sessionActive = Boolean(activeSession);

  // viewMode='ahead' shows a "Plan" eyebrow instead of "Today" — same surface,
  // different label so the user knows they're editing a future day's
  // template, not committing the current session.
  const heroLabel = viewMode === 'ahead' ? `Plan · ${dayKey}` : `Today · ${dayKey}`;

  function handleStart() {
    if (sessionActive) return;
    startSession(day, programKey);
    // Always route to / so the user lands on the active-session view.
    navigate('/');
  }

  return (
    <>
      <TodayHero
        day={day}
        accent={accent}
        todayKey={heroLabel.split(' · ')[1]}
        labelOverride={heroLabel}
        exerciseCount={exerciseCount}
        sectionCount={sectionCount}
        estMinutes={estMinutes}
        voice={heroVoice}
        onStart={handleStart}
        startDisabled={sessionActive}
        startLabel={sessionActive ? 'Session in progress' : 'Start session'}
        hasOverlay={hasOverlay}
        onResetDay={() => resetDay(dayKey)}
      />

      {/* Wave 6.3c: quiet recovery-debt nudge when this day's patterns
          have been over-baseline in the last 72h. No prediction, no
          fatigue model — just counts. */}
      {debtNudge && (
        <div
          data-testid="recovery-debt-nudge"
          data-pattern={debtNudge.pattern}
          style={{
            marginTop: 16,
            padding: '12px 14px',
            border: '1px solid var(--border-hairline)',
            borderLeft: `3px solid var(--state-warn-ink)`,
            borderRadius: 4,
            background: 'var(--surface-sunken)',
          }}
        >
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Recovery
          </Text>
          <Text as="p" variant="body-sm" tone="secondary" style={{ marginTop: 4 }}>
            You&apos;ve done {debtNudge.recent} {PATTERN_LABEL[debtNudge.pattern] ?? debtNudge.pattern} sets in 72h — about {debtNudge.ratio}× your two-week pace. Consider rotating or trimming the load.
          </Text>
        </div>
      )}

      <Block gapTop={24}>
        <Stack direction="column" gap={4}>
          <div>
            {day.sections.map((section) => {
              const sectionOverlay = overlay?.[programKey]?.[dayKey]?.[section.key] ?? {};
              const addedIds = new Set(
                (sectionOverlay.__added ?? []).map((e) => e.id),
              );
              // Wave 6.2: collect IDs currently hidden in this section so we
              // can surface a "+ Show N hidden" footer for per-row undo.
              const hiddenIds = Object.entries(sectionOverlay)
                .filter(([key, value]) => key !== '__added' && value?.hidden)
                .map(([key]) => key);
              const hiddenExercises = hiddenIds
                .map((id) => findExerciseById(id))
                .filter(Boolean);
              return (
                <PreviewSection
                  key={section.key}
                  section={section}
                  accent={accent}
                  addedIds={addedIds}
                  hiddenExercises={hiddenExercises}
                  onSwapExercise={(sectionKey, exerciseId) =>
                    setEditSwap({ sectionKey, exerciseId })
                  }
                  onRemoveExercise={(sectionKey, exerciseId, wasAdded) => {
                    if (wasAdded) {
                      removeAddedExercise(dayKey, sectionKey, exerciseId);
                    } else {
                      hideExercise(dayKey, sectionKey, exerciseId);
                    }
                  }}
                  onUnhideExercise={(sectionKey, exerciseId) =>
                    unhideExercise(dayKey, sectionKey, exerciseId)
                  }
                  onAddExercise={(sectionKey) => setEditAdd(sectionKey)}
                />
              );
            })}
          </div>
        </Stack>
      </Block>

      <SubstituteSheet
        open={Boolean(editSwap)}
        onClose={() => setEditSwap(null)}
        currentExerciseId={editSwap?.exerciseId}
        hasLoggedSets={false}
        onPick={(newId) => {
          if (editSwap) {
            const ex = findExerciseById(newId);
            if (ex) {
              swapExerciseOverlay(dayKey, editSwap.sectionKey, editSwap.exerciseId, {
                id: newId,
                sets: ex.sets,
                rest: ex.rest,
              });
            }
          }
          setEditSwap(null);
        }}
      />

      <SlotPicker
        open={Boolean(editAdd)}
        onClose={() => setEditAdd(null)}
        sectionKey={editAdd}
        sectionTitle={editAdd ? (day.sections.find((s) => s.key === editAdd)?.title ?? null) : null}
        sectionExercises={
          editAdd
            ? (day.sections.find((s) => s.key === editAdd)?.exercises ?? [])
            : []
        }
        excludeIds={day.sections.flatMap((s) => s.exercises.map((e) => e.id))}
        onPick={(exerciseId) => {
          const ex = findExerciseById(exerciseId);
          if (ex && editAdd) {
            addExercise(dayKey, editAdd, {
              id: exerciseId,
              sets: ex.sets,
              rest: ex.rest,
            });
          }
          setEditAdd(null);
        }}
      />
    </>
  );
}
