
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#31326f] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#4fb7b3] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 animate-pulse">
            Loading TitanAquatics...
          </span>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
};

export default App;
