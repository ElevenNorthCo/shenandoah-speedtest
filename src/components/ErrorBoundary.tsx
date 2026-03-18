import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'var(--accent-danger)',
            marginBottom: '12px',
          }}>
            Something went wrong
          </h2>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
          }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '0.85rem',
              color: 'var(--accent-signal)',
              background: 'transparent',
              border: '1px solid var(--accent-signal)',
              borderRadius: '6px',
              padding: '8px 20px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
