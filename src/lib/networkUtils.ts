export const checkNetwork = () => {
  return {
    isOnline: typeof navigator !== 'undefined' && navigator.onLine,
    isLocalhost: window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1'
  };
};

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(err => {
          console.log('SW registration failed:', err);
        });
    });
  }
}; 