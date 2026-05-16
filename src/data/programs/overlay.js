// Program overlay — per-user edits on top of a program template.
//
// Phase 4 slice 2: scaffold. The shape is finalized; the hydration path in
// `src/data/index.js` applies overlays at hydrate time so consumers see
// the user's edits transparently. No UI surface yet — slice 3 ships the
// fork-and-edit settings page.
//
// Overlay shape:
//
//   {
//     [programKey]: {
//       [dayKey]: {
//         [sectionKey]: {
//           [exerciseId]: {              // per-exercise field overrides
//             sets?: string,
//             rest?: string,
//             hidden?: true,             // omit this exercise from the day
//           },
//           __order?: string[],          // explicit order; ids appended in
//                                        // declared order then any new ones
//                                        // from the overlay are pushed
//                                        // (defer for slice 3)
//         },
//       },
//     },
//   }
//
// Slice 2 supports the per-exercise `sets`, `rest`, and `hidden` fields.
// `__order` and section-add are out of scope until the UI lands.

const EMPTY = Object.freeze({});

export function emptyOverlay() {
  return {};
}

// Returns a *new* program object with the overlay applied. Pure — original
// program is untouched. Missing overlay fields fall through to the program
// default.
export function applyOverlay(program, overlay) {
  if (!program) return program;
  const programOverlay = overlay?.[program.key];
  if (!programOverlay) return program;

  const days = {};
  for (const [dayKey, sections] of Object.entries(program.days ?? {})) {
    const dayOverlay = programOverlay[dayKey] ?? EMPTY;
    const nextSections = {};
    for (const [sectionKey, entries] of Object.entries(sections ?? {})) {
      const sectionOverlay = dayOverlay[sectionKey] ?? EMPTY;
      const nextEntries = [];
      for (const entry of entries ?? []) {
        const exOverlay = sectionOverlay[entry.id];
        if (exOverlay?.hidden) continue;
        if (!exOverlay) {
          nextEntries.push(entry);
        } else {
          nextEntries.push({
            ...entry,
            ...(exOverlay.sets ? { sets: exOverlay.sets } : null),
            ...(exOverlay.rest ? { rest: exOverlay.rest } : null),
          });
        }
      }
      nextSections[sectionKey] = nextEntries;
    }
    days[dayKey] = nextSections;
  }

  return { ...program, days };
}
