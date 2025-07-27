import React, { useState, useEffect, ReactNode } from 'react';

interface BeamerModeProps {
  originalContent: ReactNode;
}

interface BeamerSettings {
  resolution: '720p' | '1080p' | '4k';
  mode: 'slideshow' | 'reflection';
  autoScale: boolean;
}

const BeamerMode = ({ originalContent }: BeamerModeProps) => {
  const [settings, setSettings] = useState<BeamerSettings>({
    resolution: '1080p',
    mode: 'slideshow',
    autoScale: true
  });

  const resolutions = {
    '720p': { width: 1280, height: 720, scale: 0.8 },
    '1080p': { width: 1920, height: 1080, scale: 1.0 },
    '4k': { width: 3840, height: 2160, scale: 1.5 }
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
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="beamer-container min-h-screen bg-black">
      {/* Control Panel */}
      <div className="beamer-controls fixed bottom-5 left-5 z-[9999] bg-black/80 p-4 rounded-lg text-white">
        <div className="control-group mb-3">
          <label className="block text-xs mb-1">Projection Mode:</label>
          <select
            value={settings.mode}
            onChange={(e) => setSettings(prev => ({...prev, mode: e.target.value as BeamerSettings['mode']}))}
            className="px-3 py-2 bg-gray-700 text-white border rounded text-sm w-full"
          >
            <option value="slideshow">Slideshow</option>
            <option value="reflection">Spiritual Reflection</option>
          </select>
        </div>

        <div className="control-group mb-3">
          <label className="block text-xs mb-1">Resolution:</label>
          <select
            value={settings.resolution}
            onChange={(e) => setSettings(prev => ({...prev, resolution: e.target.value as BeamerSettings['resolution']}))}
            className="px-3 py-2 bg-gray-700 text-white border rounded text-sm w-full"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="4k">4K</option>
          </select>
        </div>

        <div className="control-group">
          <label className="block text-xs mb-1">Auto Scale:</label>
          <input
            type="checkbox"
            checked={settings.autoScale}
            onChange={(e) => setSettings(prev => ({...prev, autoScale: e.target.checked}))}
            className="ml-2"
          />
        </div>
      </div>

      {/* Projection Content */}
      <div 
        className="beamer-content w-full max-w-[1920px] mx-auto transition-all duration-300 ease-in-out"
        style={{
          transform: settings.autoScale ? `scale(${resolutions[settings.resolution].scale})` : 'scale(1)',
          width: settings.autoScale ? `${resolutions[settings.resolution].width}px` : 'auto',
          height: settings.autoScale ? `${resolutions[settings.resolution].height}px` : 'auto',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      >
        {settings.mode === 'slideshow' ? (
          // Slideshow mode - display the memorial template
          <div className="beamer-slideshow">
            <div className="beamer-frame">
              {originalContent}
            </div>
          </div>
        ) : (
          // Spiritual reflection mode
          <div className="beamer-reflection">
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
                <div className="beamer-frame">
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