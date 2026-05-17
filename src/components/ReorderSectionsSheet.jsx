// ReorderSectionsSheet — bottom sheet for reordering a day's sections.
// Renders each section as a row with up / down arrow chips and a position
// number. Apply commits to the overlay via setSectionOrder.
//
// Design rationale: not drag-and-drop. DnD on touch + keyboard accessibility
// is a project on its own; up/down arrows give the same outcome in two
// taps with a fully accessible click target. The user said "bulk reorder
// modal" and that's exactly what this is.

import { useState } from 'react';
import {
  Sheet,
  Stack,
  Text,
  Button,
  BrushDivider,
  MonoChipButton,
} from '../design-system/components';

function ReorderSheetBody({ sections, onClose, onSave }) {
  // Local draft mounted fresh each time the sheet opens (the parent
  // returns null when closed), so a simple useState lazy initializer
  // is the right shape — no syncing effect needed.
  const [draft, setDraft] = useState(() => sections ?? []);

  function move(idx, delta) {
    setDraft((d) => {
      const next = idx + delta;
      if (next < 0 || next >= d.length) return d;
      const out = [...d];
      [out[idx], out[next]] = [out[next], out[idx]];
      return out;
    });
  }

  function reset() {
    setDraft(sections ?? []);
  }

  const dirty = draft.some((s, i) => s.key !== sections?.[i]?.key);

  return (
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
            Reorder
          </Text>
          <Text as="h2" variant="display-lg" style={{ fontStyle: 'italic', marginTop: 6 }}>
            Section order
          </Text>
          <Text as="p" variant="body-md" tone="secondary" style={{ marginTop: 8, maxWidth: 60 * 9 }}>
            Move sections up or down. The order persists across reloads
            and applies whenever you start this day's session.
          </Text>
        </Stack>

        <BrushDivider style={{ marginTop: 32 }} />

        <ol
          data-testid="reorder-list"
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '24px 0 0',
            counterReset: 'sec',
          }}
        >
          {draft.map((section, idx) => (
            <li
              key={section.key}
              data-testid="reorder-row"
              data-section-key={section.key}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                columnGap: 16,
                alignItems: 'center',
                padding: '12px 0',
                borderTop: idx === 0 ? 'none' : '1px solid var(--border-hairline)',
              }}
            >
              <Text
                as="span"
                variant="mono-sm"
                tone="tertiary"
                style={{ textTransform: 'uppercase', width: 22, textAlign: 'right' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </Text>
              <Stack direction="column" gap={1} style={{ minWidth: 0 }}>
                <Text as="span" variant="title-md">{section.title ?? section.key}</Text>
                <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
                  {section.exercises?.length ?? 0} exercise{(section.exercises?.length ?? 0) === 1 ? '' : 's'}
                </Text>
              </Stack>
              <Stack direction="row" gap={1}>
                <button
                  type="button"
                  aria-label={`Move ${section.title ?? section.key} up`}
                  data-testid="reorder-up"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  style={arrowStyle(idx === 0)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Move ${section.title ?? section.key} down`}
                  data-testid="reorder-down"
                  onClick={() => move(idx, +1)}
                  disabled={idx === draft.length - 1}
                  style={arrowStyle(idx === draft.length - 1)}
                >
                  ↓
                </button>
              </Stack>
            </li>
          ))}
        </ol>

        <Stack direction="row" gap={3} style={{ marginTop: 32, flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => {
              onSave(draft.map((s) => s.key));
              onClose();
            }}
            disabled={!dirty}
            data-testid="reorder-save"
          >
            Save order
          </Button>
          <Button
            type="button"
            variant="bare"
            size="md"
            onClick={onClose}
            data-testid="reorder-cancel"
          >
            Cancel
          </Button>
          {dirty && (
            <MonoChipButton onClick={reset} data-testid="reorder-reset">
              Reset
            </MonoChipButton>
          )}
        </Stack>
      </div>
  );
}

export function ReorderSectionsSheet({ open, onClose, sections, onSave }) {
  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Reorder sections">
      {/* The body is keyed by the section-id signature so a re-open
          with different sections rebuilds the local draft. Mounted
          only when open — keeps useState lazy init clean. */}
      {open && (
        <ReorderSheetBody
          key={(sections ?? []).map((s) => s.key).join('|')}
          sections={sections}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Sheet>
  );
}

function arrowStyle(disabled) {
  return {
    all: 'unset',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: 44,
    height: 44,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-hairline)',
    borderRadius: 6,
    color: disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 18,
    opacity: disabled ? 0.4 : 1,
  };
}
