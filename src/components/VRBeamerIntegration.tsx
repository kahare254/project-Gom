import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Sparkles } from '@react-three/drei';
import { VRButton, XR } from '@react-three/xr';

// TypeScript declaration for the custom material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      hologramMaterial: any;
    }
  }
}

interface BeamerOptions {
  resolution?: '720p' | '1080p' | '4k';
}

interface VROptions {
  enableAR?: boolean;
  movementSensitivity?: number;
}

interface VRBeamerIntegrationProps {
  content: React.ReactNode;
  mode?: 'auto' | 'vr' | 'beamer' | 'mobile';
  beamerOptions?: BeamerOptions;
  vrOptions?: VROptions;
}

const VRBeamerIntegration: React.FC<VRBeamerIntegrationProps> = ({
  content,
  mode = 'auto',
  beamerOptions = {},
  vrOptions = {}
}) => {
  const [detectedMode, setDetectedMode] = useState(mode);

  // Default resolution
  const resolution = beamerOptions.resolution || '1080p';

  const {
    enableAR = false,
    movementSensitivity = 1.0
  } = vrOptions;

  // Enhanced VR/AR capability detection for Quest 2/3 compatibility
  useEffect(() => {
    if (mode !== 'auto') return;

    const checkCapabilities = async () => {
      // Check for WebXR VR support (Quest 2/3 compatible)
      if (typeof navigator !== 'undefined' && navigator.xr) {
        try {
          const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
          if (vrSupported) {
            setDetectedMode('vr');
            console.log('VR supported - Quest 2/3 compatible');
            return;
          }

          // Check for AR support
          if (enableAR) {
            try {
              const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
              if (arSupported) {
                console.log('AR supported');
                // Still use VR mode but with AR features enabled
                setDetectedMode('vr');
                return;
              }
            } catch (error) {
              console.log('WebXR AR not supported:', error);
            }
          }
        } catch (error) {
          console.log('WebXR not supported:', error);
        }
      }

      // Enhanced mobile detection with gyroscope support
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        setDetectedMode('mobile');
        return;
      }

      // Default to beamer mode
      setDetectedMode('beamer');
    };

    checkCapabilities();
  }, [mode, enableAR]);
  
  // No slideshow functionality needed

  // Enhanced content rendering with VR/AR features
  const renderContent = () => {
    if (detectedMode === 'vr') {
      // Instead of showing a different template, render the actual content passed to the component
      return (
        <>
          {/* VR Mode: Show the actual chosen template */}
          <Html
            center
            transform
            distanceFactor={15}
            position={[0, 0, -5]}
            style={{
              width: '800px',
              height: '600px',
              background: 'linear-gradient(135deg, #e8f5e8 0%, #d4f0d4 50%, #c8e6c8 100%)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              border: '3px solid rgba(184, 134, 11, 0.3)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: 'black'
            }}>
              {/* Render the actual content (GateOfMemoryEnhanced) with hidden religion selector */}
              {React.cloneElement(content as React.ReactElement, { hideReligionSelector: true })}
            </div>
          </Html>
          
          {/* AR-specific elements - only visible in AR mode */}
          {enableAR && (
            <group position={[0, 0, -3]}>
              {/* AR floor indicator */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                <ringGeometry args={[0.5, 0.6, 32]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
              </mesh>
            </group>
          )}
        </>
      );
    }

    if (detectedMode === 'mobile') {
      return (
        <>
          <Html
            center
            style={{
              width: '90vw',
              height: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'black',
              fontSize: '1.2rem',
              textAlign: 'center',
              background: 'rgba(232, 245, 232, 0.95)',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(5px)',
              zIndex: 10
            }}
          >
            <div>
              {/* Mobile shows the personal content/message */}
              {content}
              <div style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.7 }}>
                📱 Mobile Mode with 360° Movement
                {enableAR && ' | 📱 AR Ready'}
              </div>
            </div>
          </Html>
          
          {/* Mobile AR indicator */}
          {enableAR && (
            <group position={[0, -2, -5]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1, 1.1, 32]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
              </mesh>
              <Sparkles
                count={100}
                scale={[3, 0.5, 3]}
                size={0.012}
                speed={0.2}
                color="#80ffff"
                opacity={0.5}
              />
            </group>
          )}
        </>
      );
    }

    // Simple Beamer mode - just show the content
    if (detectedMode === 'beamer') {
      return (
        <Html center>
          <div style={{
            width: '90%',
            maxWidth: '1200px',
            height: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            padding: '40px',
            overflow: 'auto'
          }}>
            {content}
          </div>
        </Html>
      );
    }

    return (
      <Html center>
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'black',
          background: 'rgba(232, 245, 232, 0.9)',
          padding: '20px',
          borderRadius: '10px'
        }}>
          {/* Beamer default shows the person's message/content */}
          {content}
        </div>
      </Html>
    );
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* VR Button for Quest 2/3 compatibility */}
      {detectedMode === 'vr' && (
        <VRButton
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '12px 24px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
      )}

      {/* No controls needed in beamer mode */}

      {/* Enhanced Canvas with VR/AR support */}
      <Canvas
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #e8f5e8 0%, #d4f0d4 50%, #c8e6c8 100%)'
        }}
        dpr={resolution === '1080p' ? 1.5 : 1}
      >
        {detectedMode === 'vr' ? (
          <XR>
            <ambientLight intensity={0.5} />
            <Environment preset="sunset" />
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              rotateSpeed={movementSensitivity}
              zoomSpeed={1.2}
              panSpeed={0.8}
              minDistance={2}
              maxDistance={20}
            />
            {renderContent()}
          </XR>
        ) : (
          <>
            <ambientLight intensity={0.5} />
            <OrbitControls
              enableZoom={detectedMode !== 'mobile'}
              enablePan={detectedMode !== 'mobile'}
              enableRotate={detectedMode !== 'mobile'}
              rotateSpeed={movementSensitivity}
            />
            {renderContent()}
          </>
        )}
      </Canvas>
    </div>
  );
};

export default VRBeamerIntegration;