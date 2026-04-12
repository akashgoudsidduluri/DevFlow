import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  const { isCollapsed } = useLayout();
  
  if (!user) return children;

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className={`flex-1 transition-all duration-500 ${isCollapsed ? 'pl-20 md:pl-20' : 'pl-64 md:pl-64'}`}> 
        {/* Dynamically adjust padding based on sidebar collapse state */}
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