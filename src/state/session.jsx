// Session store provider — the in-workout state machine.
//
// Phase 2 slice 2: storage is now IDB (via src/data/storage.js). Schema is
// unchanged. On endSession the completed blob is appended to
// `hdw:sessions:archive` instead of being dropped. This gives the
// Exercise-page history strip and the /today "Last time" line a place
// to read from.

import { useEffect, useMemo, useState } from 'react';
import { ulid } from '../data/ulid';
import { SessionContext } from './session-context.js';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../data/storage';

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

async function appendArchive(session) {
  const list = (await loadFromStorage(STORAGE_KEYS.archive, [])) ?? [];
  const next = [...list, { ...session, endedAt: new Date().toISOString() }];
  await saveToStorage(STORAGE_KEYS.archive, next);
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [archive, setArchive] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadFromStorage(STORAGE_KEYS.activeSession),
      loadFromStorage(STORAGE_KEYS.archive, []),
    ]).then(([s, a]) => {
      if (cancelled) return;
      setSession(s ?? null);
      setArchive(Array.isArray(a) ? a : []);
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Persist after every change once hydrated. The first post-hydration run
  // writes back the same value we just loaded (harmless idempotent set).
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.activeSession, session);
  }, [session, hydrated]);

  const value = useMemo(() => ({
    activeSession: session,
    archive,
    hydrated,

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

    async endSession() {
      if (!session) return;
      const totalSets = session.performances.reduce((n, p) => n + p.sets.length, 0);
      if (totalSets > 0) {
        const completed = { ...session, endedAt: new Date().toISOString() };
        await appendArchive(completed);
        setArchive((prev) => [...prev, completed]);
      }
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

    async replaceAll({ active = null, archive: nextArchive = [] } = {}) {
      await saveToStorage(STORAGE_KEYS.archive, nextArchive);
      setArchive(Array.isArray(nextArchive) ? nextArchive : []);
      setSession(active);
    },

    async clearAll() {
      await saveToStorage(STORAGE_KEYS.archive, []);
      setArchive([]);
      setSession(null);
    },
  }), [session, archive, hydrated]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
