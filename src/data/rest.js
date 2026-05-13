// Rest-day data: the calm-coach voice for non-training days.
// Active-rest options are suggestions, not prescriptions — pick by feel.

export const REST_DAY = {
  key: 'rest',
  name: 'Rest',
  subtitle: 'Active or full',
  description: 'No lifting today.',
};

export const ACTIVE_REST_ACTIVITIES = [
  { key: 'walk',      name: 'Walk',          detail: '30–60 min, easy pace.' },
  { key: 'hike',      name: 'Hike',          detail: 'Trail or hills.' },
  { key: 'swim',      name: 'Swim',          detail: 'Easy laps or open water.' },
  { key: 'kayak',     name: 'Kayak',         detail: 'Flat water; paddle without pushing.' },
  { key: 'bike',      name: 'Easy bike',     detail: 'Conversational pace.' },
  { key: 'ping-pong', name: 'Ping pong',     detail: 'Or any racquet sport.' },
  { key: 'yoga',      name: 'Yoga',          detail: 'Gentle flow or yin.' },
  { key: 'mobility',  name: 'Mobility flow', detail: '15–20 min through your stiffest joints.' },
];
