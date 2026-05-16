// useLongGap — returns { hours } when the session has been idle for ≥4 hours,
// otherwise null. `referenceTime` is the timestamp of the last activity
// (e.g. last logged set, or session start). Pure derivation over wall-clock.

import { useEffect, useState } from 'react';

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export function useLongGap(referenceTime) {
  const [longGap, setLongGap] = useState(null);

  useEffect(() => {
    function tick() {
      if (!referenceTime) {
        setLongGap((prev) => (prev === null ? prev : null));
        return;
      }
      const ageMs = Date.now() - new Date(referenceTime).getTime();
      if (ageMs < FOUR_HOURS_MS) {
        setLongGap((prev) => (prev === null ? prev : null));
        return;
      }
      const hours = Math.floor(ageMs / (60 * 60 * 1000));
      setLongGap((prev) => (prev && prev.hours === hours ? prev : { hours }));
    }
    const id = setTimeout(tick, 0);
    const tickId = setInterval(tick, 60_000);
    return () => { clearTimeout(id); clearInterval(tickId); };
  }, [referenceTime]);

  return longGap;
}
