'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In development, also log to console for easier debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // You can add error reporting service here (e.g., Sentry, LogRocket)
      try {
        // Example: reportError(error, errorInfo);
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or use provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #000008 0%, #0a0a18 30%, #1a1a2e 70%, #2a2a4e 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Exo 2", "Inter", sans-serif',
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '32px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚨</div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              Something went wrong
            </h1>
            <p style={{ 
              color: '#d1d5db', 
              marginBottom: '24px', 
              maxWidth: '400px',
              margin: '0 auto 24px auto',
              lineHeight: '1.6'
            }}>
              We encountered an unexpected error. This might be due to a network issue or temporary problem.
              Please try refreshing the page or check your internet connection.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => {
                  try {
                    window.location.reload();
                  } catch (e) {
                    // Fallback if reload fails
                    window.location.href = '/';
                  }
                }}
                style={{
                  background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                }}
                style={{
                  background: 'transparent',
                  color: '#8b5cf6',
                  border: '1px solid #8b5cf6',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  try {
                    window.location.href = '/';
                  } catch (e) {
                    // Ultimate fallback
                    console.error('Cannot navigate home:', e);
                  }
                }}
                style={{
                  background: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #6b7280',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Go Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginTop: '24px', 
                textAlign: 'left',
                background: 'rgba(31, 41, 55, 0.8)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: '#9ca3af',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ 
                  marginTop: '8px',
                  padding: '16px',
                  background: '#1f2937',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  color: '#fca5a5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 