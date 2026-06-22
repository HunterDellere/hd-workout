// Exercise role — what a movement is *for* in a session, not a rank.
//
// The catalog tags every exercise with a `role`:
//   foundational — the anchor lift for its pattern (do this first, train it hard)
//   primary-alt  — a primary alternative that trains the same job a different way
//   accessory    — supporting volume around the anchors
//
// The vision forbids esports-style tier badges ("S/A/B"), so the UI never
// renders a letter or the word "Tier" — it surfaces these grounded labels
// (on roomy surfaces) or nothing at all (on dense rows). See VISION.md.

export const ROLE_LABEL = {
  foundational: 'Foundational',
  'primary-alt': 'Primary alt',
  accessory: 'Accessory',
};

// Longer form for the exercise-detail eyebrow, where there is room.
export const ROLE_LABEL_LONG = {
  foundational: 'Foundational',
  'primary-alt': 'Primary alternative',
  accessory: 'Accessory',
};

// Sort order: anchors first, then alternatives, then accessories.
export const ROLE_ORDER = {
  foundational: 0,
  'primary-alt': 1,
  accessory: 2,
};

export function roleLabel(role) {
  return ROLE_LABEL[role] ?? '';
}

export function roleRank(role) {
  return ROLE_ORDER[role] ?? 99;
}
