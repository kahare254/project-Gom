import { useState, useEffect } from 'react';

interface GyroscopeRotation {
  x: number;
  y: number;
  z: number;
}

export function useGyroFallback() {
  const [gyroAvailable, setGyroAvailable] = useState(false);
  const [rotation, setRotation] = useState<GyroscopeRotation | null>(null);

  useEffect(() => {
    let mounted = true;

    // Check if device orientation is available
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setGyroAvailable(true);

      // Request permission for iOS 13+ devices
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted' && mounted) {
              setGyroAvailable(true);
            }
          })
          .catch((error: Error) => {
            console.error('Error requesting gyroscope permission:', error);
            setGyroAvailable(false);
          });
      }

      // Handle device orientation changes
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (!mounted) return;

        // Convert degrees to radians
        const degToRad = (deg: number) => (deg * Math.PI) / 180;

        // Get rotation values, defaulting to 0 if null
        const beta = degToRad(event.beta || 0);  // X-axis rotation
        const gamma = degToRad(event.gamma || 0); // Y-axis rotation
        const alpha = degToRad(event.alpha || 0); // Z-axis rotation

        setRotation({
          x: beta,
          y: gamma,
          z: alpha
        });
      };

      window.addEventListener('deviceorientation', handleOrientation, true);

      return () => {
        mounted = false;
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  return { gyroAvailable, rotation };
} 