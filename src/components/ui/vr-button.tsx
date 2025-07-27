import { useEffect, useState } from 'react';

interface VRButtonProps {
  className?: string;
}

export function VRButton({ className = '' }: VRButtonProps) {
  const [isVRSupported, setIsVRSupported] = useState(false);

  useEffect(() => {
    // Check if WebXR is supported
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        console.log('VR support:', supported);
        setIsVRSupported(supported);
      });
    }
  }, []);

  const startVR = async () => {
    try {
      if (navigator.xr) {
        const session = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
        });
        console.log('VR session started:', session);
      }
    } catch (error) {
      console.error('Error starting VR session:', error);
    }
  };

  if (!isVRSupported) {
    console.log('VR not supported');
    return null;
  }

  return (
    <button
      onClick={startVR}
      className={`fixed top-4 right-4 z-50 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ${className}`}
    >
      Enter VR
    </button>
  );
} 