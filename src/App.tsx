import React, { useMemo } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { DesktopApp } from './desktop/DesktopApp';

export const App: React.FC = () => {
  const isDesktop = useMemo(() => {
    if (typeof window === 'undefined') return false;
    // Check electron IPC bridge
    if ((window as any).electronAPI?.isElectron) return true;
    // Check URL query parameter (for testing desktop mode in browser e.g. ?desktop=true)
    const params = new URLSearchParams(window.location.search);
    if (params.get('desktop') === 'true' || params.get('mode') === 'desktop') return true;
    return false;
  }, []);

  return (
    <AuthProvider>
      {isDesktop ? <DesktopApp /> : <Home />}
    </AuthProvider>
  );
};

export default App;

