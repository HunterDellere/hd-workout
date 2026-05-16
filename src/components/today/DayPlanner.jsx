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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Block, Stack } from '../../design-system/components';
import { dayLineageAccent } from '../../design-system/tokens';
import { findExerciseById } from '../../data';
import { useSettings } from '../../state/settings-context.js';
import { useSession } from '../../state/session-context.js';
import { useOverlay } from '../../state/overlay-context.js';
import { voiceFor } from '../../data/voice';
import { SubstituteSheet } from '../SubstituteSheet';
import { SlotPicker } from '../SlotPicker';
import { TodayHero } from './TodayHero';
import { PreviewSection } from './PreviewSection';
import { estimateDayMinutes } from './estimateDayMinutes';

export function DayPlanner({ dayKey, viewMode = 'today' }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { activeSession, startSession } = useSession();
  const {
    overlay,
    days: overlayDays,
    swapExerciseOverlay,
    hideExercise,
    addExercise,
    removeAddedExercise,
    resetDay,
  } = useOverlay();

  const [editSwap, setEditSwap] = useState(null);
  const [editAdd, setEditAdd] = useState(null);

  const day = overlayDays[dayKey] ?? null;
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

      <Block gapTop={24}>
        <Stack direction="column" gap={4}>
          <div>
            {day.sections.map((section) => {
              const addedIds = new Set(
                (overlay?.[programKey]?.[dayKey]?.[section.key]?.__added ?? [])
                  .map((e) => e.id),
              );
              return (
                <PreviewSection
                  key={section.key}
                  section={section}
                  accent={accent}
                  addedIds={addedIds}
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
