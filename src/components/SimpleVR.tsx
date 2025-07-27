import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ReactNode } from 'react';

interface SimpleVRProps {
  originalContent: ReactNode;
}

const SimpleVR = ({ originalContent }: SimpleVRProps) => {
  return (
    <div className="simple-vr-container w-full h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 50 }}
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          alpha: false
        }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Html
          transform
          position={[0, 1.5, -2]}
          scale={0.8}
        >
          <div className="vr-content bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-white/20">
            {originalContent}
          </div>
        </Html>

        {/* Simple ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </Canvas>
      
      <div className="fixed top-4 left-4 z-50 bg-black/70 text-white p-3 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Simple VR Mode</h3>
        <p className="text-sm opacity-80">Use mouse to look around</p>
      </div>
    </div>
  );
};

export default SimpleVR; 