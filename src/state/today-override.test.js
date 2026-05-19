import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SETTINGS,
  effectiveTodayKey,
  localDateKey,
} from './settings-context.js';

function buildSettings(patch = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...patch,
    split: { ...DEFAULT_SETTINGS.split, ...(patch.split ?? {}) },
  };
}

describe('effectiveTodayKey', () => {
  it('falls through to the scheduled split when no override is set', () => {
    const settings = buildSettings();
    // Monday in DEFAULT_SETTINGS is 'push'.
    const monday = new Date(2026, 0, 5, 9, 0, 0);
    const result = effectiveTodayKey(settings, monday);
    expect(result.dayKey).toBe('push');
    expect(result.scheduledKey).toBe('push');
    expect(result.fromOverride).toBe(false);
  });

  it('honours an override stamped with today\'s local date', () => {
    const monday = new Date(2026, 0, 5, 9, 0, 0);
    const settings = buildSettings({
      todayOverride: { date: localDateKey(monday), dayKey: 'recovery' },
    });
    const result = effectiveTodayKey(settings, monday);
    expect(result.dayKey).toBe('recovery');
    expect(result.fromOverride).toBe(true);
    expect(result.scheduledKey).toBe('push');
  });

  it('ignores an override stamped with a different date', () => {
    const monday = new Date(2026, 0, 5, 9, 0, 0);
    const tuesday = new Date(2026, 0, 6, 9, 0, 0);
    const settings = buildSettings({
      todayOverride: { date: localDateKey(monday), dayKey: 'recovery' },
    });
    const result = effectiveTodayKey(settings, tuesday);
    expect(result.dayKey).toBe('pull');       // scheduled Tuesday
    expect(result.fromOverride).toBe(false);
    expect(result.scheduledKey).toBe('pull');
  });

  it('honours an override even when the scheduled day is rest', () => {
    // Sunday → 'rest' by default. Lifter swaps in a Push workout.
    const sunday = new Date(2026, 0, 4, 9, 0, 0);
    const settings = buildSettings({
      todayOverride: { date: localDateKey(sunday), dayKey: 'push' },
    });
    const result = effectiveTodayKey(settings, sunday);
    expect(result.dayKey).toBe('push');
    expect(result.fromOverride).toBe(true);
    expect(result.scheduledKey).toBe('rest');
  });

  it('treats a null override as absent', () => {
    const settings = buildSettings({ todayOverride: null });
    const result = effectiveTodayKey(settings, new Date(2026, 0, 5, 9, 0, 0));
    expect(result.fromOverride).toBe(false);
  });

  it('exposes both keys so the UI can flag a swap and offer revert', () => {
    const monday = new Date(2026, 0, 5, 9, 0, 0);
    const settings = buildSettings({
      todayOverride: { date: localDateKey(monday), dayKey: 'recovery' },
    });
    const { dayKey, scheduledKey } = effectiveTodayKey(settings, monday);
    expect(dayKey).not.toBe(scheduledKey);
  });
});
