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
import { annotatePRs } from '../data/intelligence';
import { migrate, migrateArray, stampSchemaVersion } from '../data/migrations';

// Stamp every archive entry with the current schemaVersion before writing.
// Keeps the on-disk shape uniform so the load-path migration is a no-op
// for fresh data.
async function saveArchive(arr) {
  const stamped = Array.isArray(arr) ? arr.map(stampSchemaVersion) : arr;
  await saveToStorage(STORAGE_KEYS.archive, stamped);
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
      // Migrate on load so the in-memory shape is always current.
      setSession(s ? migrate(s, 'session') : null);
      setArchive(Array.isArray(a) ? migrateArray(a, 'archive') : []);
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Persist after every change once hydrated. The first post-hydration run
  // writes back the same value we just loaded (harmless idempotent set).
  // schemaVersion is stamped on every write so future migrations have a
  // fixed point.
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.activeSession, session ? stampSchemaVersion(session) : null);
  }, [session, hydrated]);

  const value = useMemo(() => ({
    activeSession: session,
    archive,
    hydrated,

    startSession(day, programKey = 'full-spectrum') {
      if (session) return;
      setSession({
        id: ulid(),
        programId: programKey,
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
      if (!session) return null;
      const totalSets = session.performances.reduce((n, p) => n + p.sets.length, 0);
      if (totalSets === 0) {
        setSession(null);
        return null;
      }
      const completed = annotatePRs(
        { ...session, endedAt: new Date().toISOString() },
        archive,
      );
      // Write archive synchronously then clear the active session so the
      // /today UI can read PRs off the returned blob.
      const next = [...archive, completed];
      await saveArchive(next);
      setArchive(next);
      setSession(null);
      return completed;
    },

    // Round-trip end-session: re-open an archived session as the active one.
    // Used by the summary screen's "Resume this session" affordance so the
    // user can recover from a misfired End-session tap (VISION principle 8:
    // every action reversible). Strips endedAt + clears PR annotations so
    // the session re-enters the in-flight state shape cleanly.
    async resumeArchivedSession(sessionId) {
      if (session) return false; // never blow away an in-flight session
      const idx = archive.findIndex((s) => s.id === sessionId);
      if (idx < 0) return false;
      const target = archive[idx];
      const nextArchive = archive.filter((s) => s.id !== sessionId);
      await saveArchive(nextArchive);
      setArchive(nextArchive);
      // Strip PR annotations + endedAt so the session reads as in-progress.
      const stripped = {
        ...target,
        endedAt: null,
        performances: target.performances.map((p) => ({
          ...p,
          sets: p.sets.map((s) => {
            if (!s.pr) return s;
            // Strip pr without mutating the original set.
            return Object.fromEntries(Object.entries(s).filter(([k]) => k !== 'pr'));
          }),
        })),
      };
      setSession(stripped);
      return true;
    },

    logSet(performanceId, payload) {
      setSession((s) => {
        if (!s) return s;
        const performances = s.performances.map((p) => {
          if (p.id !== performanceId) return p;
          const nextIndex = p.sets.length + 1;
          // Two payload shapes:
          //   strength: { weight, reps, rpe, unit, isWarmup?, isDrop? }
          //   duration/rounds: { kind: 'duration'|'rounds', durationSec, side? }
          // The schema keeps both flat — duration sets simply have no
          // weight/reps fields, and strength sets have no durationSec.
          // Intelligence / archive consumers already gate on
          // s.weight != null so they ignore duration entries cleanly.
          const isTimeBased = payload?.kind === 'duration' || payload?.kind === 'rounds';
          const isDistance = payload?.kind === 'distance';
          const newSet = isDistance
            ? {
              index: nextIndex,
              kind: 'distance',
              distanceM: payload.distanceM ?? 0,
              side: payload.side ?? null,
              restTakenSec: null,
              loggedAt: new Date().toISOString(),
            }
            : isTimeBased
            ? {
              index: nextIndex,
              kind: payload.kind,
              durationSec: payload.durationSec ?? 0,
              side: payload.side ?? null,
              restTakenSec: null,
              loggedAt: new Date().toISOString(),
            }
            : {
              index: nextIndex,
              weight: payload.weight,
              unit: payload.unit,
              reps: payload.reps,
              rpe: payload.rpe ?? null,
              isWarmup: payload.isWarmup || undefined,
              isDrop: payload.isDrop || undefined,
              restTakenSec: null,
              loggedAt: new Date().toISOString(),
            };
          return { ...p, sets: [...p.sets, newSet] };
        });
        // Duration / rounds / distance sets don't trigger a rest timer —
        // the exercise itself sets the pace. (Carries usually rest between
        // rounds via the catalog rest field, but we don't auto-start it.)
        const isTimeBased = payload?.kind === 'duration' || payload?.kind === 'rounds';
        const isDistance = payload?.kind === 'distance';
        if (isTimeBased || isDistance) {
          return { ...s, performances };
        }
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

    // Adjust the prescribed set count for a performance by ±1. Rewrites
    // the leading integer of the prescription string ("3 × 8" → "4 × 8",
    // "5 rounds" → "6 rounds"). Floor is the greater of 1 or the number
    // of sets already logged — you can't shrink the plan below what
    // you've already done. No-op for free-text prescriptions where we
    // can't safely identify the set count.
    adjustPrescribedSets(performanceId, delta) {
      if (!Number.isFinite(delta) || delta === 0) return;
      setSession((s) => {
        if (!s) return s;
        const performances = s.performances.map((p) => {
          if (p.id !== performanceId) return p;
          const raw = String(p.prescription?.sets ?? '').trim();
          if (!raw) return p;
          // Match a leading integer (possibly with range like "3–4" or "3-4").
          // Captures the first int so we can rewrite it.
          const m = raw.match(/^(\d+)(\s*[–-]\s*\d+)?(.*)$/);
          if (!m) return p;
          const current = Number.parseInt(m[1], 10);
          if (!Number.isFinite(current)) return p;
          const floor = Math.max(1, p.sets.length);
          const next = Math.max(floor, current + delta);
          if (next === current) return p;
          // Drop any range suffix on edit — collapses "3–4 × 8" to "4 × 8".
          const rewritten = `${next}${m[3]}`;
          return {
            ...p,
            prescription: { ...p.prescription, sets: rewritten },
          };
        });
        return { ...s, performances };
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

    // Write a freeform note onto a performance. The schema has supported
    // performance.notes since session creation but no UI ever wrote to it
    // until Wave 3.1. Empty string is the canonical "no note" state.
    setPerformanceNote(performanceId, text) {
      setSession((s) => {
        if (!s) return s;
        const performances = s.performances.map((p) => (
          p.id === performanceId ? { ...p, notes: text ?? '' } : p
        ));
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

    addPerformance(sectionKey, exercise) {
      if (!exercise || !sectionKey) return;
      setSession((s) => {
        if (!s) return s;
        // Bail if a performance for this exercise already exists in the section.
        const exists = s.performances.some(
          (p) => p.sectionKey === sectionKey && p.exerciseId === exercise.id,
        );
        if (exists) return s;
        const newPerf = {
          id: ulid(),
          exerciseId: exercise.id,
          sectionKey,
          swappedFromId: null,
          addedInSession: true,
          prescription: { sets: exercise.sets, rest: exercise.rest },
          sets: [],
          notes: '',
        };
        // Insert at the end of the same section; if the section isn't
        // present (cross-section add) append to the tail.
        let inserted = false;
        const next = [];
        for (let i = 0; i < s.performances.length; i++) {
          next.push(s.performances[i]);
          const here = s.performances[i].sectionKey === sectionKey;
          const nextDifferent = i + 1 >= s.performances.length
            || s.performances[i + 1].sectionKey !== sectionKey;
          if (here && nextDifferent && !inserted) {
            next.push(newPerf);
            inserted = true;
          }
        }
        if (!inserted) next.push(newPerf);
        return { ...s, performances: next };
      });
    },

    removePerformance(performanceId) {
      setSession((s) => {
        if (!s) return s;
        const target = s.performances.find((p) => p.id === performanceId);
        if (!target || target.sets.length > 0) return s; // never remove a logged performance
        return { ...s, performances: s.performances.filter((p) => p.id !== performanceId) };
      });
    },

    // Mid-session section reorder. The session blob holds performances
    // in their authored order; this restacks them so a given sectionKey
    // group moves up or down in the list while preserving each section's
    // internal exercise order. Sections not in the supplied order keep
    // their original relative position at the tail.
    reorderSections(sectionKeys) {
      if (!Array.isArray(sectionKeys)) return;
      setSession((s) => {
        if (!s) return s;
        const groups = new Map();
        const originalOrder = [];
        for (const perf of s.performances) {
          if (!groups.has(perf.sectionKey)) {
            groups.set(perf.sectionKey, []);
            originalOrder.push(perf.sectionKey);
          }
          groups.get(perf.sectionKey).push(perf);
        }
        const seen = new Set();
        const orderedKeys = [];
        for (const k of sectionKeys) {
          if (groups.has(k) && !seen.has(k)) {
            orderedKeys.push(k);
            seen.add(k);
          }
        }
        for (const k of originalOrder) {
          if (!seen.has(k)) orderedKeys.push(k);
        }
        const performances = orderedKeys.flatMap((k) => groups.get(k));
        return { ...s, performances };
      });
    },

    clearRestTimer() {
      setSession((s) => (
        s ? { ...s, restStartedAt: null, restTargetSec: null, restPerformanceId: null } : s
      ));
    },

    // Survives reloads: stamped on the session blob so the long-gap prompt
    // doesn't reappear after the user has explicitly dismissed it.
    dismissResumePrompt() {
      setSession((s) => (s ? { ...s, resumePromptDismissed: true } : s));
    },

    async replaceAll({ active = null, archive: nextArchive = [] } = {}) {
      await saveArchive(nextArchive);
      setArchive(Array.isArray(nextArchive) ? nextArchive : []);
      setSession(active);
    },

    async clearAll() {
      await saveArchive([]);
      setArchive([]);
      setSession(null);
    },

    // ─── Archive management (History page) ───────────────────────────────
    // Edit one archived session in-place. The caller supplies a full
    // replacement blob; PR annotations are re-derived against the rest
    // of the archive so edits don't desync the "first PR" highlight.
    async updateArchivedSession(sessionId, nextSession) {
      const idx = archive.findIndex((s) => s.id === sessionId);
      if (idx < 0) return false;
      const without = archive.filter((s) => s.id !== sessionId);
      const reannotated = annotatePRs(nextSession, without);
      const next = [...archive.slice(0, idx), reannotated, ...archive.slice(idx + 1)];
      await saveArchive(next);
      setArchive(next);
      return true;
    },

    async deleteArchivedSession(sessionId) {
      const idx = archive.findIndex((s) => s.id === sessionId);
      if (idx < 0) return false;
      const next = archive.filter((s) => s.id !== sessionId);
      await saveArchive(next);
      setArchive(next);
      return true;
    },

    // ─── Credit a manual entry into a live performance ──────────────────
    // When the user logged something earlier in the day (e.g. a 7am
    // ruck) and then starts a session that includes the same exercise,
    // they can fold the manual entry into the live performance with one
    // tap. The manual session is removed from the archive so totals
    // don't double-count. Returns true on success.
    async creditManualEntry(performanceId, manualSessionId) {
      if (!session) return false;
      const manualIdx = archive.findIndex((s) => s.id === manualSessionId);
      if (manualIdx < 0) return false;
      const manual = archive[manualIdx];
      if (!manual?.manual) return false;
      const sourceSets = manual.performances?.[0]?.sets ?? [];
      if (sourceSets.length === 0) return false;

      // Remove the manual entry from the archive first so PR re-annotation
      // on session end doesn't double-count.
      const nextArchive = archive.filter((s) => s.id !== manualSessionId);
      await saveArchive(nextArchive);
      setArchive(nextArchive);

      setSession((s) => {
        if (!s) return s;
        const performances = s.performances.map((p) => {
          if (p.id !== performanceId) return p;
          // Renumber starting after any sets already on the performance
          // (this is the empty-performance case in practice, but be
          // defensive — the banner is suppressed once sets exist anyway).
          const baseIndex = p.sets.length;
          const newSets = sourceSets.map((src, i) => ({
            ...src,
            index: baseIndex + i + 1,
          }));
          return { ...p, sets: [...p.sets, ...newSets] };
        });
        return { ...s, performances };
      });
      return true;
    },

    // ─── Manual log entry (no active session required) ──────────────────
    // Append a one-off completed entry to the archive — e.g. a walk
    // earlier in the day that wasn't tracked live. Bypasses the active
    // session slot so it can't disturb an in-flight workout. The blob is
    // shaped exactly like a normal endSession() output so History,
    // Insights, and intelligence consume it without special-casing.
    //
    // payload = {
    //   exerciseId,
    //   loggedAt: ISO string,
    //   sets: [{ weight, reps, rpe?, unit } | { kind: 'duration', durationSec } | { kind: 'distance', distanceM }],
    //   notes?: string,
    // }
    async addManualLog(payload) {
      if (!payload?.exerciseId || !Array.isArray(payload.sets) || payload.sets.length === 0) {
        return null;
      }
      const when = payload.loggedAt ?? new Date().toISOString();
      const performance = {
        id: ulid(),
        exerciseId: payload.exerciseId,
        sectionKey: 'manual',
        swappedFromId: null,
        addedInSession: true,
        prescription: { sets: '', rest: null },
        notes: payload.notes ?? '',
        sets: payload.sets.map((s, i) => {
          const index = i + 1;
          if (s.kind === 'duration' || s.kind === 'rounds') {
            return {
              index,
              kind: s.kind,
              durationSec: s.durationSec ?? 0,
              side: s.side ?? null,
              restTakenSec: null,
              loggedAt: when,
            };
          }
          if (s.kind === 'distance') {
            return {
              index,
              kind: 'distance',
              distanceM: s.distanceM ?? 0,
              side: s.side ?? null,
              restTakenSec: null,
              loggedAt: when,
            };
          }
          return {
            index,
            weight: s.weight,
            unit: s.unit,
            reps: s.reps,
            rpe: s.rpe ?? null,
            restTakenSec: null,
            loggedAt: when,
          };
        }),
      };
      const completed = annotatePRs(
        {
          id: ulid(),
          programId: 'manual',
          dayKey: 'manual',
          startedAt: when,
          endedAt: when,
          performances: [performance],
          restStartedAt: null,
          restTargetSec: null,
          restPerformanceId: null,
          manual: true,
        },
        archive,
      );
      const next = [...archive, completed];
      await saveArchive(next);
      setArchive(next);
      return completed;
    },

    // ─── Pre-start: add a new section to the current day ─────────────────
    // For an active session: stamps an empty performance into the new
    // section so it renders. Caller supplies the first exercise (mandatory
    // — empty sections can't render without at least one performance).
    addSectionToActiveSession(sectionKey, exercise, sectionTitle = null) {
      if (!sectionKey || !exercise) return;
      setSession((s) => {
        if (!s) return s;
        const exists = s.performances.some((p) => p.sectionKey === sectionKey);
        if (exists) return s;
        const newPerf = {
          id: ulid(),
          exerciseId: exercise.id,
          sectionKey,
          swappedFromId: null,
          addedInSession: true,
          prescription: { sets: exercise.sets, rest: exercise.rest },
          sets: [],
          notes: '',
        };
        const customTitles = { ...(s.customSectionTitles ?? {}) };
        if (sectionTitle) customTitles[sectionKey] = sectionTitle;
        return {
          ...s,
          performances: [...s.performances, newPerf],
          customSectionTitles: customTitles,
        };
      });
    },
  }), [session, archive, hydrated]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
