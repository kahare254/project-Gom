import React from 'react';
import { GateOfMemoryEnhanced } from './GateOfMemoryEnhanced';

interface FinalMemorialExperienceProps {
  children?: React.ReactNode;
}

export function FinalMemorialExperience({ children }: FinalMemorialExperienceProps) {
  return (
    <div className="memorial-experience">
      {children || <GateOfMemoryEnhanced />}
        </div>
  );
} 