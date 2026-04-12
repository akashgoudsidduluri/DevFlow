import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Compass, Users, Sparkles, UserPlus, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import API from '../../utils/api';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';
import ProjectCard from '../Dashboard/ProjectList/ProjectCard';
import Skeleton from '../shared/Skeleton';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const Explore = () => {
    const { user: currentUser } = useAuth();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    
    const hasCalledInitial = useRef(false);
    const abortControllerRef = useRef(null);

    // Initial Fetch (Public Projects)
    const fetchPublicProjects = useCallback(async () => {
        try {
            setLoading(true);
            const response = await API.get('/projects/public');
            setProjects(response.data.projects || []);
            setError(null);
        } catch (err) {
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

    // Debounced Search Handler
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 2) {
                performSearch(query);
            } else if (query.length === 0) {
                setUsers([]);
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const performSearch = async (q) => {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setSearching(true);

        try {
            const response = await API.get(`/users/search?q=${q}`, {
                signal: abortControllerRef.current.signal
            });
            setUsers(response.data.users || []);
            setError(null);
        } catch (err) {
            if (err.name !== 'CanceledError') {
                setError('Search protocol interrupted.');
            }
        } finally {
            setSearching(false);
        }
    };

    // Optimistic Follow Toggle
    const toggleFollow = async (targetUser) => {
        const originalStatus = targetUser.isFollowing;
        
        // Update UI immediately (Optimistic)
        setUsers(prev => prev.map(u => 
            u._id === targetUser._id ? { ...u, isFollowing: !originalStatus } : u
        ));

        try {
            if (originalStatus) {
                await API.post(`/users/unfollow/${targetUser._id}`);
            } else {
                await API.post(`/users/follow/${targetUser._id}`);
            }
        } catch (err) {
            // Rollback on failure
            setUsers(prev => prev.map(u => 
                u._id === targetUser._id ? { ...u, isFollowing: originalStatus } : u
            ));
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            <div className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12">
                
                {/* Header & Sticky Search */}
                <header className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                                Explore Hub
                                <Compass className="h-8 w-8 text-primary animate-spin-slow" />
                            </h1>
                            <p className="text-muted text-lg max-w-xl">
                                Discover next-gen architectures and connect with top-tier developers in the DevFlow network.
                            </p>
                        </div>
                    </div>

                    <div className="sticky top-6 z-40">
                        <GlassPanel className="p-2 bg-white/80 backdrop-blur-md shadow-xl shadow-primary/5 border-primary/10">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search for developers by name..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-lg font-medium placeholder:text-muted/50"
                                />
                                {searching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                    </div>
                                )}
                            </div>
                        </GlassPanel>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    
                    {/* Lateral Sidebar (User Search Results) */}
                    <aside className="xl:col-span-4 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted flex items-center gap-2 px-2">
                            <Users className="h-4 w-4" />
                            Developers to Follow
                        </h3>

                        <div className="space-y-3">
                            {users.length > 0 ? (
                                users.map(user => (
                                    <GlassPanel key={user._id} className="p-4 flex items-center justify-between group hover:border-primary/30 transition-all">
                                        <Link to={`/profile/${user._id}`} className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary overflow-hidden">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                                                ) : user.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-foreground truncate max-w-[120px]">{user.name}</h4>
                                                <p className="text-[10px] text-muted font-medium">New Collaborator</p>
                                            </div>
                                        </Link>
                                        <button 
                                            onClick={() => toggleFollow(user)}
                                            className={cn(
                                                "p-2 rounded-lg transition-all",
                                                user.isFollowing 
                                                    ? "bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500" 
                                                    : "bg-primary/5 text-primary hover:bg-primary hover:text-white"
                                            )}
                                        >
                                            {user.isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                        </button>
                                    </GlassPanel>
                                ))
                            ) : query.length >= 2 && !searching ? (
                                <div className="text-center py-10 opacity-50">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No candidates found</p>
                                </div>
                            ) : query.length < 2 && (
                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/5 border-dashed">
                                    <p className="text-xs text-muted leading-relaxed text-center italic">
                                        Enter at least 2 characters to trigger the identity search protocol.
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Feed (Project Discovery) */}
                    <main className="xl:col-span-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted flex items-center gap-2 px-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Global Project Stream
                        </h3>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Skeleton className="h-64 rounded-3xl" />
                                <Skeleton className="h-64 rounded-3xl" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.length > 0 ? (
                                    projects.map(project => (
                                        <ProjectCard key={project._id} project={project} />
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center space-y-4 opacity-50">
                                        <Compass className="h-12 w-12 mx-auto text-muted animate-spin-slow" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No public projects currently broadcasted</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 text-sm font-medium flex items-center gap-2">
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
