// NoteField — inline freeform note on a performance.
//
// Two modes:
//   - Read: shows the note as a quiet body-sm line with a small "edit"
//     mono-chip. If no note exists, shows only a "+ Note" chip.
//   - Edit: textarea + Save / Cancel chips. Empty save clears the note.
//
// Persists through the parent's onSave(text) callback. The component
// stays local-state only; the parent owns persistence.

import { useEffect, useRef, useState } from 'react';
import { Stack, Text, MonoChipButton } from '../../design-system/components';

export function NoteField({ value, onSave, testIdPrefix = 'note' }) {
  // `draft` initializes from `value` whenever editing begins; we don't try
  // to keep `draft` in sync mid-edit. The cancel button restores from
  // `value` directly. This avoids the setState-in-effect anti-pattern.
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const ref = useRef(null);

  function openEdit() {
    setDraft(value ?? '');
    setEditing(true);
  }

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len, len);
    }
  }, [editing]);

  function save() {
    const next = draft.trim();
    if (next !== (value ?? '').trim()) onSave(next);
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  if (editing) {
    return (
      <div data-testid={`${testIdPrefix}-edit`} style={{ marginTop: 12 }}>
        <textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); cancel(); }
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              save();
            }
          }}
          placeholder="Anything worth remembering — form cue, soreness, bar shift…"
          aria-label="Performance note"
          rows={2}
          style={{
            width: '100%',
            minHeight: 56,
            padding: '10px 12px',
            border: '1px solid var(--border-strong)',
            borderRadius: 6,
            background: 'var(--surface-page)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
          }}
        />
        <Stack direction="row" gap={2} style={{ marginTop: 8 }}>
          <MonoChipButton data-testid={`${testIdPrefix}-save`} onClick={save}>
            Save
          </MonoChipButton>
          <MonoChipButton data-testid={`${testIdPrefix}-cancel`} onClick={cancel}>
            Cancel
          </MonoChipButton>
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ alignSelf: 'center', textTransform: 'uppercase' }}>
            ⌘↵ to save · esc to cancel
          </Text>
        </Stack>
      </div>
    );
  }

  if (value && value.trim()) {
    return (
      <div data-testid={`${testIdPrefix}-view`} style={{ marginTop: 12 }}>
        <Stack direction="row" align="flex-start" gap={2}>
          <Text
            as="p"
            variant="body-sm"
            tone="secondary"
            style={{
              flex: 1,
              minWidth: 0,
              whiteSpace: 'pre-wrap',
              fontStyle: 'italic',
              fontFamily: 'var(--font-serif)',
              opacity: 0.85,
            }}
          >
            “{value}”
          </Text>
          <MonoChipButton
            data-testid={`${testIdPrefix}-edit-btn`}
            onClick={openEdit}
            aria-label="Edit note"
          >
            Edit
          </MonoChipButton>
        </Stack>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      <MonoChipButton
        variant="dashed"
        data-testid={`${testIdPrefix}-add-btn`}
        onClick={() => setEditing(true)}
      >
        + Note
      </MonoChipButton>
    </div>
  );
}
