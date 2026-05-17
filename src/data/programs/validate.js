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

  // Build a quick {dayKey: {sectionKey: ...}} index from the catalog,
  // and a flat global set of every exercise id across all days. Programs
  // are allowed to pull exercises across day files (e.g., a `rec-*`
  // entry showing up in a push-day section) — what the validator cares
  // about is whether the section key exists on that catalog day AND
  // whether the referenced exercise id exists *somewhere* in the
  // catalog.
  const catalogIndex = {};
  const allCatalogIds = new Set();
  for (const [dayKey, day] of Object.entries(catalogByDay ?? {})) {
    catalogIndex[dayKey] = new Set();
    for (const section of day.sections ?? []) {
      catalogIndex[dayKey].add(section.key);
      for (const ex of section.exercises ?? []) {
        allCatalogIds.add(ex.id);
      }
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
      if (!catalogDay.has(sectionKey)) {
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
        // Programs can borrow exercises across day files (a recovery
        // movement showing up in a push warmup section, a leg carry
        // serving as a core finisher). What matters is the id exists
        // somewhere in the catalog.
        if (!allCatalogIds.has(entry.id)) {
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
