// FavoriteStar — toggle button for marking an exercise as a favorite.
// Persists via settings.favoriteExerciseIds. Same 36×36 affordance as
// the sheet's Close button so they sit comfortably next to each other.

import { useSettings } from '../state/settings-context.js';

function StarPath({ filled }) {
  // A bespoke 5-point star path. Filled vs outline distinguishes state.
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3 L14.6 9.2 L21 9.9 L16 14.3 L17.5 21 L12 17.5 L6.5 21 L8 14.3 L3 9.9 L9.4 9.2 Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FavoriteStar({ exerciseId, size = 36 }) {
  const { settings, toggleFavorite } = useSettings();
  const favorited = (settings.favoriteExerciseIds ?? []).includes(exerciseId);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(exerciseId)}
      aria-pressed={favorited}
      aria-label={favorited ? 'Unfavorite exercise' : 'Favorite exercise'}
      data-testid="favorite-star"
      data-exercise-id={exerciseId}
      data-favorited={favorited ? '1' : '0'}
      style={{
        flexShrink: 0,
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1px solid var(--border-hairline)',
        color: favorited ? 'var(--accent-ember-ink, var(--accent-rust-ink))' : 'var(--text-secondary)',
        borderRadius: 999,
        cursor: 'pointer',
        padding: 0,
        transition: 'color 160ms ease',
      }}
    >
      <StarPath filled={favorited} />
    </button>
  );
}
