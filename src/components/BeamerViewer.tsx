import { ReactNode } from 'react';

interface BeamerViewerProps {
  originalContent: ReactNode;
}

export default function BeamerViewer({ originalContent }: BeamerViewerProps) {
  return (
    <div className="beamer-container min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-8">
        {/* Projector optimized view */}
        <div className="aspect-video bg-[#f0fff4] rounded-lg shadow-2xl overflow-hidden">
          <div className="p-8 flex flex-col items-center justify-center h-full">
            {/* Render the original content with optimized styling */}
            <div className="transform scale-125">
              {originalContent}
            </div>
          </div>
        </div>

        {/* Projector mode controls */}
        <div className="mt-8 flex justify-center gap-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Full Screen
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Toggle QR Code
          </button>
        </div>
      </div>
    </div>
  );
} 