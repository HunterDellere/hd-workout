// Per-user program overlay context.
//
// Phase 4 slice 2-3: the overlay is the user's persistent edits to a
// program template. Today it's used for pre-start day editing on /today
// (swap, remove, add). Future slices add fork-and-edit settings, swap
// constraints, etc.
//
// Shape:
//   {
//     [programKey]: {
//       [dayKey]: {
//         [sectionKey]: {
//           [exerciseId]: { sets?: string, rest?: string, hidden?: true },
//           __added?: Array<{ id, sets, rest }>, // appended at section tail
//         },
//       },
//     },
//   }
//
// `applyOverlay` (data/programs/overlay.js) applies the per-exercise
// overrides + `hidden` to a program. The `__added` list is applied in this
// file's hydrate path (it interacts with the catalog).

import { createContext, useContext } from 'react';

export const OverlayContext = createContext(null);

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay must be used inside <OverlayProvider>');
  return ctx;
}
