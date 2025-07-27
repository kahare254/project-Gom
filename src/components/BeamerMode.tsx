import { useState, useEffect, ReactNode } from 'react';

interface BeamerModeProps {
  originalContent: ReactNode;
}

interface BeamerSettings {
  resolution: '720p' | '1080p' | '4k';
  mode: 'slideshow' | 'reflection';
  contrast: number;
}

interface ResolutionConfig {
  scale: number;
  quality: number;
}

const BeamerMode = ({ originalContent }: BeamerModeProps) => {
  const [settings, setSettings] = useState<BeamerSettings>({
    resolution: '1080p',
    mode: 'slideshow',
    contrast: 1.2
  });

  const resolutions: Record<string, ResolutionConfig> = {
    '720p': { scale: 1.2, quality: 0.8 },
    '1080p': { scale: 1.5, quality: 1 },
    '4k': { scale: 2, quality: 1.2 }
  };

  // Religion-specific spiritual reflection messages
  const spiritualMessages = {
    christian: {
      title: "In Loving Memory",
      message: "Though we may feel the pain of loss, we find comfort in knowing that our loved ones are now in the presence of our Heavenly Father. Through faith in Christ, we have the hope of eternal life and the promise that we will be reunited with those we love. May God's peace fill your hearts and may you find strength in His love during this time of remembrance.",
      verse: "John 14:27 - 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.'"
    },
    muslim: {
      title: "In Loving Memory",
      message: "In the name of Allah, the Most Gracious, the Most Merciful. Though our hearts ache with the pain of separation, we find solace in knowing that every soul shall taste death and to Allah we belong and to Him we shall return. May Allah grant our loved ones the highest place in Jannah and give us patience, comfort, and hope in the knowledge that we will be reunited in the hereafter.",
      verse: "Quran 2:156 - 'Indeed, we belong to Allah and indeed, to Him we will return.'"
    }
  };

  // Get current religion from content
  const getCurrentReligion = () => {
    // Create a temporary div to check the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalContent as string;
    const text = tempDiv.textContent || '';
    
    if (text.includes('Naomi N.') || text.includes('MEMORY')) {
      return 'christian';
    } else if (text.includes('Aisha B.') || text.includes('JANNAH')) {
      return 'muslim';
    }
    return 'muslim'; // default
  };

  const currentReligion = getCurrentReligion();
  const currentMessage = spiritualMessages[currentReligion];

  // Scroll to bottom function
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // Hide religion dropdown in beamer mode
    const style = document.createElement('style');
    style.textContent = `
      .beamer-container .religion-selector-container {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Cleanup
      document.head.removeChild(style);
    };
  }, []);

  // Listen for religion changes
  useEffect(() => {
    const handleReligionChange = (event: CustomEvent) => {
      // Force re-render when religion changes
    };

    window.addEventListener('religionChanged', handleReligionChange as EventListener);
    
    return () => {
      window.removeEventListener('religionChanged', handleReligionChange as EventListener);
    };
  }, []);

  return (
    <div className="beamer-container min-h-screen">
      <div className="beamer-controls fixed bottom-5 right-5 z-50 flex gap-2.5 bg-black/70 p-2.5 rounded-lg" style={{ pointerEvents: 'auto' }}>
        {/* Debug info */}
        <div className="text-xs text-white px-2 py-1 bg-red-500 rounded">
          {settings.resolution} | {settings.mode}
        </div>
        
        <select 
          value={settings.resolution}
          onChange={(e) => {
            console.log('Resolution changed to:', e.target.value);
            setSettings({...settings, resolution: e.target.value as BeamerSettings['resolution']});
          }}
          className="px-3 py-2 bg-gray-700 text-white border-none rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          style={{ pointerEvents: 'auto', zIndex: 1000 }}
        >
          {Object.keys(resolutions).map(res => (
            <option key={res} value={res}>{res.toUpperCase()}</option>
          ))}
        </select>
        
        <select 
          value={settings.mode}
          onChange={(e) => {
            console.log('Mode changed to:', e.target.value);
            setSettings({...settings, mode: e.target.value as BeamerSettings['mode']});
          }}
          className="px-3 py-2 bg-gray-700 text-white border-none rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          style={{ pointerEvents: 'auto', zIndex: 1000 }}
        >
          <option value="slideshow">Slideshow</option>
          <option value="reflection">Spiritual Reflection</option>
        </select>

        <button
          onClick={() => {
            console.log('Scroll button clicked');
            scrollToBottom();
          }}
          className="px-3 py-2 bg-green-600 text-white border-none rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          title="Scroll to Bottom"
          style={{ pointerEvents: 'auto', zIndex: 1000 }}
        >
          ↓
        </button>
      </div>

      <div 
        className="beamer-content w-full max-w-[1920px] mx-auto transition-transform duration-300 ease-in-out"
        style={{
          transform: `scale(${resolutions[settings.resolution].scale})`,
          filter: `contrast(${settings.contrast})`
        }}
      >
        {settings.mode === 'slideshow' ? (
          // Slideshow mode - show complete default view
          <div className="beamer-frame-container">
            {originalContent}
          </div>
        ) : (
          // Spiritual reflection mode
          <div className="spiritual-reflection-container">
            <div className="reflection-header">
              <h1 className="reflection-title text-4xl font-serif text-gold mb-4">
                {currentMessage.title}
              </h1>
            </div>
            
            <div className="reflection-content">
              <div className="reflection-message text-xl leading-relaxed mb-8 text-center max-w-4xl mx-auto">
                {currentMessage.message}
              </div>
              
              <div className="reflection-verse text-lg italic text-gold text-center mb-8">
                "{currentMessage.verse}"
              </div>
              
              <div className="reflection-memorial">
                <div className="beamer-simple-frame">
                  {originalContent}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeamerMode; 