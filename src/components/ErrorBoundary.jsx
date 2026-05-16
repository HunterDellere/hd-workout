// ErrorBoundary — catches any uncaught render error and shows a calm
// recovery surface. Last-resort safety net for a single-user notebook
// app — without it, a broken render (eg corrupt IDB state) would leave
// the user staring at a white screen and unable to recover.
//
// Class component because React still requires componentDidCatch /
// getDerivedStateFromError as class lifecycles.

import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep this quiet in prod — no analytics, no remote logging. The
    // user can copy the message + reload. Useful in dev.
    if (typeof console !== 'undefined' && console.error) {
      console.error('[hdw] render error:', error, info?.componentStack);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  reload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <main
        role="alert"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          background: 'var(--surface-page, #F4EFE3)',
          color: 'var(--text-primary, #181510)',
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary, #5F5849)',
              marginBottom: 12,
            }}
          >
            Something broke
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, Newsreader, serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 32,
              lineHeight: 1.1,
              margin: '0 0 16px',
            }}
          >
            Let's try that again.
          </h1>
          <p
            style={{
              color: 'var(--text-secondary, #494339)',
              lineHeight: 1.55,
              marginBottom: 24,
            }}
          >
            HDW hit an unexpected error. Your data is safe — it's stored on
            this device. Reload to recover.
          </p>
          {error?.message && (
            <pre
              style={{
                padding: 12,
                marginBottom: 24,
                background: 'var(--surface-sunken, #ECE6D8)',
                border: '1px solid var(--border-hairline, rgba(0,0,0,0.1))',
                borderRadius: 6,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 12,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'var(--text-tertiary, #5F5849)',
              }}
            >
              {String(error.message)}
            </pre>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={this.reload}
              style={{
                all: 'unset',
                cursor: 'pointer',
                padding: '10px 20px',
                background: 'var(--foundation-espresso, #22180E)',
                color: 'var(--surface-page, #F4EFE3)',
                borderRadius: 6,
                fontFamily: 'var(--font-sans, system-ui)',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.reset}
              style={{
                all: 'unset',
                cursor: 'pointer',
                padding: '10px 20px',
                border: '1px solid var(--border-hairline, rgba(0,0,0,0.1))',
                borderRadius: 6,
                fontFamily: 'var(--font-sans, system-ui)',
                fontSize: 14,
                color: 'var(--text-secondary, #494339)',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }
}
