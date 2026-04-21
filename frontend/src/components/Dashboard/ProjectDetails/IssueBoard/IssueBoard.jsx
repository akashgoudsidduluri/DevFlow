import React, { useEffect, useState } from 'react';
import { useIssue } from '../../../../context/IssueContext';
import { useAuth } from '../../../../context/AuthContext';
import IssueColumn from './IssueColumn';
import IssueDetailModal from '../../../Issue/IssueDetailModal';
import { Search, ShieldAlert, Info } from 'lucide-react';
import GlassPanel from '../../../shared/GlassPanel';
import Skeleton from '../../../shared/Skeleton';

const IssueBoard = ({ projectId, projectMembers = [], isMember, isOwner }) => {
  const { issues, loading, error, getIssuesByProject, retryFetch } = useIssue();
  const { user } = useAuth();
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

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
    
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    
    const matchesAssignee = assigneeFilter === 'all' || 
                           (assigneeFilter === 'unassigned' ? !issue.assignedTo : 
                            assigneeFilter === 'mine' ? (issue.assignedTo?._id === user?._id || issue.assignedTo === user?._id) :
                            issue.assignedTo?._id === assigneeFilter);
    
    if (filterMode === 'mine') {
      const isMine = issue.assignedTo?._id === user?._id || issue.assignedTo === user?._id;
      return matchesSearch && matchesPriority && isMine;
    }
    
    if (filterMode === 'overdue') {
      const isOverdue = issue.deadline && new Date(issue.deadline) < new Date() && issue.status !== 'done';
      return matchesSearch && matchesPriority && isOverdue;
    }

    if (filterMode === 'dueSoon') {
      const now = new Date();
      const deadline = new Date(issue.deadline);
      const daysUntil = Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));
      const isDueSoon = issue.deadline && daysUntil > 0 && daysUntil <= 2 && issue.status !== 'done';
      return matchesSearch && matchesPriority && matchesAssignee && isDueSoon;
    }

    return matchesSearch && matchesPriority && matchesAssignee;
  }).sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    
    if (sortBy === 'deadline') {
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return aDeadline - bDeadline;
    }

    if (sortBy === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return 0;
  });

  const statusTokens = ['todo', 'in_progress', 'done'];
  const statusLabels = {
    todo: 'Backlog',
    in_progress: 'In Progress',
    done: 'Completed'
  };

  // Calculate board stats
  const stats = {
    total: issues.length,
    backlog: issues.filter(i => i.status === 'todo').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    completed: issues.filter(i => i.status === 'done').length,
    overdue: issues.filter(i => i.deadline && new Date(i.deadline) < new Date() && i.status !== 'done').length,
    high: issues.filter(i => i.priority === 'high').length,
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
    <div className="space-y-6 animate-faded-in-up">
      {/* Board Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <GlassPanel className="p-4 rounded-2xl text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1">Total Tasks</p>
        </GlassPanel>
        <GlassPanel className="p-4 rounded-2xl text-center border-primary/20">
          <p className="text-2xl font-bold text-foreground">{stats.backlog}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1">Backlog</p>
        </GlassPanel>
        <GlassPanel className="p-4 rounded-2xl text-center border-blue-500/20">
          <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-1">In Progress</p>
        </GlassPanel>
        <GlassPanel className="p-4 rounded-2xl text-center border-emerald-500/20">
          <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1">Completed</p>
        </GlassPanel>
        {stats.overdue > 0 && (
          <GlassPanel className="p-4 rounded-2xl text-center border-red-500/20 bg-red-50/50">
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mt-1">Overdue</p>
          </GlassPanel>
        )}
        {stats.high > 0 && (
          <GlassPanel className="p-4 rounded-2xl text-center border-orange-500/20">
            <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mt-1">High Priority</p>
          </GlassPanel>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <GlassPanel className="p-4 bg-white/40 space-y-4">
          {/* Search */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Status Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Status</label>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="w-full px-3 py-2 bg-white/50 border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all">All Tasks</option>
                <option value="mine">My Tasks</option>
                <option value="overdue">Overdue</option>
                <option value="dueSoon">Due Soon (2d)</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/50 border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Assignee</label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/50 border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all">All</option>
                <option value="mine">Assigned to me</option>
                <option value="unassigned">Unassigned</option>
                {projectMembers.map(member => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/50 border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="priority">Priority</option>
                <option value="deadline">Due Date</option>
                <option value="recent">Recently Created</option>
              </select>
            </div>

            {/* Results */}
            <div className="flex items-end">
              <GlassPanel className="w-full p-2.5 text-center rounded-lg bg-primary/5">
                <p className="text-sm font-bold text-primary">{filteredIssues.length} results</p>
              </GlassPanel>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {statusTokens.map(token => (
          <IssueColumn
            key={token}
            status={statusLabels[token]}
            issues={filteredIssues.filter(issue => issue.status === token)}
            onOpenDetail={setSelectedIssueId}
          />
        ))}
      </div>
      {selectedIssueId && (
        <IssueDetailModal
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          isMember={isMember}
          isOwner={isOwner}
        />
      )}
    </div>
  );
};

export default IssueBoard;
