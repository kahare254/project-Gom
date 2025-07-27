import { useThree, Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useEffect, useRef, useState, ReactNode } from 'react';

interface VRIntegrationProps {
  originalContent: ReactNode;
}

interface Orientation {
  alpha: number;
  beta: number;
  gamma: number;
}

type MovementMode = 'spiritual' | 'orbital' | 'linear';

// Separate component for VR content
const VRContent = ({ originalContent, movementMode }: { originalContent: ReactNode; movementMode: MovementMode }) => {
  const controlsRef = useRef<any>();
  
  // Movement scripts
  const movementScripts = {
    orbital: (delta: number) => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 0.5;
      }
    },
    linear: (delta: number) => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
        controlsRef.current.target.x += delta * 1.2;
      }
    },
    spiritual: (delta: number) => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 0.3;
      }
    }
  };

  // Apply movement script
  const MovementController = () => {
    useFrame((state, delta) => {
      if (controlsRef.current) {
        movementScripts[movementMode](delta);
      }
    });
    return null;
  };

  return (
    <>
      <MovementController />
      <OrbitControls ref={controlsRef} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.8} />
      
      {/* 3D Background */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Side walls for depth */}
      <mesh position={[0, 0, -10]} receiveShadow>
        <planeGeometry args={[50, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <Html
        transform
        sprite
        position={[0, 0, 0]}
        scale={2}
        occlude={false}
        center
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        <div className="vr-content transform-gpu" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {originalContent}
        </div>
      </Html>
    </>
  );
};

const VRIntegration = ({ originalContent }: VRIntegrationProps) => {
  const [movementMode, setMovementMode] = useState<MovementMode>('spiritual');
  const [isVRSupported, setIsVRSupported] = useState(false);

  // Check VR support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then(supported => {
        setIsVRSupported(supported);
      }).catch(() => {
        setIsVRSupported(false);
      });
    }
  }, []);

  // Hide religion dropdown in VR mode
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .vr-mode .religion-selector-container {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Add vr-mode class to body
    document.body.classList.add('vr-mode');
    
    return () => {
      // Cleanup
      document.head.removeChild(style);
      document.body.classList.remove('vr-mode');
    };
  }, []);

  // Listen for religion changes
  useEffect(() => {
    const handleReligionChange = (event: CustomEvent) => {
      // Force re-render when religion changes
      console.log('VR: Religion changed to', event.detail.religion);
    };

    window.addEventListener('religionChanged', handleReligionChange as EventListener);
    
    return () => {
      window.removeEventListener('religionChanged', handleReligionChange as EventListener);
    };
  }, []);

  return (
    <>
      {isVRSupported ? (
        <>
          <Canvas
            camera={{ position: [0, 0, 3], fov: 75 }}
            gl={{ 
              antialias: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
              alpha: true
            }}
            shadows
            dpr={[1, 2]}
          >
            <VRContent originalContent={originalContent} movementMode={movementMode} />
          </Canvas>
        </>
      ) : (
        <MobileGyroFallback content={originalContent} />
      )}
    </>
  );
};

interface MobileGyroFallbackProps {
  content: ReactNode;
}

const MobileGyroFallback = ({ content }: MobileGyroFallbackProps) => {
  const [orientation, setOrientation] = useState<Orientation>({ alpha: 0, beta: 0, gamma: 0 });
  const [hasPermission, setHasPermission] = useState(false);
  const [showWithoutGyro, setShowWithoutGyro] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      // Check if device orientation is supported
      if (typeof DeviceOrientationEvent === 'undefined') {
        console.log('DeviceOrientationEvent not supported');
        setHasPermission(false);
        return;
      }

      // Try to request permission (iOS Safari)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          setHasPermission(permission === 'granted');
        } catch (error) {
          console.log('Permission request failed:', error);
          setHasPermission(false);
        }
      } else {
        // For other browsers, try to access directly
        try {
          // Test if we can access orientation data
          const testEvent = new DeviceOrientationEvent('deviceorientation');
          setHasPermission(true);
        } catch (error) {
          console.log('Direct access failed:', error);
          setHasPermission(false);
        }
      }
    };
    
    requestPermission();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
      setOrientation({
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0
      });
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [hasPermission]);

  // Show content without gyroscope if user chooses
  if (showWithoutGyro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto p-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">VR Experience</h2>
            <p className="text-gray-600">Static view mode</p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6 mx-auto max-w-md">
            {content}
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2">VR Experience Options</h3>
          <p className="text-gray-600 mb-4">
            Choose how you'd like to experience the memorial:
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Try Gyroscope Again
            </button>
            <button
              onClick={() => setShowWithoutGyro(true)}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              View Without Gyroscope
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Mobile VR Experience</h2>
          <p className="text-gray-600">Tilt your device to explore the memorial</p>
        </div>

        <div
          className="bg-white rounded-lg shadow-xl p-6 mx-auto max-w-md transform transition-transform duration-200"
          style={{
            transform: `rotateX(${orientation.beta}deg) rotateY(${orientation.alpha}deg) rotateZ(${orientation.gamma}deg)`
          }}
        >
          {content}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Alpha: {orientation.alpha.toFixed(1)}° | Beta: {orientation.beta.toFixed(1)}° | Gamma: {orientation.gamma.toFixed(1)}°</p>
        </div>
      </div>
    </div>
  );
};

export default VRIntegration;