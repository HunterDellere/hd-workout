// Bodyweight store — separate context from session/settings/overlay so
// the data lives independently of training state. Latest-wins per day.
//
// Shape:
//   [{ date: 'YYYY-MM-DD', value: number, unit: 'kg'|'lb', loggedAt: ISO }]
// Sorted by date ascending. One entry per date max.

import { createContext, useContext } from 'react';

export const BodyweightContext = createContext(null);

export function useBodyweight() {
  const ctx = useContext(BodyweightContext);
  if (!ctx) throw new Error('useBodyweight must be used inside <BodyweightProvider>');
  return ctx;
}

export function todayIso(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function latestEntry(log) {
  if (!Array.isArray(log) || log.length === 0) return null;
  return log[log.length - 1];
}
