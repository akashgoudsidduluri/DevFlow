import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  Users, 
  User,
  Search,
  Compass,
  ChevronLeft,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import GlassPanel from '../shared/GlassPanel';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'explore', name: 'Explore', icon: Compass, path: '/explore' },
    { id: 'profile', name: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen transition-all duration-500 z-50 p-4 pt-10",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <GlassPanel className="h-full flex flex-col items-center py-6 bg-white/60">
        <div className="flex items-center gap-3 px-4 mb-10 w-full overflow-hidden">
          <div className="p-2 bg-primary rounded-xl flex-shrink-0 shadow-lg shadow-primary/30">
             <span className="text-white font-black text-xl">D</span>
          </div>
          {!isCollapsed && <span className="font-bold text-xl tracking-tight text-gradient">DevFlow</span>}
        </div>

        <nav className="flex-1 w-full space-y-2 px-2">
          {navItems.map((item) => {
            const isActive = item.path && location.pathname === item.path;
            
            const content = (
              <>
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                {isActive && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </>
            );

            const className = cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted hover:bg-primary/5 hover:text-primary cursor-pointer"
              );

            if (!item.path) {
                return (
                    <div key={item.id} className={className}>
                        {content}
                    </div>
                );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="w-full px-2 mt-auto border-t border-border/50 pt-4 space-y-2">
             {!isCollapsed && user && (
                <div className="px-4 py-2 mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Active Session</p>
                    <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                </div>
             )}
             <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted hover:bg-red-50 hover:text-red-500 transition-all group"
             >
                <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                {!isCollapsed && <span className="font-medium text-sm">Sign Out</span>}
             </button>
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-border p-1 rounded-full shadow-md text-muted hover:text-primary transition-colors z-50"
        >
          {isCollapsed ? <ChevronLeft className="rotate-180 h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </GlassPanel>
    </aside>
  );
};

export default Sidebar;

