// VariantList — hairline-ruled rows of exercise variants.
// Theme-reactive via CSS vars. Used inside the rewritten ExerciseSheet;
// accent is the v2 token name (e.g. 'rust'), not a hex.

import { Stack, Text } from '../design-system/components';

export function VariantList({ variants, accent = 'stone' }) {
  if (!variants?.length) return null;
  return (
    <ul style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
    }}>
      {variants.map((v, i) => (
        <li
          key={v.name}
          style={{
            display: 'flex',
            gap: 12,
            padding: '14px 0',
            borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
            alignItems: 'baseline',
          }}
        >
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              width: 6,
              height: 6,
              marginTop: 8,
              background: `var(--accent-${accent}-solid)`,
              borderRadius: 1,
            }}
          />
          <Stack direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
            <Text as="span" variant="body-lg" style={{ fontWeight: 500 }}>
              {v.name}
            </Text>
            {v.note ? (
              <Text as="span" variant="body-sm" tone="secondary">
                {v.note}
              </Text>
            ) : null}
          </Stack>
        </li>
      ))}
    </ul>
  );
}
