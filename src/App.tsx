import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import LauncherScreen from './components/LauncherScreen';
import { useLauncherStore } from './services/store';

function App() {
  const { isAuthenticated, user, initialize } = useLauncherStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-launcher-bg">
      {!isAuthenticated ? (
        <LoginScreen />
      ) : (
        <LauncherScreen />
      )}
    </div>
  );
}

export default App;
