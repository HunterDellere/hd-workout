// AddGroupSheet — bottom sheet to name a new mid-session section.
// Replaces the window.prompt that previously interrupted the page chrome.
// The user names the group (e.g. "Cardio"); the caller then opens the
// SlotPicker to pick the first exercise for the new section.

import { useEffect, useRef, useState } from 'react';
import { Sheet, Stack, Text, BrushDivider, Button } from '../design-system/components';

const SUGGESTIONS = ['Cardio', 'Mobility', 'Imbalance', 'Core finisher', 'Warm-up'];

export function AddGroupSheet({ open, onClose, onSubmit }) {
  // The sheet is unmounted when closed (the parent returns null), so a
  // fresh open always gets a fresh `useState('')` — no need for an
  // effect-driven reset.
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    // Autofocus after the sheet animation settles.
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Name a new group">
      <div
        style={{
          padding: '20px 24px 96px',
          background: 'var(--surface-page)',
          color: 'var(--text-primary)',
          minHeight: '100%',
        }}
      >
        <Stack direction="column" gap={1}>
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
            New group
          </Text>
          <Text as="h2" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 6 }}>
            What's it called?
          </Text>
        </Stack>

        <BrushDivider style={{ marginTop: 32 }} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          style={{ marginTop: 24 }}
        >
          <input
            ref={inputRef}
            type="text"
            data-testid="add-group-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cardio"
            aria-label="Group name"
            maxLength={40}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'var(--surface-page)',
              border: '1px solid var(--border-strong)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 17,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          <Stack direction="row" gap={2} style={{ marginTop: 16, flexWrap: 'wrap' }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setName(s)}
                data-testid={`add-group-suggest-${s.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                }}
              >
                {s}
              </button>
            ))}
          </Stack>

          <Stack direction="row" gap={3} style={{ marginTop: 28 }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!name.trim()}
              data-testid="add-group-submit"
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="bare"
              size="md"
              onClick={onClose}
              data-testid="add-group-cancel"
            >
              Cancel
            </Button>
          </Stack>
        </form>
      </div>
    </Sheet>
  );
}
