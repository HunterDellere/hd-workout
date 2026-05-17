// Bodyweight provider. Same load/save shape as the other stores: read
// from IDB on mount, save on every change. Latest-wins per date — a
// second log on the same day replaces the earlier entry, not appends.

import { useEffect, useMemo, useState } from 'react';
import { BodyweightContext, todayIso } from './bodyweight-context.js';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../data/storage';

function sortByDate(log) {
  return [...log].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function upsert(log, entry) {
  const without = log.filter((e) => e.date !== entry.date);
  return sortByDate([...without, entry]);
}

export function BodyweightProvider({ children }) {
  const [log, setLog] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadFromStorage(STORAGE_KEYS.bodyweight, []).then((value) => {
      if (cancelled) return;
      setLog(Array.isArray(value) ? sortByDate(value) : []);
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.bodyweight, log);
  }, [log, hydrated]);

  const value = useMemo(() => ({
    log,
    hydrated,

    // Log a bodyweight entry. Date defaults to today (local). Value must
    // be a finite positive number; bad input is ignored silently rather
    // than throwing — the UI gates submit on validity already.
    logEntry({ value: v, unit = 'kg', date } = {}) {
      if (!Number.isFinite(v) || v <= 0) return;
      const entry = {
        date: date ?? todayIso(),
        value: Math.round(v * 100) / 100, // 2dp
        unit,
        loggedAt: new Date().toISOString(),
      };
      setLog((cur) => upsert(cur, entry));
    },

    deleteEntry(date) {
      setLog((cur) => cur.filter((e) => e.date !== date));
    },

    clearAll() {
      setLog([]);
    },
  }), [log, hydrated]);

  return <BodyweightContext.Provider value={value}>{children}</BodyweightContext.Provider>;
}
