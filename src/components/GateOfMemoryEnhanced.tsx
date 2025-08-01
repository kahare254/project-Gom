import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// Import images with proper handling for spaces in filenames
const placeholder1 = new URL('../assets/placeholder 1.jpg', import.meta.url).href;
const placeholder2 = new URL('../assets/placeholder 2.jpg', import.meta.url).href;
const qrCode = new URL('../assets/qr-code.png', import.meta.url).href;

interface TemplateContent {
  title: string;
  subtitle?: string;
  name: string;
  image: string;
}

export function GateOfMemoryEnhanced({ 
  initialTemplate, 
  hideReligionSelector = false 
}: { 
  initialTemplate?: 'christian' | 'muslim';
  hideReligionSelector?: boolean;
} = {}) {
  const [selectedTemplate, setSelectedTemplate] = useState<'christian' | 'muslim'>(initialTemplate || 'muslim');

  const templates: Record<string, TemplateContent> = {
    christian: {
      title: 'GATE OF',
      subtitle: 'MEMORY',
      name: 'Naomi N.',
      image: placeholder1
    },
    muslim: {
      title: 'GATE OF',
      subtitle: 'JANNAH',
      name: 'Aisha B.',
      image: placeholder2
    }
  };

  const currentTemplate = templates[selectedTemplate];

  // Fire custom event when religion changes
  useEffect(() => {
    const event = new CustomEvent('religionChanged', { 
      detail: { religion: selectedTemplate } 
    });
    window.dispatchEvent(event);
    console.log('Religion changed event fired:', selectedTemplate);
  }, [selectedTemplate]);

  // Check if we're in VR mode by looking for specific parent elements
  const [isVRMode, setIsVRMode] = useState(false);
  
  useEffect(() => {
    // Check if we're inside a VR container by looking for specific parent elements
    const checkForVRMode = () => {
      // Look for VR/3D canvas elements or VR-specific containers
      const vrElements = document.querySelectorAll('canvas[style*="width: 100%"][style*="height: 100%"]');
      const vrContainers = document.querySelectorAll('[class*="r3f"]'); // React Three Fiber containers
      
      // Also check if we're inside a transformed HTML element (common in VR mode)
      const isInTransformedElement = document.querySelector('div[style*="transform: translate3d"]') !== null;
      
      setIsVRMode(vrElements.length > 0 || vrContainers.length > 0 || isInTransformedElement);
    };
    
    // Check on mount and whenever the component updates
    checkForVRMode();
    
    // Also set up a small delay to check again after rendering completes
    const timeoutId = setTimeout(checkForVRMode, 500);
    
    // Set up a mutation observer to detect when VR elements are added
    const observer = new MutationObserver(checkForVRMode);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`min-h-screen w-full bg-transparent`}>
      <div className="relative min-h-screen w-full overflow-y-auto">
        {/* Religion Selector - Top Left - Hidden in VR mode or when hideReligionSelector is true */}
        {!hideReligionSelector && !isVRMode && (
          <div className="fixed top-4 left-4 z-10 religion-selector-container">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-gray-200">
              <Select
                value={selectedTemplate}
                onValueChange={(value: 'christian' | 'muslim') => setSelectedTemplate(value)}
              >
                <SelectTrigger className="w-[140px] h-10 bg-white border-2 border-green-200 hover:border-green-300 focus:border-green-500 transition-colors">
                  <SelectValue placeholder="Select faith" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="christian" className="cursor-pointer hover:bg-green-50">
                    <div className="flex items-center gap-2">
                      <span>✝️</span>
                      <span>Christian</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="muslim" className="cursor-pointer hover:bg-green-50">
                    <div className="flex items-center gap-2">
                      <span>☪️</span>
                      <span>Muslim</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className={`min-h-screen w-full flex items-center justify-center ${isVRMode ? 'pt-0' : 'pt-16'}`}>
          <Card className={`p-6 ${isVRMode ? 'bg-transparent shadow-none border-none' : 'bg-[#f0fff4] shadow-lg border'} memorial-card w-[420px] relative max-w-full`}>
            <div className="text-center space-y-4">
              <div className="h-[24px]">
                {selectedTemplate === 'muslim' && (
                  <div className="text-[#006400] text-base font-arabic">
                    بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl font-serif text-[#006400] tracking-wide">
                {currentTemplate.title}
              </h1>
              <h2 className="text-3xl font-serif text-[#006400] tracking-wide">
                {currentTemplate.subtitle}
              </h2>

              <div className="my-4">
                <img 
                  src={currentTemplate.image}
                  alt="Memorial Gate" 
                  className="w-48 h-40 mx-auto rounded-lg shadow-md gate-image object-cover"
                />
              </div>

              <div className="space-y-1">
                <p className="text-lg text-[#006400]">In Loving Memory</p>
                <p className="text-xl font-semibold text-[#006400]">{currentTemplate.name}</p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-xs text-gray-600 text-left">
                  Scan with your camera to<br />view the hologram
                </p>
                <img 
                  src={qrCode}
                  alt="QR Code"
                  className="w-20 h-20 qr-code"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}