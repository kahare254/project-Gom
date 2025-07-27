import { useState, useEffect } from 'react';

interface HardwareCapabilities {
  vrSupported: boolean;
  beamerReady: boolean;
  webGL: boolean;
  gyroAvailable: boolean;
  highDPI: boolean;
  mobile: boolean;
}

type DisplayMode = 'original' | 'vr' | 'beamer';

export function HardwareGate({ children }: { children: React.ReactNode }) {
  const [capabilities, setCapabilities] = useState<HardwareCapabilities | null>(null);
  const [optimalMode, setOptimalMode] = useState<DisplayMode>('original');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initHardware() {
      try {
        // Basic hardware detection without external module
        const caps: HardwareCapabilities = {
          vrSupported: typeof navigator !== 'undefined' && 'xr' in navigator,
          beamerReady: true, // Assume beamer is always ready
          webGL: (() => {
            try {
              const canvas = document.createElement('canvas');
              return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
              return false;
            }
          })(),
          gyroAvailable: typeof DeviceOrientationEvent !== 'undefined',
          highDPI: window.devicePixelRatio > 1,
          mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        };
        
        setCapabilities(caps);

        // Determine optimal mode based on capabilities
        let mode: DisplayMode = 'original';
        if (caps.vrSupported && caps.webGL) {
          mode = 'vr';
        } else if (caps.beamerReady) {
          mode = 'beamer';
        }
        
        setOptimalMode(mode);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize hardware');
      }
    }

    initHardware();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center text-red-600 p-4 rounded-lg bg-white shadow-lg">
          <h2 className="text-xl font-bold mb-2">Hardware Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!capabilities) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Detecting hardware capabilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hardware-gate relative">
      {/* Hardware status indicator */}
      <div className="fixed top-4 left-4 z-50 bg-white/90 p-3 rounded-lg shadow-md text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span>VR:</span>
            <span className={capabilities.vrSupported ? 'text-green-600' : 'text-red-600'}>
              {capabilities.vrSupported ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Beamer:</span>
            <span className={capabilities.beamerReady ? 'text-green-600' : 'text-red-600'}>
              {capabilities.beamerReady ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>WebGL:</span>
            <span className={capabilities.webGL ? 'text-green-600' : 'text-red-600'}>
              {capabilities.webGL ? '✓' : '✗'}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span>Mode:</span>
          <span className="font-semibold text-blue-600">{optimalMode}</span>
          {capabilities.mobile && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              Mobile
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="min-h-screen">
        {children}
      </div>
    </div>
  );
} 