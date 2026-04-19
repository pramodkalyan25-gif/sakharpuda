import React from 'react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0a0a1a',
          color: '#fff', textAlign: 'center', padding: '20px', fontFamily: 'Outfit, sans-serif'
        }}>
          <h1 style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</h1>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Something went wrong</h2>
          <p style={{ color: '#888aa,', maxWidth: '400px', marginBottom: '30px' }}>
            The application encountered an unexpected error. Don't worry, your data is safe.
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Application
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: '40px', padding: '20px', background: '#13132a',
              borderRadius: '8px', fontSize: '12px', textAlign: 'left',
              maxWidth: '80vw', overflow: 'auto', border: '1px solid rgba(255,0,0,0.2)'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
