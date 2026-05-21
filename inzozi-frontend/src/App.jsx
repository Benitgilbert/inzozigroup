import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import Chat from './pages/Chat';
import ImpressaAdmin from './pages/ImpressaAdmin';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider">Syncing Inzozi Portal...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show the login view
  if (!user) {
    return <Login />;
  }

  // Render active view based on state selection
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <Kanban />;
      case 'chat':
        return <Chat />;
      case 'impressa-admin':
        return <ImpressaAdmin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainLayout />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
