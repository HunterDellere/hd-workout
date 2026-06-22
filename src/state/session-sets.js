// Pure set-index helpers for the session store. Kept out of session.jsx
// so React Fast Refresh stays happy (that file only exports the provider
// component + context).

// Remove the set at `setIndex` from a sets array and renumber the
// survivors 1..N so indices are always contiguous and unique. logSet
// derives the next index from existing indices, so a gap left by a
// mid-list discard would otherwise let a later set reuse an existing
// index — colliding React keys and mis-targeting PR/animation lookups.
export function removeAndRenumberSets(sets, setIndex) {
  return (sets ?? [])
    .filter((set) => set.index !== setIndex)
    .map((set, i) => ({ ...set, index: i + 1 }));
}

// Next 1-based set index for a performance. Derived from the max existing
// index rather than the array length so it stays correct even if some path
// leaves a non-contiguous list.
export function nextSetIndex(sets) {
  return (sets ?? []).reduce((m, x) => Math.max(m, x.index ?? 0), 0) + 1;
}
