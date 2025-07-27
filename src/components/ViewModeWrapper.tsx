import { useState, useEffect, Suspense, lazy, ReactNode, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { checkNetwork } from '@/lib/networkUtils';

// Safe dynamic import with retry logic
const loadComponent = (loader: () => Promise<any>, maxRetries = 3): Promise<{ default: ComponentType<any> }> => {
  return new Promise((resolve, reject) => {
    const attempt = (retryCount = 0) => {
      loader()
        .then(resolve)
        .catch(err => {
          if (retryCount < maxRetries) {
            console.log(`Retrying (${retryCount + 1}/${maxRetries})...`);
            setTimeout(() => attempt(retryCount + 1), 1000 * (retryCount + 1));
          } else {
            reject(err);
          }
        });
    };
    attempt();
  });
};

const VRIntegration = lazy(() => loadComponent(() => import('./VRIntegration'))
  .catch(err => {
    console.error('VR Integration load failed, trying SimpleVR:', err);
    return import('./SimpleVR');
  }));

const BeamerMode = lazy(() => loadComponent(() => import('./BeamerMode'))
  .catch(err => {
    console.error('Beamer Mode load failed:', err);
    return { default: () => <BeamerErrorView error={err} /> };
  }));

// Error views
const VRErrorView = ({ error }: { error: Error }) => (
  <div className="error-view">
    <h3>VR Mode Unavailable</h3>
    <p>{error.message}</p>
    <button onClick={() => window.location.reload()}>Retry</button>
    <p className="fallback-note">Showing default view instead</p>
  </div>
);

const BeamerErrorView = ({ error }: { error: Error }) => (
  <div className="error-view">
    <h3>Projector Mode Unavailable</h3>
    <p>{error.message}</p>
    <button onClick={() => window.location.reload()}>Retry</button>
  </div>
);

interface ViewModeWrapperProps {
  children: ReactNode;
}

export default function ViewModeWrapper({ children }: ViewModeWrapperProps) {
  const [mode, setMode] = useState('default');
  const [contentKey, setContentKey] = useState(0);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(
    checkNetwork().isOnline ? 'online' : 'offline'
  );

  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for religion changes to force re-render
  useEffect(() => {
    const handleReligionChange = () => {
      setContentKey(prev => prev + 1);
    };

    window.addEventListener('religionChanged', handleReligionChange);
    
    return () => {
      window.removeEventListener('religionChanged', handleReligionChange);
    };
  }, []);

  return (
    <div className="view-mode-wrapper">
      {/* Network status indicator */}
      {networkStatus === 'offline' && (
        <div className="network-alert">
          You are currently offline. Some features may be unavailable.
        </div>
      )}

      {/* Mode selector */}
      <div className="mode-selector">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          disabled={networkStatus === 'offline'}
        >
          <option value="default">Default View</option>
          <option value="vr" disabled={networkStatus === 'offline'}>
            VR Mode {networkStatus === 'offline' && '(Offline)'}
          </option>
          <option value="beamer">Beamer Mode</option>
        </select>
      </div>

      {/* Content area */}
      <ErrorBoundary 
        FallbackComponent={({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
          <div className="error-boundary">
            <h3>Something went wrong</h3>
            <pre>{error.message}</pre>
            <button onClick={resetErrorBoundary}>Try Again</button>
            <button onClick={() => setMode('default')}>Return to Default</button>
          </div>
        )}
      >
        {mode === 'default' && children}

        <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
          {mode === 'vr' && <VRIntegration key={`vr-${contentKey}`} originalContent={children} />}
          {mode === 'beamer' && <BeamerMode key={`beamer-${contentKey}`} originalContent={children} />}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 