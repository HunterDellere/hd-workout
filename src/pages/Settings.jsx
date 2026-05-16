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
import { HAPTIC_MODES, fireHapticAt } from '../hooks/useHaptics';
import { buildSnapshot, applySnapshot, wipeAll } from '../data/export';
import { GYM_PROGRAMS, HOME_PROGRAMS, DEFAULT_PROGRAM_KEY } from '../data';
import { EQUIPMENT_CATEGORIES } from '../data/equipment';
import { useOverlay } from '../state/overlay-context.js';

// Wave 4.2 #15: WAI-ARIA radio pattern with roving tabindex + arrow-key
// navigation. The parent <div role="radiogroup"> wires up the keyboard
// handler; individual Radio buttons stamp tabIndex=0 when checked
// (or first when none checked) and tabIndex=-1 otherwise.
function Radio({ value, current, onSelect, label, hint, isFirst, groupValues }) {
  const checked = current === value;
  // The checked radio (or the first one if nothing checked) holds tab focus.
  const tabIndex = checked || (current == null && isFirst) ? 0 : -1;

  function onKeyDown(e) {
    if (!groupValues || groupValues.length === 0) return;
    const idx = groupValues.indexOf(value);
    if (idx < 0) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = groupValues[(idx + 1) % groupValues.length];
      onSelect(next);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = groupValues[(idx - 1 + groupValues.length) % groupValues.length];
      onSelect(prev);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onSelect(value);
    }
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={tabIndex}
      data-radio={value}
      onClick={() => onSelect(value)}
      onKeyDown={onKeyDown}
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
  const {
    settings,
    setSplit,
    setRestTimerMode,
    setUnits,
    setHaptics,
    setIntelligenceEnabled,
    setActiveProgramKey,
    setLocation,
    applyProgramSplit,
    toggleExcludedEquipment,
    resetSplit,
    setPlateCalculatorEnabled,
    setBarWeight,
  } = useSettings();
  const activeProgramKey = settings.activeProgramKey ?? DEFAULT_PROGRAM_KEY;
  const isHome = settings.location === 'home';
  const availablePrograms = isHome ? HOME_PROGRAMS : GYM_PROGRAMS;
  const { resetAllOverlays } = useOverlay();

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

      <Block gapTop={24} eyebrow="Where you train">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          Gates the available program templates and which equipment is
          assumed. Move this up when you swap gyms or set up a home rack.
        </Text>
        <div role="radiogroup" aria-label="Training location" data-testid="location-radiogroup">
          <Radio
            value="gym"
            current={settings.location ?? 'gym'}
            onSelect={setLocation}
            label="Gym"
            hint="Full equipment access."
            isFirst
            groupValues={['gym', 'home']}
          />
          <Radio
            value="home"
            current={settings.location ?? 'gym'}
            onSelect={setLocation}
            label="Home"
            hint="Bands, kettlebells, mace/club, bar, light dumbbells, bodyweight."
            groupValues={['gym', 'home']}
          />
        </div>
      </Block>

      <Block gapTop={56} eyebrow={isHome ? 'Program · Home' : 'Program · Gym'}>
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          {isHome
            ? 'The home training template — bands, kettlebells, mace/club, pull-up bar, light dumbbells, bodyweight.'
            : 'The gym training template. Full equipment access.'}
        </Text>
        <div role="radiogroup" aria-label="Active program" data-testid="program-switcher">
          {availablePrograms.map((p, i) => (
            <Radio
              key={p.key}
              value={p.key}
              current={activeProgramKey}
              onSelect={(key) => setActiveProgramKey(key)}
              label={p.name}
              hint={p.description}
              isFirst={i === 0}
              groupValues={availablePrograms.map((q) => q.key)}
            />
          ))}
        </div>
        {(() => {
          const active = availablePrograms.find((p) => p.key === activeProgramKey);
          if (!active?.defaultSplit) return null;
          const matches = Object.keys(active.defaultSplit).every(
            (k) => settings.split?.[k] === active.defaultSplit[k],
          );
          if (matches) return null;
          return (
            <div style={{ marginTop: 16 }}>
              <Button
                variant="bare"
                size="sm"
                data-testid="apply-program-split"
                onClick={() => applyProgramSplit(active.key, active.defaultSplit)}
                style={{ padding: 0 }}
              >
                Apply {active.name}'s suggested split
              </Button>
            </div>
          );
        })()}
        <div style={{ marginTop: 20 }}>
          <Button
            variant="bare"
            size="sm"
            data-testid="reset-routine"
            onClick={() => {
              if (typeof window !== 'undefined'
                && !window.confirm('Reset to the default routine? This clears all swap and add edits across gym and home.')) return;
              resetAllOverlays();
            }}
            style={{ padding: 0, color: 'var(--state-warn-ink)' }}
          >
            Reset to default routine
          </Button>
        </div>
      </Block>


      <Block gapTop={56} eyebrow="Split">
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


      <Block gapTop={56} eyebrow="Rest timer">
        <div role="radiogroup" aria-label="Rest timer mode">
          <Radio
            value="count-up"
            current={settings.restTimerMode}
            onSelect={setRestTimerMode}
            label="Count up"
            hint="0:00 → target. Pulses when ready."
            isFirst
            groupValues={['count-up', 'countdown']}
          />
          <Radio
            value="countdown"
            current={settings.restTimerMode}
            onSelect={setRestTimerMode}
            label="Countdown"
            hint="Target → 0:00. Pulses at zero."
            groupValues={['count-up', 'countdown']}
          />
        </div>
      </Block>


      <Block gapTop={56} eyebrow="Units">
        <div role="radiogroup" aria-label="Units">
          <Radio
            value="kg"
            current={settings.units}
            onSelect={setUnits}
            label="Kilograms"
            hint="2.5 kg minimum increment."
            isFirst
            groupValues={['kg', 'lb']}
          />
          <Radio
            value="lb"
            current={settings.units}
            onSelect={setUnits}
            label="Pounds"
            hint="5 lb minimum increment."
            groupValues={['kg', 'lb']}
          />
        </div>
      </Block>


      <Block gapTop={56} eyebrow="Plate calculator">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          Shows the per-side plate breakdown under the load input mid-set.
          Suppressed on warmup sets.
        </Text>
        <div role="radiogroup" aria-label="Plate calculator">
          <Radio
            value="on"
            current={settings.plateCalculatorEnabled === false ? 'off' : 'on'}
            onSelect={() => setPlateCalculatorEnabled(true)}
            label="On"
            hint="Default. Quiet mono line below the load stepper."
            isFirst
            groupValues={['on', 'off']}
          />
          <Radio
            value="off"
            current={settings.plateCalculatorEnabled === false ? 'off' : 'on'}
            onSelect={() => setPlateCalculatorEnabled(false)}
            label="Off"
            hint="Hide the breakdown."
            groupValues={['on', 'off']}
          />
        </div>
        {settings.plateCalculatorEnabled !== false && (
          <Stack direction="row" gap={3} align="center" style={{ marginTop: 16, flexWrap: 'wrap' }}>
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              Bar weight
            </Text>
            <input
              type="number"
              data-testid="bar-weight-input"
              aria-label="Bar weight"
              value={settings.units === 'lb'
                ? (settings.barWeightLb ?? 45)
                : (settings.barWeightKg ?? 20)}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  // Empty input snaps back to defaults (null clears the
                  // override, so the unit-aware default kicks in).
                  setBarWeight(settings.units, null);
                  return;
                }
                const v = Number(raw);
                if (!Number.isFinite(v) || v < 0) return;
                setBarWeight(settings.units, v);
              }}
              min={0}
              step={settings.units === 'lb' ? 5 : 1}
              style={{
                width: 80,
                padding: '8px 10px',
                background: 'var(--surface-page)',
                border: '1px solid var(--border-strong)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
              {settings.units}
            </Text>
          </Stack>
        )}
      </Block>

      <Block gapTop={56} eyebrow="Equipment I don't have">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          Toggle anything you don't have access to. Exercises that need it
          stop appearing in swap and add suggestions across the app.
        </Text>
        <div data-testid="excluded-equipment" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EQUIPMENT_CATEGORIES.map((eq) => {
            const active = (settings.excludedEquipment ?? []).includes(eq.key);
            return (
              <button
                key={eq.key}
                type="button"
                role="checkbox"
                aria-checked={active}
                aria-label={`I don't have: ${eq.label}`}
                data-testid={`exclude-${eq.key}`}
                data-active={active ? '1' : '0'}
                onClick={() => toggleExcludedEquipment(eq.key)}
                title={eq.hint}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: 999,
                  border: '1px solid var(--border-hairline)',
                  background: active ? 'var(--state-warn-ink, var(--text-primary))' : 'transparent',
                  color: active ? 'var(--surface-page)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  transition: 'background 120ms ease, color 120ms ease',
                }}
              >
                {active ? '✕ ' : ''}{eq.label}
              </button>
            );
          })}
        </div>
        {(settings.excludedEquipment ?? []).length > 0 && (
          <Text as="p" variant="mono-sm" tone="tertiary" style={{ marginTop: 12, textTransform: 'uppercase' }}>
            · Excluding {(settings.excludedEquipment ?? []).length} type{(settings.excludedEquipment ?? []).length === 1 ? '' : 's'}
          </Text>
        )}
      </Block>


      <DataBlock />


      <Block gapTop={56} eyebrow="Haptics">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          Tap an option to feel it.
        </Text>
        <div role="radiogroup" aria-label="Haptics">
          {HAPTIC_MODES.map((m, i) => (
            <Radio
              key={m.value}
              value={m.value}
              current={settings.haptics}
              onSelect={(v) => {
                setHaptics(v);
                // Fire at the *just-picked* intensity. Using the
                // settings-bound haptic() would play back the previous
                // mode because it closes over the prior render's scale.
                fireHapticAt(v, 'doubleTap');
              }}
              label={m.label}
              hint={m.hint}
              isFirst={i === 0}
              groupValues={HAPTIC_MODES.map((x) => x.value)}
            />
          ))}
        </div>
      </Block>


      <Block gapTop={56} eyebrow="Insights">
        <Text as="p" variant="body-md" tone="secondary" style={{ marginBottom: 12 }}>
          PR detection, weekly volume, a frequency heatmap, and per-exercise load suggestions.
        </Text>
        <div role="radiogroup" aria-label="Intelligence">
          <Radio
            value={true}
            current={settings.intelligenceEnabled}
            onSelect={() => setIntelligenceEnabled(true)}
            label="On"
            hint="Surfaces an Insights anchor on the Log tab."
            isFirst
            groupValues={[true, false]}
          />
          <Radio
            value={false}
            current={settings.intelligenceEnabled}
            onSelect={() => setIntelligenceEnabled(false)}
            label="Off"
            hint="Hides the surface entirely."
            groupValues={[true, false]}
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
