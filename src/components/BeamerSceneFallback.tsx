
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { MemorialData } from './GateOfMemory';
import { GateOfMemoryEnhanced } from '@/components/GateOfMemoryEnhanced';

interface BeamerSceneFallbackProps {
  memorialData?: MemorialData;
}

type BeamerMode = 'slideshow' | 'reflection' | 'interactive' | 'presentation';
type Resolution = '720p' | '1080p' | '4k';

export const BeamerSceneFallback: React.FC<BeamerSceneFallbackProps> = ({ memorialData = {} }) => {
  const [mode, setMode] = useState<BeamerMode>('slideshow');
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [brightness, setBrightness] = useState([100]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Projector-friendly resolution settings
  const resolutionSizes = {
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '4k': { width: 3840, height: 2160 }
  };
  const { width, height } = resolutionSizes[resolution];

  const slides = [
    { type: 'title', content: memorialData?.name || 'Memorial', subtitle: 'Memorial Service' },
    { type: 'dates', content: `${memorialData?.birthDate || ''} - ${memorialData?.deathDate || ''}`, subtitle: 'Life Span' },
    { type: 'biography', content: memorialData?.biography || '', subtitle: 'Life Story' },
    ...((memorialData?.memories || []).map((memory, i) => ({ 
      type: 'memory', 
      content: memory, 
      subtitle: `Memory ${i + 1}` 
    })))
  ];

  useEffect(() => {
    if (mode === 'slideshow' && autoAdvance) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [mode, autoAdvance, slides.length]);

  const renderSlideContent = () => {
    const slide = slides[currentSlide];
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="max-w-4xl space-y-8">
          <div className="text-lg text-black uppercase tracking-wider">
            {slide.subtitle}
          </div>
          <div className={`
            ${slide.type === 'title' ? 'text-6xl md:text-8xl font-bold text-black' : 
              slide.type === 'dates' ? 'text-4xl md:text-6xl font-medium text-black' : 
              'text-2xl md:text-3xl text-black'}
          `}>
            {slide.content}
          </div>
          {/* Template removed from slideshow mode */}
        </div>
      </div>
    );
  };

  // Get religion from memorialData or fallback to detection by name
  let religion: 'christian' | 'muslim' = 'christian';
  if (memorialData?.religion) {
    religion = memorialData.religion.toLowerCase() as 'christian' | 'muslim';
  } else if (memorialData?.name && (memorialData.name.toLowerCase().includes('aisha') || memorialData.name.toLowerCase().includes('jannah'))) {
    religion = 'muslim';
  }
  // Religion-specific color schemes - Updated to use black text and soft green background
  const religionColors = {
    christian: {
      bg: '#e8f5e8', // soft faded green background
      accent: '#000000', // black accent
      text: '#000000', // black text
      badge: 'bg-green-200 text-black',
    },
    muslim: {
      bg: '#e8f5e8', // soft faded green background
      accent: '#000000', // black accent
      text: '#000000', // black text
      badge: 'bg-green-200 text-black',
    }
  };
  const currentColors = religionColors[religion];
  // Religion-specific messages
  const reflectionMessages = {
    christian: {
      message: 'May you find comfort in cherished memories and strength in the love that surrounds you. Though the journey of life has paused, the melody of their kindness and the warmth of their spirit remain. In every gentle breeze and ray of light, their love endures. "He will wipe every tear from their eyes, and there will be no more death or sorrow or crying or pain." (Revelation 21:4)',
      verse: 'John 14:27 - "Peace I leave with you; my peace I give you. Do not let your hearts be troubled and do not be afraid."'
    },
    muslim: {
      message: 'May Allah grant your loved one peace and eternal rest. In the garden of remembrance, faith is a gentle breeze and hope a guiding star. Every soul returns to its Creator, and in that reunion, there is no sorrow—only light. Cherish the moments, for love is never lost. "Indeed, with hardship comes ease." (Quran 94:6)',
      verse: 'Quran 2:156 - "Indeed, we belong to Allah and to Him we shall return."'
    }
  };
  const currentReflection = reflectionMessages[religion];

  const renderReflectionMode = () => (
    <div className="h-full flex flex-col items-center justify-start p-8" style={{ background: currentColors.bg, borderRadius: '1rem', minHeight: '100%', position: 'relative' }}>
      <div className="text-center space-y-8 max-w-3xl">
        <div className="text-xl mb-4" style={{ color: '#111', fontWeight: 500, textShadow: '0 1px 2px #fff8' }}>
          {currentReflection.message}
        </div>
        <h1 className="text-5xl font-bold mb-4" style={{ color: currentColors.accent }}>
          {memorialData?.name || 'Memorial'}
        </h1>
        <div className="text-lg italic mb-4" style={{ color: currentColors.accent }}>
          {currentReflection.verse}
        </div>
        {/* Template image removed from reflection mode */}
      </div>
    </div>
  );

  return (
    <div 
      className="relative w-full h-full rounded-lg overflow-hidden"
      style={{ filter: `brightness(${brightness[0]}%)`, width, height, maxWidth: '100vw', maxHeight: '100vh', margin: '0 auto', background: currentColors.bg }}
    >
      {/* Beamer Controls - move display mode dropdown to top right */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <Card className="" style={{ background: currentColors.bg, borderColor: currentColors.accent }}>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={currentColors.badge}>Beamer Mode</Badge>
              <Badge variant="outline" style={{ color: currentColors.text, borderColor: currentColors.accent }}>{resolution}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white">Display Mode</label>
              <Select value={mode} onValueChange={(value: BeamerMode) => setMode(value)}>
                <SelectTrigger className="w-40 bg-black/50 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slideshow">Slideshow</SelectItem>
                  <SelectItem value="reflection">Reflection</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white">Resolution</label>
              <Select value={resolution} onValueChange={(value: Resolution) => setResolution(value)}>
                <SelectTrigger className="w-40 bg-black/50 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (FHD)</SelectItem>
                  <SelectItem value="4k">4K (UHD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white">Brightness: {brightness[0]}%</label>
              <Slider
                value={brightness}
                onValueChange={setBrightness}
                max={100}
                min={10}
                step={10}
                className="w-40"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Slideshow Controls */}
      {mode === 'slideshow' && (
        <div className="absolute top-4 left-4 z-10">
          <Card className="bg-black/50 border-white/20">
            <CardContent className="p-3 space-y-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  className="bg-black/50 border-white/20 text-white"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                  className="bg-black/50 border-white/20 text-white"
                >
                  Next
                </Button>
              </div>
              <Button
                size="sm"
                variant={autoAdvance ? "default" : "outline"}
                onClick={() => setAutoAdvance(!autoAdvance)}
                className="w-full"
              >
                Auto Advance
              </Button>
              <div className="text-xs text-white/70 text-center">
                Slide {currentSlide + 1} of {slides.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Content Area */}
      <div className="absolute inset-0 text-white">
        {mode === 'slideshow' && renderSlideContent()}
        {mode === 'reflection' && renderReflectionMode()}
        {mode === 'presentation' && renderSlideContent()}
        {mode === 'resolution' && (
          <div className="flex justify-center items-center h-full">
            <GateOfMemoryEnhanced />
          </div>
        )}
        {mode === 'default' && (
          <div className="flex flex-col justify-center items-center h-full relative">
            <GateOfMemoryEnhanced />
            {/* Scroll down button */}
            <button
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/80 text-black px-4 py-2 rounded-full shadow hover:bg-white"
              onClick={() => {
                window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
              }}
            >
              ↓ Scroll Down
            </button>
          </div>
        )}
        {mode === 'slideshow' && (
          <button
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/80 text-black px-4 py-2 rounded-full shadow hover:bg-white z-20"
            onClick={() => {
              window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
            }}
          >
            ↓ Scroll Down
          </button>
        )}
      </div>
      {/* Projection Info */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="bg-black/50 border-white/20">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-white">
              <div>
                <div className="font-medium">Mode</div>
                <div className="text-white/70 capitalize">{mode}</div>
              </div>
              <div>
                <div className="font-medium">Resolution</div>
                <div className="text-white/70">{resolution}</div>
              </div>
              <div>
                <div className="font-medium">Brightness</div>
                <div className="text-white/70">{brightness[0]}%</div>
              </div>
              <div>
                <div className="font-medium">Status</div>
                <div className="text-green-400">Projecting</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};