// /me/settings — split editor, rest timer mode, units.
// Reads + writes through useSettings(). LocalStorage-persisted; survives
// reloads. IDB migration in Session 12 will swap the storage layer without
// changing the shape.

import { Link } from 'react-router-dom';
import {
  Page,
  Block,
  Stack,
  Text,
  Button,
  BrushDivider,
} from '../design-system/components';
import { useSettings, DAY_OPTIONS, WEEKDAYS } from '../state/settings-context.js';

function Radio({ value, current, onSelect, label, hint }) {
  const checked = current === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      data-radio={value}
      onClick={() => onSelect(value)}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '16px 0',
        borderTop: '1px solid var(--border-hairline)',
      }}
    >
      <Stack direction="column" gap={1}>
        <Text as="span" variant="body-lg">{label}</Text>
        {hint && (
          <Text as="span" variant="body-sm" tone="tertiary">{hint}</Text>
        )}
      </Stack>
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          border: '1.5px solid var(--border-strong)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--text-primary)' }} />
        )}
      </span>
    </button>
  );
}

const DAY_LABEL = { push: 'Push', pull: 'Pull', legs: 'Legs', core: 'Core', rest: 'Rest' };

export function Settings() {
  const { settings, setSplit, setRestTimerMode, setUnits, resetSplit } = useSettings();

  return (
    <Page>
      <Button as={Link} to="/me" variant="bare" size="sm" style={{ padding: 0 }}>
        ← You
      </Button>
      <Text as="div" variant="mono-sm" tone="tertiary" style={{ marginTop: 24, textTransform: 'uppercase' }}>
        Settings
      </Text>
      <Text as="h1" variant="display-lg" style={{ marginTop: 8, fontStyle: 'italic' }}>
        Settings
      </Text>
      <Text as="p" variant="body-lg" tone="secondary" style={{ marginTop: 16, maxWidth: 60 * 9 }}>
        Stays on this device. No account, no sync, no nag.
      </Text>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Weekly split">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          What day shows on <code style={{ fontFamily: 'var(--font-mono)' }}>/today</code> for each weekday.
        </Text>
        <div data-testid="split-editor">
          {WEEKDAYS.map((wd) => (
            <Stack
              key={wd.idx}
              direction="row"
              align="center"
              justify="space-between"
              gap={3}
              style={{
                padding: '12px 0',
                borderTop: '1px solid var(--border-hairline)',
              }}
            >
              <Text as="span" variant="body-lg" style={{ flex: 1 }}>
                {wd.label}
              </Text>
              <select
                value={settings.split[wd.idx]}
                onChange={(e) => setSplit(wd.idx, e.target.value)}
                aria-label={`${wd.label} day`}
                data-weekday={wd.idx}
                style={selectStyle}
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{DAY_LABEL[d]}</option>
                ))}
              </select>
            </Stack>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <Button variant="bare" size="sm" onClick={resetSplit} style={{ padding: 0 }}>
            Reset to default rotation
          </Button>
        </div>
      </Block>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Rest timer">
        <div role="radiogroup" aria-label="Rest timer mode">
          <Radio
            value="count-up"
            current={settings.restTimerMode}
            onSelect={setRestTimerMode}
            label="Count up"
            hint="0:00 → target. Pulses at the rest target. Calm."
          />
          <Radio
            value="countdown"
            current={settings.restTimerMode}
            onSelect={setRestTimerMode}
            label="Countdown"
            hint="Target → 0:00. Pulses at zero. More obvious."
          />
        </div>
      </Block>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Units">
        <div role="radiogroup" aria-label="Units">
          <Radio
            value="kg"
            current={settings.units}
            onSelect={setUnits}
            label="Kilograms"
            hint="2.5 kg minimum increment."
          />
          <Radio
            value="lb"
            current={settings.units}
            onSelect={setUnits}
            label="Pounds"
            hint="5 lb minimum increment."
          />
        </div>
      </Block>
    </Page>
  );
}

const selectStyle = {
  appearance: 'auto',
  background: 'var(--surface-page)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-strong)',
  borderRadius: 6,
  padding: '8px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 15,
  cursor: 'pointer',
};
