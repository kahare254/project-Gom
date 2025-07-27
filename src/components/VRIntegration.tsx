import { useState, useEffect, ReactNode } from 'react';

interface VRIntegrationProps {
  originalContent: ReactNode;
}

type MovementMode = 'spiritual' | 'orbital' | 'linear';

const VRIntegration = ({ originalContent }: VRIntegrationProps) => {
  const [movementMode, setMovementMode] = useState<MovementMode>('spiritual');

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

  return (
    <div className="vr-container min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      {/* VR Controls */}
      <div className="vr-controls fixed top-5 right-5 z-50 flex gap-2 bg-black/70 p-2 rounded-lg">
        <select 
          value={movementMode}
          onChange={(e) => setMovementMode(e.target.value as MovementMode)}
          className="px-3 py-2 bg-gray-700 text-white border-none rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="spiritual">Spiritual</option>
          <option value="orbital">Orbital</option>
          <option value="linear">Linear</option>
        </select>
      </div>

      {/* Simple 3D View */}
      <div className="vr-content-container flex items-center justify-center min-h-screen">
        <div className="vr-content bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-white/20 max-w-md">
          {originalContent}
        </div>
      </div>
    </div>
  );
};

export default VRIntegration;