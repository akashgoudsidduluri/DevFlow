import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  LogOut,
  PanelLeftOpen,
  Settings,
  User,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import GlassPanel from '../shared/GlassPanel';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const {
    isCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
  } = useLayout();

  const handleLogout = async () => {
    await logout();
    closeMobileSidebar();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'explore', name: 'Explore', icon: Compass, path: '/explore' },
    { id: 'profile', name: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isMobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMobileSidebar}
      />

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen transition-all duration-500 ease-out',
          'w-[18rem] px-3 py-3 lg:px-4 lg:py-4',
          isCollapsed ? 'lg:w-24' : 'lg:w-72',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <GlassPanel
          className={cn(
            'relative flex h-full flex-col overflow-hidden border-white/50 bg-white/72 py-5 shadow-2xl shadow-slate-900/10 transition-all duration-500',
            isCollapsed ? 'items-center px-2' : 'items-center px-3'
          )}
        >
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-primary/5 to-transparent" />

          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-white/90 text-muted shadow-sm transition hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>

          <div
            className={cn(
              'relative z-10 flex w-full items-center gap-3 overflow-hidden transition-all duration-500',
              isCollapsed ? 'mb-8 justify-center px-1 pt-2' : 'mb-10 justify-start px-3 pt-3'
            )}
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-400 shadow-lg shadow-primary/30">
              <span className="text-lg font-black text-white">D</span>
            </div>
            {!isCollapsed && (
              <div>
                <span className="block text-xl font-black tracking-tight text-gradient">DevFlow</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">
                  Project command
                </span>
              </div>
            )}
          </div>

          <nav className={cn('z-10 flex w-full flex-1 flex-col space-y-2', isCollapsed ? 'px-0.5' : 'px-1')}>
            {navItems.map((item) => {
              const isActive = item.path && location.pathname === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    isCollapsed ? 'flex h-12 w-12 self-center justify-center px-0' : 'flex items-center gap-3 px-4',
                    'group rounded-2xl py-3 transition-all duration-300',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted hover:bg-primary/5 hover:text-primary'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-white' : 'transition-transform group-hover:scale-110')} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                  {isActive && !isCollapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          <div className={cn('z-10 mt-auto w-full space-y-2 border-t border-border/50 pt-4', isCollapsed ? 'px-1' : 'px-2')}>
            {!isCollapsed && user && (
              <div className="mb-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Active Session</p>
                <p className="truncate text-xs font-bold text-foreground">{user.name}</p>
                <p className="mt-1 truncate text-[11px] text-muted">{user.email}</p>
              </div>
            )}

            <button
              onClick={handleLogout}
              title={isCollapsed ? 'Sign Out' : undefined}
              className={cn(
                isCollapsed ? 'flex h-12 w-12 self-center justify-center px-0' : 'flex items-center gap-3 px-4',
                'group w-full rounded-2xl py-3 text-muted transition-all hover:bg-red-50 hover:text-red-500'
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
              {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
            </button>
          </div>

          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-24 z-50 hidden rounded-full border border-border bg-white p-2 text-muted shadow-md transition-colors hover:text-primary lg:inline-flex"
            aria-label="Toggle sidebar"
          >
            <PanelLeftOpen className={cn('h-4 w-4 transition-transform duration-300', !isCollapsed && 'rotate-180')} />
          </button>
        </GlassPanel>
      </aside>
    </>
  );
};

export default Sidebar;
