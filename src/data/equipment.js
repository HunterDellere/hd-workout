// Equipment classifier — maps free-form catalog `equipment` strings to a
// normalized set of equipment categories the user can toggle on/off in
// settings.
//
// Why classify instead of restructuring the catalog: the catalog's
// equipment strings are written for humans ("Adjustable bench at 30–45°",
// "Dual cable column", "Hammer Strength press OR converging plate-loaded
// press"). Replacing them with structured tags would lose precision. A
// substring classifier keeps the human-readable text and gives the
// filtering layer a reliable boolean to work with.
//
// An exercise is "excluded" if EVERY required equipment string maps to
// at least one excluded category. An exercise whose equipment is purely
// bodyweight, or whose categories don't overlap excludedEquipment at
// all, always passes.

export const EQUIPMENT_CATEGORIES = [
  { key: 'barbell',      label: 'Barbell',        hint: 'Olympic barbells + plates.' },
  { key: 'dumbbell',     label: 'Dumbbells',      hint: 'Adjustable or fixed pairs.' },
  { key: 'cable',        label: 'Cable machine',  hint: 'Stack with attachments.' },
  { key: 'machine',      label: 'Plate / pin machines', hint: 'Leg press, hack squat, hamstring curl, etc.' },
  { key: 'rack',         label: 'Power rack',     hint: 'Squat rack with safeties.' },
  { key: 'bench',        label: 'Adjustable bench', hint: 'Flat / incline bench.' },
  { key: 'pull-up-bar',  label: 'Pull-up bar',    hint: 'Bar or rings for hanging work.' },
  { key: 'band',         label: 'Resistance band', hint: 'Loop or tube bands.' },
];

const RULES = [
  { category: 'barbell',     match: [/\bbarbell\b/i, /\bbb\b/i, /\bolympic bar\b/i, /\bdeadlift bar\b/i] },
  { category: 'dumbbell',    match: [/\bdumbbell/i, /\bdumbbells\b/i, /\bdb\b/i] },
  { category: 'cable',       match: [/\bcable\b/i, /\bcable column\b/i, /\bd-handle\b/i, /\brope\b/i] },
  { category: 'machine',     match: [
    /\bmachine\b/i, /\bleg press\b/i, /\bhack squat\b/i, /\bsmith\b/i, /\bhammer strength\b/i,
    /\bplate-loaded\b/i, /\bselectorized\b/i, /\bpec deck\b/i, /\bleg extension\b/i,
    /\bhamstring curl\b/i, /\bglute kickback\b/i, /\babduction\b/i, /\badduction\b/i,
    /\bback extension\b/i, /\bseated row\b/i,
  ] },
  { category: 'rack',        match: [/\bpower rack\b/i, /\bsquat rack\b/i, /\brack with safeties\b/i] },
  { category: 'bench',       match: [/\bbench\b/i] },
  { category: 'pull-up-bar', match: [/\bpull-up bar\b/i, /\bchin-up bar\b/i, /\brings?\b/i] },
  { category: 'band',        match: [/\bband\b/i, /\bresistance band\b/i, /\btube\b/i] },
];

// Strings that mean "no equipment / optional support / consumable" — these
// should never block an exercise. Used to short-circuit classifyOne.
const NEUTRAL_PATTERNS = [
  /^none$/i,
  /^optional/i,
  /^mat$/i,
  /^foam roller$/i,
  /^open floor$/i,
  /^walking surface$/i,
  /^towel/i,
  /^gum/i,
  /^plate (\(|hangs|on)/i, // "Light plate (2.5–5 kg)" — neck training etc.
];

function isNeutral(str) {
  return NEUTRAL_PATTERNS.some((re) => re.test(str.trim()));
}

// Return the set of normalized categories matched by a single free-form
// equipment string. Neutral strings return an empty set.
export function classifyOne(equipmentString) {
  if (!equipmentString || typeof equipmentString !== 'string') return new Set();
  if (isNeutral(equipmentString)) return new Set();
  const matches = new Set();
  for (const rule of RULES) {
    if (rule.match.some((re) => re.test(equipmentString))) {
      matches.add(rule.category);
    }
  }
  return matches;
}

// Classify an exercise's full equipment list into the union of categories.
// Skips neutral strings. Bench is annotated as a "soft" requirement —
// if the exercise's only equipment is a bench plus dumbbells, excluding
// just the bench will still hide it (because the bench is essential to
// the movement); but excluding the bench alone won't hide a dumbbell
// row that lists "Bench OR floor" as one option string.
export function classifyExercise(exercise) {
  if (!exercise?.equipment || !Array.isArray(exercise.equipment)) return new Set();
  const all = new Set();
  for (const str of exercise.equipment) {
    for (const cat of classifyOne(str)) {
      all.add(cat);
    }
  }
  return all;
}

// Predicate: should this exercise be excluded given the user's settings?
// An exercise is excluded when ANY of its classified categories is in
// the excludedEquipment set. (i.e. "I don't have a barbell" hides every
// exercise that requires a barbell — even if it also requires other gear.)
//
// Bodyweight or neutral-equipment exercises are NEVER excluded.
export function isExerciseExcludedByEquipment(exercise, excludedEquipment) {
  if (!excludedEquipment || excludedEquipment.length === 0) return false;
  const categories = classifyExercise(exercise);
  if (categories.size === 0) return false;
  for (const exc of excludedEquipment) {
    if (categories.has(exc)) return true;
  }
  return false;
}
