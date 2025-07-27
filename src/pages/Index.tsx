import React from 'react';
import { GateOfMemoryEnhanced } from '@/components/GateOfMemoryEnhanced';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ViewModeWrapper from '@/components/ViewModeWrapper';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary>
        <ViewModeWrapper>
          <GateOfMemoryEnhanced />
        </ViewModeWrapper>
      </ErrorBoundary>
    </div>
  );
}
