// /me — index of personal pages. Settings, Glossary, About.
// History and Insights moved to /log in the IA shift (Wave 2). Glossary
// stays here for now; it'll migrate to /library/glossary in a later pass.

import { Link } from 'react-router-dom';
import { Page, Text, BrushDivider, Button } from '../design-system/components';

const ITEMS = [
  { to: '/me/settings', label: 'Settings', hint: 'Split, rest timer, units, haptics, data' },
  { to: '/me/glossary', label: 'Glossary', hint: 'What the words mean' },
  { to: '/me/about',    label: 'About',    hint: 'Install instructions' },
];

export function Me() {
  return (
    <Page>
      <Button as={Link} to="/" variant="bare" size="sm" style={{ padding: 0 }}>
        ← Today
      </Button>
      <Text as="h1" variant="display-lg" style={{ marginTop: 24, fontStyle: 'italic' }}>
        You
      </Text>
      <BrushDivider style={{ marginTop: 32 }} />
      <ul style={{ listStyle: 'none', margin: '24px 0 0', padding: 0 }}>
        {ITEMS.map((item, i) => (
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
