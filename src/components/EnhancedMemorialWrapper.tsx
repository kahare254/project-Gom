import { useState, useEffect, Suspense, lazy } from 'react';

const VRViewer = lazy(() => import('./VRViewer'));
const BeamerViewer = lazy(() => import('./BeamerViewer'));

export default function EnhancedMemorialWrapper({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'original' | 'vr' | 'beamer'>('original');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <div className="relative">
      {/* Mode selector floating overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2 bg-white/80 p-2 rounded-lg shadow-lg">
        <button 
          onClick={() => setMode('original')}
          className="px-3 py-1 bg-gray-200 rounded text-sm"
        >
          Original
        </button>
        <button 
          onClick={() => setMode('vr')}
          className="px-3 py-1 bg-purple-100 rounded text-sm"
        >
          VR Mode
        </button>
        <button 
          onClick={() => setMode('beamer')}
          className="px-3 py-1 bg-blue-100 rounded text-sm"
        >
          Beamer Mode
        </button>
      </div>

      {/* Content switcher */}
      {mode === 'original' && children}
      {mode === 'vr' && isReady && (
        <div className="fixed inset-0 z-40 bg-black">
          <Suspense fallback={<div className="text-white text-center mt-20">Loading VR...</div>}>
            <VRViewer>{children}</VRViewer>
          </Suspense>
        </div>
      )}
      {mode === 'beamer' && isReady && (
        <Suspense fallback={<div className="text-center mt-20">Loading Beamer...</div>}>
          <BeamerViewer>{children}</BeamerViewer>
        </Suspense>
      )}
    </div>
  );
} 