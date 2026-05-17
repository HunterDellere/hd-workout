// BodyweightQuickLog — a single-line, low-friction logging surface that
// appears on the pre-start Today screen. Only shows when:
//   - no entry has been logged today yet, AND
//   - the user has at least one prior entry (signals they actually use BW)
// First-ever entry is logged from /me/bodyweight, not here — keeps the
// Today hero uncluttered for brand-new users.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stack, Text, MonoChipButton } from '../../design-system/components';
import { useBodyweight, todayIso, latestEntry } from '../../state/bodyweight-context.js';
import { useSettings } from '../../state/settings-context.js';

export function BodyweightQuickLog() {
  const { log, logEntry } = useBodyweight();
  const { settings } = useSettings();
  const unit = settings.units;

  const latest = latestEntry(log);
  const today = todayIso();
  const alreadyLoggedToday = log.some((e) => e.date === today);

  const [draft, setDraft] = useState(latest ? String(latest.value) : '');
  const [submitting, setSubmitting] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  // Hide if no prior log (first-time onboarding to BW happens in /me/bodyweight)
  // or if today is already logged AND we haven't just done so this render.
  if (!latest && !alreadyLoggedToday) return null;
  if (alreadyLoggedToday && !justLogged) {
    const todayEntry = log.find((e) => e.date === today);
    return (
      <Stack
        direction="row"
        align="baseline"
        justify="space-between"
        gap={3}
        data-testid="bodyweight-quick-row"
        style={{ marginTop: 16, padding: '10px 14px', borderRadius: 6, background: 'var(--surface-sunken)' }}
      >
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Bodyweight · Today
        </Text>
        <Text as="span" variant="mono-sm" tone="primary">
          {todayEntry?.value}{todayEntry?.unit}
        </Text>
        <Link
          to="/me/bodyweight"
          data-testid="bodyweight-quick-link"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
          }}
        >
          History →
        </Link>
      </Stack>
    );
  }

  function submit(e) {
    e.preventDefault();
    const v = Number(draft);
    if (!Number.isFinite(v) || v <= 0) return;
    setSubmitting(true);
    logEntry({ value: v, unit });
    setSubmitting(false);
    setJustLogged(true);
  }

  return (
    <form
      onSubmit={submit}
      data-testid="bodyweight-quick-form"
      style={{
        marginTop: 16,
        padding: '12px 14px',
        borderRadius: 6,
        background: 'var(--surface-sunken)',
      }}
    >
      <Stack direction="row" align="center" gap={3} style={{ flexWrap: 'wrap', rowGap: 8 }}>
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          Log bodyweight
        </Text>
        <input
          type="number"
          aria-label="Bodyweight"
          data-testid="bodyweight-quick-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          step={unit === 'lb' ? 0.5 : 0.1}
          min={0}
          inputMode="decimal"
          placeholder={latest ? String(latest.value) : ''}
          style={{
            width: 90,
            padding: '6px 10px',
            background: 'var(--surface-page)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            textAlign: 'center',
            outline: 'none',
          }}
        />
        <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase' }}>
          {unit}
        </Text>
        <MonoChipButton
          type="submit"
          disabled={submitting || !Number.isFinite(Number(draft)) || Number(draft) <= 0}
          data-testid="bodyweight-quick-submit"
        >
          Save
        </MonoChipButton>
        {latest && (
          <Text as="span" variant="mono-sm" tone="tertiary" style={{ textTransform: 'uppercase', opacity: 0.7 }}>
            Last · {latest.value}{latest.unit}
          </Text>
        )}
      </Stack>
    </form>
  );
}
