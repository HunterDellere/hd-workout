// Program validation — finds typos and stale references at boot.
//
// `validateProgram(program, catalogByDay)` walks every day → section →
// exercise reference in the program and reports issues:
//   - missing day: program references a dayKey the catalog doesn't define
//   - missing section: program references a sectionKey the catalog day
//     doesn't define
//   - missing exercise: program references an id no catalog entry carries
//
// The function is pure (returns an array of issue objects). The DEV-mode
// wiring in `src/data/index.js` calls it once at module load and
// console.warns each issue. In production it's a no-op.

export function validateProgram(program, catalogByDay) {
  const issues = [];
  if (!program || !program.days) {
    issues.push({ kind: 'malformed', message: 'Program has no `days` map.' });
    return issues;
  }

  // Build a quick {dayKey: {sectionKey: Set<id>}} index from the catalog.
  const catalogIndex = {};
  for (const [dayKey, day] of Object.entries(catalogByDay ?? {})) {
    catalogIndex[dayKey] = {};
    for (const section of day.sections ?? []) {
      catalogIndex[dayKey][section.key] = new Set(
        (section.exercises ?? []).map((e) => e.id),
      );
    }
  }

  for (const [dayKey, sections] of Object.entries(program.days)) {
    const catalogDay = catalogIndex[dayKey];
    if (!catalogDay) {
      issues.push({
        kind: 'missing-day',
        dayKey,
        message: `Program day "${dayKey}" has no matching catalog day.`,
      });
      continue;
    }
    for (const [sectionKey, entries] of Object.entries(sections ?? {})) {
      const catalogSection = catalogDay[sectionKey];
      if (!catalogSection) {
        issues.push({
          kind: 'missing-section',
          dayKey,
          sectionKey,
          message: `Program references section "${dayKey}.${sectionKey}" that the catalog day doesn't define.`,
        });
        continue;
      }
      for (const entry of entries ?? []) {
        if (!entry || !entry.id) {
          issues.push({
            kind: 'malformed-entry',
            dayKey,
            sectionKey,
            message: `Program entry under "${dayKey}.${sectionKey}" is missing an id.`,
          });
          continue;
        }
        if (!catalogSection.has(entry.id)) {
          issues.push({
            kind: 'missing-exercise',
            dayKey,
            sectionKey,
            exerciseId: entry.id,
            message: `Program references exercise "${entry.id}" in "${dayKey}.${sectionKey}" but no catalog entry has that id.`,
          });
        }
      }
    }
  }

  return issues;
}
