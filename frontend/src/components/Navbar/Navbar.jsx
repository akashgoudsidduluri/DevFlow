import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Home, User, Settings, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <GlassPanel className="sticky top-0 z-50 rounded-none border-b border-border/40 p-4 sm:p-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 font-bold text-white">
            D
          </div>
          <span className="text-lg font-bold text-foreground hidden sm:inline">DevFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  isActive(link.href)
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted hover:bg-primary/8 hover:text-primary'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search (Desktop) */}
          <div className="hidden items-center gap-2 rounded-lg bg-white/30 px-3 py-2 lg:flex">
            <Search className="h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="w-32 border-0 bg-transparent text-sm text-foreground placeholder-muted focus:outline-none"
            />
          </div>

          {/* User Info */}
          <div className="hidden flex-col items-end gap-0.5 sm:flex pr-3 border-r border-border/40">
            <p className="text-xs font-semibold text-foreground">{user.name}</p>
            <p className="text-[11px] text-muted">@{user.name?.toLowerCase().replace(/\s/g, '')}</p>
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex gap-2 font-semibold"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg bg-primary/10 p-2 text-primary md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mt-4 space-y-2 border-t border-border/40 pt-4 md:hidden">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive(link.href)
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted hover:bg-primary/8 hover:text-primary'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="border-t border-border/40 pt-3">
            <Button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              variant="secondary"
              className="w-full justify-center gap-2 font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </GlassPanel>
  );
};

export default Navbar;
