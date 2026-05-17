// PreviewSection — one section of the pre-start preview. Lists the
// programmed exercises with tier mark, sets prescription, and per-row
// Swap / Remove + a section-level "+ Add exercise" affordance.
//
// Wave 6.2: when there are hidden exercises in this section, a quiet
// "+ Show N hidden" footer chip lets the user restore them one at a time
// (per-row undo of the wholesale Reset day). Tapping it expands an inline
// list of hidden exercises; each row is tappable to un-hide.

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stack, Text, MonoChipButton } from '../../design-system/components';

export function PreviewSection({
  section,
  accent,
  addedIds,
  hiddenExercises = [],
  hasOverlay = false,
  onSwapExercise,
  onRemoveExercise,
  onUnhideExercise,
  onAddExercise,
  onResetSection,
}) {
  const [hiddenExpanded, setHiddenExpanded] = useState(false);
  const { pathname } = useLocation();
  return (
    <div
      data-testid="preview-section"
      data-section-key={section.key}
      style={{ marginTop: 32 }}
    >
      <Stack direction="row" align="baseline" justify="space-between" gap={2}>
        <Stack direction="row" align="center" gap={2}>
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 14,
              height: 1,
              background: `var(--accent-${accent}-solid)`,
              opacity: 0.7,
            }}
          />
          <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {section.title}
          </Text>
        </Stack>
        <Stack direction="row" align="center" gap={2}>
          {hasOverlay && onResetSection && (
            <MonoChipButton
              data-testid="preview-reset-section"
              data-section-key={section.key}
              aria-label={`Reset ${section.title}`}
              onClick={() => onResetSection(section.key)}
            >
              Reset
            </MonoChipButton>
          )}
          <Text as="div" variant="mono-sm" tone="tertiary">
            {section.exercises.length}
          </Text>
        </Stack>
      </Stack>
      {section.blurb && (
        <Text as="p" variant="body-sm" tone="secondary" style={{ marginTop: 8, maxWidth: 60 * 9 }}>
          {section.blurb}
        </Text>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0' }}>
        {section.exercises.map((ex, i) => (
          <li
            key={ex.id}
            data-testid="preview-row"
            data-exercise-id={ex.id}
            className="preview-row"
            style={{
              display: 'grid',
              // Single line: tier · name · sets · actions (actions only visible
              // on hover/focus or when row is selected — keeps the row dense).
              gridTemplateColumns: 'auto 1fr auto auto',
              columnGap: 12,
              padding: '10px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
              alignItems: 'baseline',
            }}
          >
            {ex.tier ? (
              <Text
                as="span"
                variant="mono-sm"
                style={{
                  width: 12,
                  color: ex.tier === 'S'
                    ? `var(--accent-${accent}-ink)`
                    : 'var(--text-tertiary)',
                  opacity: ex.tier === 'S' ? 0.95 : 0.55,
                  fontWeight: 600,
                  fontSize: 10,
                }}
              >
                {ex.tier}
              </Text>
            ) : <span style={{ width: 12 }} />}
            <Text
              as={Link}
              to={`/library/exercises/${ex.id}`}
              state={{ from: pathname }}
              variant="body-md"
              data-testid="preview-name-link"
              data-exercise-id={ex.id}
              style={{
                minWidth: 0,
                lineHeight: 1.3,
                color: 'inherit',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 6,
              }}
            >
              {ex.name}
              {addedIds.has(ex.id) && (
                <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 4, textTransform: 'uppercase' }}>
                  · added
                </Text>
              )}
            </Text>
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {ex.sets}
            </Text>
            <Stack direction="row" gap={0}>
              <MonoChipButton
                variant="ghost"
                data-testid="preview-swap"
                data-exercise-id={ex.id}
                aria-label={`Swap ${ex.name}`}
                onClick={() => onSwapExercise(section.key, ex.id)}
                size="sm"
              >
                Swap
              </MonoChipButton>
              <MonoChipButton
                variant="ghost"
                data-testid="preview-remove"
                data-exercise-id={ex.id}
                aria-label={`Remove ${ex.name}`}
                onClick={() => onRemoveExercise(section.key, ex.id, addedIds.has(ex.id))}
                size="sm"
              >
                Remove
              </MonoChipButton>
            </Stack>
          </li>
        ))}
      </ul>
      <Stack direction="row" gap={2} style={{ marginTop: 10, flexWrap: 'wrap', rowGap: 8 }}>
        <MonoChipButton
          variant="dashed"
          data-testid="preview-add"
          data-section-key={section.key}
          onClick={() => onAddExercise(section.key)}
        >
          + Add exercise
        </MonoChipButton>
        {hiddenExercises.length > 0 && onUnhideExercise && (
          <MonoChipButton
            data-testid="preview-show-hidden"
            data-section-key={section.key}
            onClick={() => setHiddenExpanded((v) => !v)}
          >
            {hiddenExpanded
              ? '× Hide list'
              : `+ Show ${hiddenExercises.length} hidden`}
          </MonoChipButton>
        )}
      </Stack>

      {hiddenExpanded && hiddenExercises.length > 0 && (
        <ul
          data-testid="hidden-list"
          style={{
            listStyle: 'none',
            padding: '12px 0 0',
            margin: 0,
            borderTop: '1px dashed var(--border-hairline)',
            marginTop: 10,
          }}
        >
          {hiddenExercises.map((ex) => (
            <li
              key={ex.id}
              data-exercise-id={ex.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 12,
                padding: '10px 0',
              }}
            >
              <Text as="span" variant="body-sm" tone="secondary" style={{ flex: 1, minWidth: 0, opacity: 0.7 }}>
                {ex.name}
              </Text>
              <MonoChipButton
                data-testid="unhide-button"
                data-exercise-id={ex.id}
                aria-label={`Restore ${ex.name}`}
                onClick={() => onUnhideExercise(section.key, ex.id)}
              >
                Restore
              </MonoChipButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
