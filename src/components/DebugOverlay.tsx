import { useState, useEffect } from 'react';

export function DebugOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      setLogs(prev => [...prev, args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')].slice(-10));
    };

    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      setLogs(prev => [...prev, `ERROR: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')}`].slice(-10));
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 text-white p-4 rounded-lg shadow-lg font-mono text-xs max-w-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Console</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white"
        >
          Close
        </button>
      </div>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
} 