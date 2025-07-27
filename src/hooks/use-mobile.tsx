import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

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
    // Check if device orientation is supported
    if (typeof window !== 'undefined' && typeof window.DeviceOrientationEvent !== 'undefined') {
      // Request permission for iOS 13+ devices
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              setGyroAvailable(true);
            }
          })
          .catch(console.error);
      } else {
        // Non-iOS devices
        setGyroAvailable(true);
      }
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        setRotation({
          x: event.beta * (Math.PI / 180),  // Convert to radians
          y: event.alpha * (Math.PI / 180),
          z: event.gamma * (Math.PI / 180)
        });
      }
    };

    if (gyroAvailable) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (gyroAvailable) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [gyroAvailable]);

  return { gyroAvailable, rotation };
}
