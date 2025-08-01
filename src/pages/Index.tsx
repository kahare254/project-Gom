import { useState, useEffect } from 'react';
import { GateOfMemoryEnhanced } from '@/components/GateOfMemoryEnhanced';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BeamerSceneFallback } from '@/components/BeamerSceneFallback';
import VRBeamerIntegration from '@/components/VRBeamerIntegration';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample data templates for different religions
const memorialTemplates = {
  christian: {
    name: 'Naomi N.',
    birthDate: '1942',
    deathDate: '2023',
    biography: 'A beloved mother, friend, and pillar of the community. Her kindness and wisdom touched many lives.',
    memories: [
      'Always had a smile for everyone.',
      'Loved gardening and nature walks.',
      'Her stories brought the family together.',
      'A heart full of generosity.'
    ],
    religion: 'Christian'
  },
  muslim: {
    name: 'Aisha B.',
    birthDate: '1945',
    deathDate: '2023',
    biography: 'A devoted mother, friend, and pillar of the community. Her kindness and wisdom touched many lives.',
    memories: [
      'Always had a smile for everyone.',
      'Loved gardening and nature walks.',
      'Her stories brought the family together.',
      'A heart full of generosity.'
    ],
    religion: 'Muslim'
  }
};

export default function Index() {
  const [mode, setMode] = useState('default');
  const [selectedReligion, setSelectedReligion] = useState<'christian' | 'muslim'>('muslim');
  const [memorialData, setMemorialData] = useState(memorialTemplates.muslim);

  // Listen for religion change events from GateOfMemoryEnhanced
  useEffect(() => {
    const handleReligionChange = (event: CustomEvent) => {
      const { religion } = event.detail;
      setSelectedReligion(religion);
      setMemorialData(memorialTemplates[religion]);
    };

    window.addEventListener('religionChanged', handleReligionChange as EventListener);
    return () => {
      window.removeEventListener('religionChanged', handleReligionChange as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-end pt-8 pr-8">
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-60 h-10">
            <SelectValue placeholder="Select display mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Memorial</SelectItem>
            <SelectItem value="beamer">Beamer Mode (2D)</SelectItem>
            <SelectItem value="vrbeamer">VR/Beamer 3D</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ErrorBoundary>
        {mode === 'default' && <GateOfMemoryEnhanced initialTemplate={selectedReligion} />}
        {mode === 'beamer' && (
          <div className="mt-10">
            <BeamerSceneFallback memorialData={memorialData} />
          </div>
        )}
        {mode === 'vrbeamer' && (
          <div className="mt-10">
            <VRBeamerIntegration
              content={<GateOfMemoryEnhanced initialTemplate={selectedReligion} />}
              memorialData={memorialData}
              beamerOptions={{
                slides: memorialData?.memories?.map((m, i) => <div key={i} style={{fontSize:'2rem',color:'white'}}>{m}</div>) || [],
                resolution: '1080p',
                showControls: true
              }}
              vrOptions={{
                enableHologram: true,
                enableAR: true,
                hologramColor: '#00ffff',
                hologramOpacity: 0.7,
                hologramSize: 1.5,
                hologramPosition: [3, 2, -3],
                hologramRotation: [0, 0, 0],
                hologramLines: 30,
                hologramSpeed: 0.5,
                enableParticles: true,
                particleCount: 200,
                particleSize: 0.015,
                particleColor: '#00ffff'
              }}
            />
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
