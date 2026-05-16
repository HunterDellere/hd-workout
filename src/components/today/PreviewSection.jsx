// PreviewSection — one section of the pre-start preview. Lists the
// programmed exercises with tier mark, sets prescription, and per-row
// Swap / Remove + a section-level "+ Add exercise" affordance.

import { Stack, Text, MonoChipButton } from '../../design-system/components';

export function PreviewSection({
  section,
  accent,
  addedIds,
  onSwapExercise,
  onRemoveExercise,
  onAddExercise,
}) {
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
        <Text as="div" variant="mono-sm" tone="tertiary">
          {section.exercises.length}
        </Text>
      </Stack>
      {section.blurb && (
        <Text as="p" variant="body-sm" tone="secondary" style={{ marginTop: 8, maxWidth: 60 * 9 }}>
          {section.blurb}
        </Text>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
        {section.exercises.map((ex, i) => (
          <li
            key={ex.id}
            data-testid="preview-row"
            data-exercise-id={ex.id}
            style={{
              display: 'grid',
              // Two rows: [tier · name · sets] on top, [actions] right-aligned below.
              // Grid collapses cleanly on narrow screens — no overlap.
              gridTemplateColumns: 'auto 1fr auto',
              columnGap: 12,
              rowGap: 6,
              padding: '14px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
              alignItems: 'baseline',
            }}
          >
            {ex.tier ? (
              <Text
                as="span"
                variant="mono-sm"
                style={{
                  width: 14,
                  color: ex.tier === 'S'
                    ? `var(--accent-${accent}-ink)`
                    : 'var(--text-tertiary)',
                  opacity: ex.tier === 'S' ? 0.95 : 0.55,
                  fontWeight: 600,
                }}
              >
                {ex.tier}
              </Text>
            ) : <span style={{ width: 14 }} />}
            <Text as="span" variant="body-md" style={{ minWidth: 0, lineHeight: 1.35 }}>
              {ex.name}
              {addedIds.has(ex.id) && (
                <Text as="span" variant="mono-sm" tone="tertiary" style={{ marginLeft: 8, textTransform: 'uppercase' }}>
                  · added
                </Text>
              )}
            </Text>
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', whiteSpace: 'nowrap', justifySelf: 'end' }}>
              {ex.sets}
            </Text>
            <div style={{
              gridColumn: '2 / -1',
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
              marginTop: 2,
            }}>
              <MonoChipButton
                data-testid="preview-swap"
                data-exercise-id={ex.id}
                aria-label={`Swap ${ex.name}`}
                onClick={() => onSwapExercise(section.key, ex.id)}
              >
                Swap
              </MonoChipButton>
              <MonoChipButton
                data-testid="preview-remove"
                data-exercise-id={ex.id}
                aria-label={`Remove ${ex.name}`}
                onClick={() => onRemoveExercise(section.key, ex.id, addedIds.has(ex.id))}
              >
                Remove
              </MonoChipButton>
            </div>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 10 }}>
        <MonoChipButton
          variant="dashed"
          data-testid="preview-add"
          data-section-key={section.key}
          onClick={() => onAddExercise(section.key)}
        >
          + Add exercise
        </MonoChipButton>
      </div>
    </div>
  );
}
