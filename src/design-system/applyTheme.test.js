import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredTheme, setTheme } from './applyTheme.js';

describe('theme controller', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to "system" when storage is empty', () => {
    expect(getStoredTheme()).toBe('system');
  });

  it('returns stored value when valid', () => {
    localStorage.setItem('hd:theme', 'dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('falls back to "system" for unknown values', () => {
    localStorage.setItem('hd:theme', 'midnight');
    expect(getStoredTheme()).toBe('system');
  });

  it('setTheme persists and applies data-theme attr', () => {
    setTheme('light');
    expect(localStorage.getItem('hd:theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('setTheme("system") clears the data-theme attr', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    setTheme('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('setTheme rejects invalid input as a no-op', () => {
    setTheme('dark');
    setTheme('neon');
    expect(localStorage.getItem('hd:theme')).toBe('dark');
  });
});
