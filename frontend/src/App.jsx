import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { IssueProvider } from './context/IssueContext';
import { SocketProvider } from './context/SocketContext';
import { LayoutProvider, useLayout } from './context/LayoutContext';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectDetails from './components/Dashboard/ProjectDetails/ProjectDetails';
import Profile from './components/Profile/Profile';
import Settings from './components/Settings/Settings';
import Explore from './components/Explore/Explore';
import VerificationPage from './components/Auth/VerificationPage';
import './App.css';

const LayoutWrapper = ({ children }) => {
  const { user } = useAuth();
  const { isCollapsed, toggleMobileSidebar } = useLayout();
  const location = useLocation();

  if (!user) return children;

  const titles = {
    '/dashboard': 'Workspace overview',
    '/explore': 'Discover public projects',
    '/profile': 'Profile and identity',
    '/settings': 'Settings and preferences',
  };

  const pageTitle = location.pathname.startsWith('/project/')
    ? 'Project workspace'
    : titles[location.pathname] || 'DevFlow';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={`min-h-screen transition-all duration-500 ${
          isCollapsed ? 'lg:pl-24' : 'lg:pl-72'
        }`}
      >
        <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={toggleMobileSidebar}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-white/80 text-foreground shadow-sm transition hover:border-primary/30 hover:text-primary"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                DevFlow
              </p>
              <p className="text-sm font-semibold text-foreground">{pageTitle}</p>
            </div>

            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <SocketProvider>
            <IssueProvider>
              <LayoutProvider>
                <LayoutWrapper>
                <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:id"
                  element={
                    <ProtectedRoute>
                      <ProjectDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/explore"
                  element={
                    <ProtectedRoute>
                      <Explore />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:id"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/verify-invite/:token"
                  element={
                    <ProtectedRoute>
                      <VerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
                </LayoutWrapper>
              </LayoutProvider>
            </IssueProvider>
          </SocketProvider>
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
