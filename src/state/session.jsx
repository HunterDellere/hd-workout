// Session store provider — the in-workout state machine.
// Persisted to localStorage under `hdw:session:active`. Schema mirrors
// local/04-data-model/SCHEMA.md so the Session 12 IDB migration is a swap-in.

import { useEffect, useMemo, useState } from 'react';
import { ulid } from '../data/ulid';
import { SessionContext, STORAGE_KEY } from './session-context.js';

function loadFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(session) {
  if (typeof window === 'undefined') return;
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* noop */
  }
}

function buildPerformances(day) {
  if (!day) return [];
  const out = [];
  for (const section of day.sections ?? []) {
    for (const ex of section.exercises ?? []) {
      out.push({
        id: ulid(),
        exerciseId: ex.id,
        sectionKey: section.key,
        swappedFromId: null,
        prescription: { sets: ex.sets, rest: ex.rest },
        sets: [],
        notes: '',
      });
    }
  }
  return out;
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => loadFromStorage());

  useEffect(() => { saveToStorage(session); }, [session]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setSession(loadFromStorage());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({
    activeSession: session,

    startSession(day) {
      if (session) return;
      setSession({
        id: ulid(),
        programId: 'full-spectrum',
        dayKey: day.key,
        startedAt: new Date().toISOString(),
        endedAt: null,
        performances: buildPerformances(day),
        restStartedAt: null,
        restTargetSec: null,
        restPerformanceId: null,
      });
    },

    endSession() {
      if (!session) return;
      setSession(null);
    },

    logSet(performanceId, { weight, reps, rpe, unit }) {
      setSession((s) => {
        if (!s) return s;
        const performances = s.performances.map((p) => {
          if (p.id !== performanceId) return p;
          const nextIndex = p.sets.length + 1;
          const newSet = {
            index: nextIndex,
            weight,
            unit,
            reps,
            rpe: rpe ?? null,
            restTakenSec: null,
            loggedAt: new Date().toISOString(),
          };
          return { ...p, sets: [...p.sets, newSet] };
        });
        const target = (s.performances.find((p) => p.id === performanceId)
          ?.prescription?.rest) || null;
        return {
          ...s,
          performances,
          restStartedAt: new Date().toISOString(),
          restTargetSec: target,
          restPerformanceId: performanceId,
        };
      });
    },

    discardSet(performanceId, setIndex) {
      setSession((s) => {
        if (!s) return s;
        const performances = s.performances.map((p) => {
          if (p.id !== performanceId) return p;
          return { ...p, sets: p.sets.filter((set) => set.index !== setIndex) };
        });
        return { ...s, performances };
      });
    },

    swapExercise(performanceId, newExerciseId) {
      setSession((s) => {
        if (!s) return s;
        const performances = s.performances.map((p) => {
          if (p.id !== performanceId) return p;
          if (p.sets.length > 0) return p;
          return {
            ...p,
            swappedFromId: p.swappedFromId ?? p.exerciseId,
            exerciseId: newExerciseId,
          };
        });
        return { ...s, performances };
      });
    },

    clearRestTimer() {
      setSession((s) => (
        s ? { ...s, restStartedAt: null, restTargetSec: null, restPerformanceId: null } : s
      ));
    },
  }), [session]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
