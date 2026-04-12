import React, { useEffect, useState } from 'react';
import { useIssue } from '../../../../context/IssueContext';
import { useAuth } from '../../../../context/AuthContext';
import IssueColumn from './IssueColumn';
import { Search, Filter, ShieldAlert, User, Layers, Info } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import GlassPanel from '../../../shared/GlassPanel';
import Skeleton from '../../../shared/Skeleton';

const IssueBoard = ({ projectId }) => {
  const { issues, loading, error, getIssuesByProject, retryFetch } = useIssue();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  useEffect(() => {
    if (projectId) getIssuesByProject(projectId);
  }, [projectId, getIssuesByProject]);

  if (loading && !issues.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (error) return (
    <div className="p-10 text-center space-y-4">
      <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
      <p className="text-red-500 font-bold">{error}</p>
      <button
        onClick={retryFetch}
        className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/80 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         issue.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterMode === 'mine') {
      const isMine = issue.assignedTo?._id === user?._id || issue.assignedTo === user?._id;
      return matchesSearch && isMine;
    }
    
    if (filterMode === 'high') {
      return matchesSearch && issue.priority === 'high';
    }

    return matchesSearch;
  }).sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    // Sort by priority weight
    if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    // Then by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const statusTokens = ['todo', 'in_progress', 'done'];
  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done'
  };

  if (!loading && issues.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="p-5 bg-primary/5 rounded-3xl">
        <Info className="h-10 w-10 text-primary/30" />
      </div>
      <div>
        <p className="font-black text-sm text-foreground">No tasks yet</p>
        <p className="text-xs text-muted mt-1">Create your first issue to get the board started.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-faded-in-up">
      {/* Search & Filter Bar */}
      <GlassPanel className="p-4 bg-white/40 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
          <input
            placeholder="Search workspace tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl">
           {[
             { id: 'all', label: 'All Tasks', icon: Layers },
             { id: 'mine', label: 'My Issues', icon: User },
             { id: 'high', label: 'Critical', icon: ShieldAlert, color: 'text-red-500' }
           ].map((filter) => (
             <button
               key={filter.id}
               onClick={() => setFilterMode(filter.id)}
               className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                 filterMode === filter.id 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-muted hover:text-foreground"
               )}
             >
               <filter.icon className={cn("h-3.5 w-3.5", filter.color)} />
               {filter.label}
             </button>
           ))}
        </div>
      </GlassPanel>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {statusTokens.map(token => (
          <IssueColumn
            key={token}
            status={statusLabels[token]}
            issues={filteredIssues.filter(issue => issue.status === token)}
          />
        ))}
      </div>
    </div>
  );
};

export default IssueBoard;