import { useState, useEffect, lazy, ReactNode, ComponentType } from 'react';

// Type the lazy components properly
const VRIntegration = lazy(() => import('./VRIntegration').then(module => ({
  default: module.default as ComponentType<{ originalContent: ReactNode }>
})).catch(err => ({ 
  default: () => <div className="loading">VR failed to load: {err.message}</div> 
})));

const BeamerMode = lazy(() => import('./BeamerMode').then(module => ({
  default: module.default as ComponentType<{ originalContent: ReactNode }>
})).catch(err => ({
  default: () => <div className="loading">Beamer failed to load: {err.message}</div>
})));

interface EnhancedViewerProps {
  children: ReactNode;
}

export default function EnhancedViewer({ children }: EnhancedViewerProps) {
  const [mode, setMode] = useState('default');
  const [hardware, setHardware] = useState({
    vrSupported: false,
    beamerReady: false
  });

  useEffect(() => {
    // Hardware detection
    setHardware({
      vrSupported: typeof navigator.xr !== 'undefined',
      beamerReady: window.matchMedia('(min-width: 1280px)').matches
    });
  }, []);

  return (
    <div className="enhanced-viewer">
      <div className="mode-selector">
        <select 
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          aria-label="Select view mode"
        >
          <option value="default">Default View</option>
          {hardware.vrSupported && <option value="vr">VR Experience</option>}
          {hardware.beamerReady && <option value="beamer">Projector Mode</option>}
        </select>
      </div>

      {mode === 'default' && children}
      {mode === 'vr' && <VRIntegration originalContent={children} />}
      {mode === 'beamer' && <BeamerMode originalContent={children} />}
    </div>
  );
} 