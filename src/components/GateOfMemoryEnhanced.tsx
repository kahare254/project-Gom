import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import placeholder1 from '../assets/placeholder 1.jpg';
import placeholder2 from '../assets/placeholder 2.jpg';
import qrCode from '../assets/qr-code.png';

interface TemplateContent {
  title: string;
  subtitle?: string;
  name: string;
  image: string;
}

export function GateOfMemoryEnhanced() {
  const [selectedTemplate, setSelectedTemplate] = useState<'christian' | 'muslim'>('muslim');

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

  return (
    <div className="h-screen p-4 bg-[#fff5f5] flex flex-col">
      {/* Religion Selector - Top Left */}
      <div className="flex justify-start mb-4 px-4 religion-selector-container">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-gray-200">
          <Select
            value={selectedTemplate}
            onValueChange={(value: 'christian' | 'muslim') => setSelectedTemplate(value)}
          >
            <SelectTrigger className="w-[140px] bg-white border-2 border-green-200 hover:border-green-300 focus:border-green-500 transition-colors">
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

      <div className="flex-1 flex items-center justify-center">
        <Card className="p-6 bg-[#f0fff4] shadow-lg memorial-card w-[420px] relative">
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
  );
} 