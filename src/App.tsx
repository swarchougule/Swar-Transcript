import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
};

export default App;
