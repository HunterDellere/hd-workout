// Context object + helpers for the session store. Separate from the .jsx
// Provider for React Fast Refresh hygiene.

import { createContext, useContext } from 'react';

export const SessionContext = createContext(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

export function totalLoggedSets(session) {
  if (!session) return 0;
  return session.performances.reduce((acc, p) => acc + p.sets.length, 0);
}

export function lastLoggedAt(session) {
  if (!session) return null;
  let max = null;
  for (const p of session.performances) {
    for (const s of p.sets) {
      if (!max || s.loggedAt > max) max = s.loggedAt;
    }
  }
  return max;
}
