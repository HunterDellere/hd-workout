// /me/about — what HDW is, how to install it, where data lives.
// Calm voice; no decoration; structured like a notebook colophon.

import { Link } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
} from '../design-system/components';

function Step({ index, children }) {
  return (
    <li
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr',
        gap: 12,
        padding: '10px 0',
        borderTop: index === 0 ? 'none' : '1px solid var(--border-hairline)',
      }}
    >
      <Text
        as="span"
        variant="mono-sm"
        tone="tertiary"
        style={{ textTransform: 'uppercase', paddingTop: 4 }}
      >
        {String(index + 1).padStart(2, '0')}
      </Text>
      <Text as="span" variant="body-lg" tone="primary">{children}</Text>
    </li>
  );
}

const IOS_STEPS = [
  'Open this page in Safari (not Chrome).',
  'Tap the share icon at the bottom of the screen.',
  'Scroll and tap "Add to Home Screen."',
  'Open HDW from its new home-screen icon. It runs full-screen and works offline.',
];

const ANDROID_STEPS = [
  'Open this page in Chrome.',
  'Tap the three-dot menu in the top right.',
  'Tap "Install app" or "Add to Home screen."',
  'Open HDW from the app drawer. It runs full-screen and works offline.',
];

export function About() {
  return (
    <Page>
      <Button as={Link} to="/" variant="bare" size="sm" style={{ padding: 0 }}>
        ← Home
      </Button>

      <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
        About
      </Text>
      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        HDW
      </Text>
      <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
        A daily training notebook. A reference for the four rooms of the body —
        push, pull, legs, core. Read on the couch; used on the gym floor. No
        accounts, no subscription, no analytics looking over your shoulder.
      </Text>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Install on iOS">
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {IOS_STEPS.map((step, i) => (
            <Step key={i} index={i}>{step}</Step>
          ))}
        </ol>
      </Block>

      <Block gapTop={32} eyebrow="Install on Android">
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {ANDROID_STEPS.map((step, i) => (
            <Step key={i} index={i}>{step}</Step>
          ))}
        </ol>
      </Block>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Your data">
        <Stack direction="column" gap={3}>
          <Text as="p" variant="body-lg" tone="primary">
            Everything you log stays on your device. There is no server. No
            account, no email, no opt-in to anything.
          </Text>
          <Text as="p" variant="body-md" tone="secondary">
            When tracking lands, you will be able to export the whole log as a
            single file and re-import it on a new device. If you delete the app,
            the data goes with it.
          </Text>
        </Stack>
      </Block>

      <Block gapTop={32} eyebrow="Colophon">
        <Text as="p" variant="body-md" tone="secondary" style={{ maxWidth: 60 * 9 }}>
          Set in Newsreader, Inter, and JetBrains Mono. Built as a progressive
          web app. Built deliberately small.
        </Text>
      </Block>
    </Page>
  );
}
