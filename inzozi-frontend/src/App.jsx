import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import Chat from './pages/Chat';
import ImpressaAdmin from './pages/ImpressaAdmin';
import Delegations from './pages/Delegations';

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
      case 'delegations':
        return <Delegations />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {user?.activeDelegation && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold border-b border-purple-500/25 shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500 text-[9px] font-black uppercase px-2 py-0.5 rounded">Active Coverage</span>
              <span>
                You are temporarily operating as <strong className="text-purple-300">{user.activeDelegation.targetRoleName}</strong> (Authorized by {user.activeDelegation.authorizerName} for: <em>"{user.activeDelegation.reason}"</em>).
              </span>
            </div>
            <div className="text-[10px] text-purple-300 font-extrabold uppercase shrink-0">
              Expires: {new Date(user.activeDelegation.endDate).toLocaleDateString()}
            </div>
          </div>
        )}
        <main className="flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const NavigationWrapper = () => {
  const { user, loading } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // When user status changes (e.g. logouts), force redirect to public showcase
  useEffect(() => {
    if (!user && !loading) {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
        setPath('/');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider">Loading...</span>
        </div>
      </div>
    );
  }

  // User is authenticated -> Render internal MIS
  if (user) {
    return <MainLayout />;
  }

  // User is NOT authenticated -> Obscured route router
  if (path === '/inzozi-secure-gateway') {
    return (
      <Login 
        onBackToLanding={() => {
          window.history.pushState({}, '', '/');
          setPath('/');
        }}
      />
    );
  }

  // Redirect common routes or random typing back to / (obscurity)
  if (path !== '/') {
    window.history.replaceState({}, '', '/');
    // Queue state sync
    setTimeout(() => setPath('/'), 0);
  }

  // Render the gorgeous, public showcase page
  return (
    <Landing 
      onEnterPortal={() => {
        window.history.pushState({}, '', '/inzozi-secure-gateway');
        setPath('/inzozi-secure-gateway');
      }}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NavigationWrapper />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

