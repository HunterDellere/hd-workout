// /me — index of personal pages. Currently: Settings, About, Insights (flagged).
// Hairline-row list, same shape as the Library index.

import { Link } from 'react-router-dom';
import { Page, Text, BrushDivider, Button } from '../design-system/components';
import { useSettings } from '../state/settings-context.js';

const BASE_ITEMS = [
  { to: '/history',     label: 'History',  hint: 'Every session, drill in to edit or delete' },
  { to: '/me/settings', label: 'Settings', hint: 'Split, rest timer, units, haptics, data' },
  { to: '/me/glossary', label: 'Glossary', hint: 'What the words mean' },
  { to: '/me/about',    label: 'About',    hint: 'Install instructions' },
];

export function Me() {
  const { settings } = useSettings();
  const items = settings.intelligenceEnabled
    ? [
      { to: '/insights', label: 'Insights', hint: 'PRs, weekly volume, frequency' },
      ...BASE_ITEMS,
    ]
    : BASE_ITEMS;

  return (
    <Page>
      <Button as={Link} to="/" variant="bare" size="sm" style={{ padding: 0 }}>
        ← Home
      </Button>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
        You
      </Text>
      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        Me
      </Text>
      <BrushDivider style={{ marginTop: 32 }} />
      <ul style={{ listStyle: 'none', margin: '24px 0 0', padding: 0 }}>
        {items.map((item, i) => (
          <li key={item.to}>
            <Link
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 16,
                padding: '20px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
                textDecoration: 'none',
                color: 'var(--text-primary)',
              }}
            >
              <span>
                <Text as="div" variant="title-md">{item.label}</Text>
                <Text as="div" variant="body-sm" tone="secondary" style={{ marginTop: 4 }}>
                  {item.hint}
                </Text>
              </span>
              <Text as="span" variant="mono-sm" tone="tertiary">→</Text>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
