import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Compass,
  Loader2,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import API from '../../utils/api';
import GlassPanel from '../shared/GlassPanel';
import ProjectCard from '../Dashboard/ProjectList/ProjectCard';
import Skeleton from '../shared/Skeleton';
import { cn } from '../../lib/utils';

const Explore = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], projects: [] });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

  const hasCalledInitial = useRef(false);
  const abortControllerRef = useRef(null);

  const fetchPublicProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('/projects/public');
      setProjects(response.data.projects || []);
      setError(null);
    } catch {
      setError('Failed to synchronize with the global project stream.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasCalledInitial.current) {
      fetchPublicProjects();
      hasCalledInitial.current = true;
    }
  }, [fetchPublicProjects]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setSearchResults({ users: [], projects: [] });
        setSearching(false);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside to close implementation
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const performSearch = async (q) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setSearching(true);

    try {
      const response = await API.get(`/search?q=${q}`, {
        signal: abortControllerRef.current.signal,
      });
      setSearchResults(response.data || { users: [], projects: [] });
      setShowDropdown(true);
      setError(null);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError('Search protocol interrupted.');
      }
    } finally {
      setSearching(false);
    }
  };

  const toggleFollow = async (targetUser) => {
    const originalStatus = targetUser.isFollowing;

    setSearchResults((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user._id === targetUser._id ? { ...user, isFollowing: !originalStatus } : user
      )
    }));

    try {
      if (originalStatus) {
        await API.post(`/users/unfollow/${targetUser._id}`);
      } else {
        await API.post(`/users/follow/${targetUser._id}`);
      }
    } catch {
      setSearchResults((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user._id === targetUser._id ? { ...user, isFollowing: originalStatus } : user
        )
      }));
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <GlassPanel className="flex flex-col justify-center overflow-hidden p-6 sm:p-8 space-y-2">
            <div className="mb-2 self-start inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <Compass className="h-4 w-4" />
              Explore network
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl pt-2">
              Discover public workspaces and collaborators.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted">
              Search developers, browse public projects, and spot collaboration opportunities through a cleaner discovery flow.
            </p>
          </GlassPanel>

          <GlassPanel className="p-6 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-primary">Search developers</p>
                <p className="mt-2 text-sm leading-6 text-muted">Start typing a name to find people worth following or collaborating with.</p>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <div ref={dropdownRef} className="relative group rounded-xl border border-border bg-white/50 p-1 shadow-sm mt-4">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Search for developers or projects..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!showDropdown && e.target.value.length >= 2) setShowDropdown(true);
                }}
                onFocus={() => {
                  if (query.length >= 2) setShowDropdown(true);
                }}
                className="w-full rounded-lg bg-transparent py-3 pl-12 pr-12 text-sm outline-none transition-all placeholder:text-muted/70 focus:bg-white"
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
              )}
              
              {/* Autocomplete Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-2xl z-50 max-h-[400px] overflow-y-auto animate-faded-in-up">
                  {searching ? (
                    <div className="p-8 flex flex-col items-center justify-center text-muted">
                      <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                      <p className="text-xs font-semibold">Searching the network...</p>
                    </div>
                  ) : (searchResults.users?.length === 0 && searchResults.projects?.length === 0) ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="h-8 w-8 text-muted/30 mb-2" />
                      <p className="text-sm font-bold text-foreground">No matches found</p>
                      <p className="text-xs text-muted mt-1">Try expanding your search query.</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {/* Users Section */}
                      {searchResults.users?.length > 0 && (
                        <div className="px-3 pb-2 pt-1 border-b border-border/50 last:border-0 border-dashed">
                           <div className="px-2 py-2 flex items-center justify-between">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Developers</p>
                           </div>
                           <div className="space-y-1">
                              {searchResults.users.map((user) => (
                                <div key={user._id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors group">
                                  <Link to={`/profile/${user._id}`} className="flex flex-1 items-center gap-3 min-w-0" onClick={() => setShowDropdown(false)}>
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                                      {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" /> : user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{user.name}</p>
                                    </div>
                                  </Link>
                                  <button
                                    onClick={(e) => { e.preventDefault(); toggleFollow(user); }}
                                    className={cn(
                                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0',
                                      user.isFollowing
                                        ? 'bg-transparent text-muted hover:text-red-500'
                                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                    )}
                                  >
                                    {user.isFollowing ? 'Unfollow' : 'Follow'}
                                  </button>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                      
                      {/* Projects Section */}
                      {searchResults.projects?.length > 0 && (
                        <div className="px-3 pb-2 pt-2 border-b border-border/50 last:border-0 border-dashed">
                           <div className="px-2 py-2 flex items-center justify-between">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Projects</p>
                           </div>
                           <div className="space-y-1">
                              {searchResults.projects.map((proj) => (
                                <Link onClick={() => setShowDropdown(false)} key={proj._id} to={`/project/${proj._id}`} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group border border-transparent hover:border-border/60">
                                  <div className="min-w-0 flex-1 flex items-center gap-3">
                                    <Compass className="h-5 w-5 text-muted group-hover:text-primary transition-colors shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{proj.title}</p>
                                      <p className="text-xs text-muted truncate mt-0.5">{proj.description}</p>
                                    </div>
                                  </div>
                                  <span className="hidden sm:inline-flex bg-green-50 text-green-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shrink-0">
                                    {proj.status === 'Open' ? 'Active' : proj.status}
                                  </span>
                                </Link>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassPanel>
        </header>

        <div className="flex flex-col gap-10">
          
          <main className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                Global Project Stream
              </h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Public feed
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-80 rounded-[2rem]" />
                <Skeleton className="h-80 rounded-[2rem]" />
                <Skeleton className="h-80 hidden lg:block rounded-[2rem]" />
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            ) : (
              <GlassPanel className="flex flex-col items-center justify-center rounded-[2rem] py-24 text-center">
                <Compass className="mb-4 h-12 w-12 text-muted/40" />
                <p className="text-lg font-black text-foreground">No public projects available</p>
                <p className="mt-2 max-w-md text-sm leading-7 text-muted">When public workspaces are available, they’ll appear here in the discovery feed.</p>
              </GlassPanel>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-500">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Explore;
