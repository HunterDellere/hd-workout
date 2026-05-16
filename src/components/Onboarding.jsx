// Onboarding — first-launch flow. Two calm screens:
//   1. Welcome: what HDW is, in three lines.
//   2. Set your split: lets the user pick training days now or skip and
//      keep the default (push/pull/legs/core, 3 rest days).
//
// Persists settings.onboarded=true on Get started OR Skip, so it never
// returns. Modal full-page surface; respects reduced-motion and traps
// focus on the panel.

import { useEffect, useState } from 'react';
import {
  Surface,
  Stack,
  Text,
  Button,
  BrushDivider,
  Logo,
} from '../design-system/components';
import {
  useSettings,
  DAY_OPTIONS,
  WEEKDAYS,
  DEFAULT_SETTINGS,
} from '../state/settings-context.js';
import { dayLineageAccent } from '../design-system/tokens';

function DayPill({ value, active, onClick }) {
  const accent = dayLineageAccent[value] ?? 'stone';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-testid={`onboarding-day-${value}`}
      style={{
        all: 'unset',
        cursor: 'pointer',
        padding: '8px 14px',
        borderRadius: 999,
        border: active
          ? `1.5px solid var(--accent-${accent}-ink)`
          : '1px solid var(--border-hairline)',
        background: active ? `var(--accent-${accent}-wash)` : 'transparent',
        color: active ? `var(--accent-${accent}-ink)` : 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
      }}
    >
      {value}
    </button>
  );
}

function WelcomeStep({ onNext, onSkip }) {
  return (
    <Stack direction="column" gap={5} style={{ maxWidth: 56 * 9 }}>
      <Stack direction="row" align="center" gap={3}>
        <Logo size={28} />
      </Stack>

      <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}>
        Welcome
      </Text>
      <Text as="h1" variant="display-lg" style={{ fontStyle: 'italic', lineHeight: 1.05 }}>
        A quiet training notebook.
      </Text>

      <Text as="p" variant="body-lg" tone="secondary" style={{ lineHeight: 1.55 }}>
        Push, pull, legs, core — written down. No account, no analytics,
        no clutter. Your data stays on this device.
      </Text>

      <BrushDivider />

      <Stack direction="column" gap={3}>
        <Text as="p" variant="body-md" tone="primary">
          One screen left. Set your split, or skip and keep the default.
        </Text>
        <Stack direction="row" gap={2}>
          <Button
            variant="primary"
            size="md"
            onClick={onNext}
            data-testid="onboarding-next"
          >
            Set up split →
          </Button>
          <Button
            variant="bare"
            size="md"
            onClick={onSkip}
            data-testid="onboarding-skip"
          >
            Skip
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

function SplitStep({ initial, onDone, onSkip }) {
  const [draft, setDraft] = useState(initial);

  function cycle(weekday) {
    const cur = draft[weekday] ?? 'rest';
    const idx = DAY_OPTIONS.indexOf(cur);
    const next = DAY_OPTIONS[(idx + 1) % DAY_OPTIONS.length];
    setDraft((d) => ({ ...d, [weekday]: next }));
  }

  return (
    <Stack direction="column" gap={5} style={{ maxWidth: 56 * 9 }}>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}>
        Your split
      </Text>
      <Text as="h1" variant="display-lg" style={{ fontStyle: 'italic', lineHeight: 1.05 }}>
        Which day is which?
      </Text>

      <Text as="p" variant="body-md" tone="secondary" style={{ lineHeight: 1.55 }}>
        Tap to cycle. You can change this any time in Settings.
      </Text>

      <Stack direction="column" gap={2}>
        {WEEKDAYS.map((w) => (
          <Stack
            key={w.idx}
            direction="row"
            align="center"
            justify="space-between"
            gap={3}
            style={{
              padding: '8px 0',
              borderTop: w.idx === 1 ? 'none' : '1px solid var(--border-hairline)',
            }}
          >
            <Text as="span" variant="body-md" tone="primary" style={{ flex: 1 }}>
              {w.label}
            </Text>
            <DayPill value={draft[w.idx] ?? 'rest'} active onClick={() => cycle(w.idx)} />
          </Stack>
        ))}
      </Stack>

      <BrushDivider />

      <Stack direction="row" gap={2}>
        <Button
          variant="primary"
          size="md"
          onClick={() => onDone(draft)}
          data-testid="onboarding-finish"
        >
          Get started →
        </Button>
        <Button
          variant="bare"
          size="md"
          onClick={onSkip}
          data-testid="onboarding-skip"
        >
          Use defaults
        </Button>
      </Stack>
    </Stack>
  );
}

export function Onboarding() {
  const { settings, setOnboarded, replaceAll } = useSettings();
  const [step, setStep] = useState(0);

  // Trap body scroll while the overlay is up.
  useEffect(() => {
    if (settings.onboarded) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [settings.onboarded]);

  if (settings.onboarded) return null;

  function finishWithDefaults() {
    setOnboarded(true);
  }
  function finishWithSplit(split) {
    replaceAll({ ...settings, split, onboarded: true });
  }

  return (
    <Surface
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      data-testid="onboarding"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'var(--surface-page)',
        overflow: 'auto',
        padding: 'env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: 'clamp(24px, 6vw, 56px)',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {step === 0 ? (
          <WelcomeStep
            onNext={() => setStep(1)}
            onSkip={finishWithDefaults}
          />
        ) : (
          <SplitStep
            initial={settings.split ?? DEFAULT_SETTINGS.split}
            onDone={finishWithSplit}
            onSkip={finishWithDefaults}
          />
        )}
      </div>
    </Surface>
  );
}
