import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { WarmupCard } from './WarmupCard';

// Use real catalog ids so findExerciseById resolves names. These three
// are present in every active program's recovery catalog; if they ever
// move/rename, this test fails loudly.
const SAMPLE_WARMUP = [
  { id: 'rec-band-pull-apart',   sets: '2 × 15',          rest: '0:20' },
  { id: 'rec-thoracic-rotation', sets: '6 each side',     rest: '0:20' },
];

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('WarmupCard', () => {
  it('renders nothing for an empty or missing warmup list', () => {
    const { container: c1 } = render(
      <WarmupCard warmup={null} sessionId="s1" accent="moss" hasLoggedAny={false} />,
    );
    expect(c1.firstChild).toBeNull();
    cleanup();
    const { container: c2 } = render(
      <WarmupCard warmup={[]} sessionId="s1" accent="moss" hasLoggedAny={false} />,
    );
    expect(c2.firstChild).toBeNull();
  });

  it('renders the expanded card with each drill name and prescription by default', () => {
    render(
      <WarmupCard
        warmup={SAMPLE_WARMUP}
        sessionId="s-fresh"
        accent="moss"
        hasLoggedAny={false}
      />,
    );
    const card = screen.getByTestId('warmup-card');
    expect(card.getAttribute('data-state')).toBe('expanded');
    expect(screen.getAllByTestId('warmup-drill')).toHaveLength(2);
    // Drill rows carry the canonical name from the catalog.
    expect(screen.getByText(/Band Pull-Apart/i)).toBeTruthy();
    expect(screen.getByText('2 × 15')).toBeTruthy();
  });

  it('tapping "× Hide warmup" collapses to a single-line summary', () => {
    render(
      <WarmupCard
        warmup={SAMPLE_WARMUP}
        sessionId="s-collapse"
        accent="moss"
        hasLoggedAny={false}
      />,
    );
    fireEvent.click(screen.getByTestId('warmup-card-hide'));
    expect(screen.getByTestId('warmup-card').getAttribute('data-state')).toBe('hidden');
    expect(screen.queryByTestId('warmup-drill')).toBeNull();
    // The collapsed summary describes the drill count + time estimate.
    expect(screen.getByTestId('warmup-card-show').textContent).toMatch(/Warmup.*2 drill/);
  });

  it('tapping "+ Show" on a collapsed card re-expands it', () => {
    render(
      <WarmupCard
        warmup={SAMPLE_WARMUP}
        sessionId="s-toggle"
        accent="moss"
        hasLoggedAny={false}
      />,
    );
    fireEvent.click(screen.getByTestId('warmup-card-hide'));
    fireEvent.click(screen.getByTestId('warmup-card-show'));
    expect(screen.getByTestId('warmup-card').getAttribute('data-state')).toBe('expanded');
    expect(screen.getAllByTestId('warmup-drill')).toHaveLength(2);
  });

  it('persists collapsed state in localStorage keyed by sessionId', () => {
    render(
      <WarmupCard
        warmup={SAMPLE_WARMUP}
        sessionId="session-abc"
        accent="moss"
        hasLoggedAny={false}
      />,
    );
    fireEvent.click(screen.getByTestId('warmup-card-hide'));
    expect(window.localStorage.getItem('warmupCard:session-abc')).toBe('hidden');
  });

  it('starts collapsed when localStorage carries a hidden state from a prior render', () => {
    window.localStorage.setItem('warmupCard:session-zzz', 'hidden');
    render(
      <WarmupCard
        warmup={SAMPLE_WARMUP}
        sessionId="session-zzz"
        accent="moss"
        hasLoggedAny={false}
      />,
    );
    expect(screen.getByTestId('warmup-card').getAttribute('data-state')).toBe('hidden');
  });

  it('auto-collapses once the user has logged a working set', () => {
    const { rerender } = render(
      <WarmupCard
        warmup={SAMPLE_WARMUP}
        sessionId="s-autohide"
        accent="moss"
        hasLoggedAny={false}
      />,
    );
    expect(screen.getByTestId('warmup-card').getAttribute('data-state')).toBe('expanded');
    rerender(
      <WarmupCard
        warmup={SAMPLE_WARMUP}
        sessionId="s-autohide"
        accent="moss"
        hasLoggedAny={true}
      />,
    );
    expect(screen.getByTestId('warmup-card').getAttribute('data-state')).toBe('hidden');
    // Auto-collapse is derived from hasLoggedAny, NOT mirrored to storage.
    // On reload, hasLoggedAny will be true again (it's a function of the
    // session's logged sets), so the hidden state re-derives naturally.
    expect(window.localStorage.getItem('warmupCard:s-autohide')).toBeNull();
  });

  it('does NOT auto-collapse a card the user has explicitly Shown after logging', () => {
    window.localStorage.setItem('warmupCard:s-keep', 'expanded');
    render(
      <WarmupCard
        warmup={SAMPLE_WARMUP}
        sessionId="s-keep"
        accent="moss"
        hasLoggedAny={true}
      />,
    );
    // Explicit 'expanded' is a deliberate user choice — auto-collapse
    // must not stomp it.
    expect(screen.getByTestId('warmup-card').getAttribute('data-state')).toBe('expanded');
  });

  describe('readOnly mode (preview surfaces)', () => {
    it('renders expanded with no Hide affordance and never writes to localStorage', () => {
      render(
        <WarmupCard
          warmup={SAMPLE_WARMUP}
          accent="moss"
          readOnly
        />,
      );
      expect(screen.getByTestId('warmup-card').getAttribute('data-state')).toBe('expanded');
      expect(screen.queryByTestId('warmup-card-hide')).toBeNull();
      // Nothing about the read-only render should touch localStorage.
      expect(window.localStorage.length).toBe(0);
    });

    it('stays expanded even when hasLoggedAny is true', () => {
      render(
        <WarmupCard
          warmup={SAMPLE_WARMUP}
          accent="moss"
          hasLoggedAny={true}
          readOnly
        />,
      );
      expect(screen.getByTestId('warmup-card').getAttribute('data-state')).toBe('expanded');
    });
  });
});
