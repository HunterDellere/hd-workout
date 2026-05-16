// /me/settings — split editor, rest timer mode, units.
// Reads + writes through useSettings(). LocalStorage-persisted; survives
// reloads. IDB migration in Session 12 will swap the storage layer without
// changing the shape.

import { useRef, useState } from 'react';
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
import { useSession } from '../state/session-context.js';
import { useHaptics, HAPTIC_MODES } from '../hooks/useHaptics';
import { buildSnapshot, applySnapshot, wipeAll } from '../data/export';

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

const DAY_LABEL = { push: 'Push', pull: 'Pull', legs: 'Legs', core: 'Core', recovery: 'Recovery', rest: 'Rest' };

function downloadBlob(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DataBlock() {
  const { replaceAll: replaceSettings } = useSettings();
  const { replaceAll: replaceSession, clearAll } = useSession();
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null);

  async function onExport() {
    setStatus(null);
    try {
      const snapshot = await buildSnapshot();
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(`hdw-snapshot-${stamp}.json`, JSON.stringify(snapshot, null, 2));
      setStatus({ kind: 'ok', message: 'Snapshot downloaded.' });
    } catch (err) {
      setStatus({ kind: 'err', message: `Export failed: ${err.message}` });
    }
  }

  async function onImport(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setStatus(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await applySnapshot(parsed);
      replaceSettings(parsed.settings);
      await replaceSession({
        active: parsed.activeSession ?? null,
        archive: parsed.archive ?? [],
      });
      setStatus({ kind: 'ok', message: 'Snapshot imported.' });
    } catch (err) {
      setStatus({ kind: 'err', message: `Import failed: ${err.message}` });
    }
  }

  async function onWipe() {
    if (typeof window !== 'undefined'
      && !window.confirm('Wipe all on-device data? This cannot be undone.')) return;
    setStatus(null);
    try {
      await wipeAll();
      await clearAll();
      setStatus({ kind: 'ok', message: 'All on-device data cleared.' });
    } catch (err) {
      setStatus({ kind: 'err', message: `Wipe failed: ${err.message}` });
    }
  }

  return (
    <Block gapTop={24} eyebrow="Data">
      <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 16 }}>
        Snapshot includes settings, the active session, and all completed sessions.
        JSON only — moves cleanly between devices.
      </Text>
      <Stack direction="column" gap={3}>
        <Button variant="soft" accent="stone" size="md" data-testid="export-button" onClick={onExport}>
          Export snapshot
        </Button>
        <Button
          variant="soft"
          accent="stone"
          size="md"
          data-testid="import-button"
          onClick={() => fileRef.current?.click()}
        >
          Import snapshot
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onImport}
          data-testid="import-file"
          style={{ display: 'none' }}
        />
        <Button variant="bare" size="sm" data-testid="wipe-button" onClick={onWipe} style={{ padding: 0 }}>
          Wipe all on-device data
        </Button>
      </Stack>
      {status && (
        <Text
          as="p"
          variant="body-sm"
          tone={status.kind === 'err' ? 'primary' : 'tertiary'}
          data-testid="data-status"
          style={{ marginTop: 12, color: status.kind === 'err' ? 'var(--state-warn-ink)' : undefined }}
        >
          {status.message}
        </Text>
      )}
    </Block>
  );
}

export function Settings() {
  const { settings, setSplit, setRestTimerMode, setUnits, setHaptics, setIntelligenceEnabled, resetSplit } = useSettings();
  const haptic = useHaptics();

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
        Stays on this device.
      </Text>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Split">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          What appears on <code style={{ fontFamily: 'var(--font-mono)' }}>/today</code> each weekday.
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
            hint="0:00 → target. Pulses when ready."
          />
          <Radio
            value="countdown"
            current={settings.restTimerMode}
            onSelect={setRestTimerMode}
            label="Countdown"
            hint="Target → 0:00. Pulses at zero."
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

      <BrushDivider style={{ marginTop: 40 }} />

      <DataBlock />

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Haptics">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          Tap an option to feel it.
        </Text>
        <div role="radiogroup" aria-label="Haptics">
          {HAPTIC_MODES.map((m) => (
            <Radio
              key={m.value}
              value={m.value}
              current={settings.haptics}
              onSelect={(v) => {
                setHaptics(v);
                // Fire after the state-set so the new intensity is in effect.
                // useHaptics reads settings, so we wait a tick.
                setTimeout(() => haptic('doubleTap'), 0);
              }}
              label={m.label}
              hint={m.hint}
            />
          ))}
        </div>
      </Block>

      <BrushDivider style={{ marginTop: 40 }} />

      <Block gapTop={24} eyebrow="Insights">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          PR detection, weekly volume, and a frequency heatmap. Off by default while the math settles in.
        </Text>
        <div role="radiogroup" aria-label="Intelligence">
          <Radio
            value={true}
            current={settings.intelligenceEnabled}
            onSelect={() => setIntelligenceEnabled(true)}
            label="On"
            hint="Adds an Insights tile to /me."
          />
          <Radio
            value={false}
            current={settings.intelligenceEnabled}
            onSelect={() => setIntelligenceEnabled(false)}
            label="Off"
            hint="Hides the surface entirely."
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
