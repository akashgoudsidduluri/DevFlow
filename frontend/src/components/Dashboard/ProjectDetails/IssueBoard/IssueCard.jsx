import React, { useState, useEffect } from 'react';
import { useIssue } from '../../../../context/IssueContext';
import { 
    Clock, 
    Calendar, 
    ArrowUpCircle, 
    Trash2, 
    Edit3, 
    CheckCircle2,
    PlayCircle,
    AlertTriangle,
    Zap,
    Hourglass
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import GlassPanel from '../../../shared/GlassPanel';
import Button from '../../../shared/Button';
import AssignmentDropdown from './AssignmentDropdown';

const IssueCard = ({ issue, onOpenDetail }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [priority, setPriority] = useState(issue.priority);
  const { updateIssue, deleteIssue, loading } = useIssue();
  const [isDelayed, setIsDelayed] = useState(false);
  const [timeMetrics, setTimeMetrics] = useState({ daysInProgress: 0, daysUntilDeadline: null, isDueSoon: false });

  // Calculate time metrics
  useEffect(() => {
    const calculateMetrics = () => {
      let daysInProgress = 0;
      let daysUntilDeadline = null;
      let isDueSoon = false;

      // Days in progress
      if (issue.status === 'in_progress' && issue.inProgressSince) {
        const diff = Date.now() - new Date(issue.inProgressSince).getTime();
        daysInProgress = Math.floor(diff / (24 * 60 * 60 * 1000));
      }

      // Days until deadline
      if (issue.deadline) {
        const now = new Date();
        const deadline = new Date(issue.deadline);
        const diff = deadline - now;
        daysUntilDeadline = Math.ceil(diff / (24 * 60 * 60 * 1000));
        isDueSoon = daysUntilDeadline > 0 && daysUntilDeadline <= 2;
      }

      setTimeMetrics({ daysInProgress, daysUntilDeadline, isDueSoon });
    };

    calculateMetrics();
    const interval = setInterval(calculateMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [issue.status, issue.inProgressSince, issue.deadline]);

  useEffect(() => {
    let interval;
    if (issue.status === 'in_progress' && issue.inProgressSince) {
      interval = setInterval(() => {
        const diff = Date.now() - new Date(issue.inProgressSince).getTime();
        const threshold = 48 * 60 * 60 * 1000; // 48 Hours
        if (diff > threshold) {
          setIsDelayed(true);
        } else {
          setIsDelayed(false);
        }
      }, 5000); // Check every 5s
    } else {
      setIsDelayed(false);
    }
    return () => clearInterval(interval);
  }, [issue.status, issue.inProgressSince]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateIssue(issue._id, { title, description, priority });
      setIsEditing(false);
    } catch (err) {}
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateIssue(issue._id, { status: newStatus });
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (window.confirm(`Terminate issue: "${issue.title}"?`)) {
      try {
        await deleteIssue(issue._id);
      } catch (err) {}
    }
  };

  const priorityConfig = {
    high: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    medium: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    low: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  };

  const config = priorityConfig[issue.priority] || priorityConfig.low;
  const isOverdue = issue.status !== 'done' && issue.deadline && new Date(issue.deadline) < new Date();

  if (isEditing) {
    return (
      <GlassPanel className="p-4 bg-white border-primary/20">
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full text-sm font-bold bg-neutral-50 border-none rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
            placeholder="Issue Identity"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full text-xs bg-neutral-50 border-none rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Technical details..."
          />
          <div className="flex gap-2">
            <Button size="sm" type="submit" isLoading={loading}>Sync</Button>
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Abort</Button>
          </div>
        </form>
      </GlassPanel>
    );
  }

  return (
    <div className={cn(
      "group relative flex flex-col gap-4 rounded-xl border transition-all p-4",
      issue.status === 'done' 
        ? "bg-slate-50/50 border-slate-200 opacity-80 shadow-none" 
        : "bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
    )}>
      {/* Status Badges */}
      {isDelayed && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase tracking-tight rounded-md shadow-lg flex items-center gap-1 z-10">
              <Clock className="h-2.5 w-2.5" />
              Delayed
          </div>
      )}

      {/* Due Soon Indicator */}
      {timeMetrics.isDueSoon && !isDelayed && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-tight rounded-md shadow-lg flex items-center gap-1 z-10">
              <AlertTriangle className="h-2.5 w-2.5" />
              Due Soon
          </div>
      )}

      <div className="flex flex-col gap-4">
        <div
          onClick={() => onOpenDetail?.(issue._id)}
          className="space-y-1 cursor-pointer"
        >
          <div className="flex justify-between items-start gap-2">
             <h4 className={cn("text-sm font-semibold tracking-tight transition-colors flex-1", issue.status === 'done' ? "text-slate-400" : "text-slate-900")}>
               {issue.title}
             </h4>
             <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight border shrink-0", config.color, config.bg, config.border)}>
                 {issue.priority}
             </div>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {issue.description || 'No description provided.'}
          </p>

          {/* Time Metrics */}
          <div className="flex gap-2 pt-1 flex-wrap text-[9px] font-medium text-slate-400">
            {timeMetrics.daysInProgress > 0 && issue.status === 'in_progress' && (
              <div className={cn("flex items-center gap-1", timeMetrics.daysInProgress > 2 && "text-amber-600")}>
                <Hourglass className="h-2.5 w-2.5" />
                {timeMetrics.daysInProgress}d in progress
              </div>
            )}
            {timeMetrics.daysUntilDeadline !== null && (
              <div className={cn(
                "flex items-center gap-1",
                timeMetrics.daysUntilDeadline < 0 ? "text-red-600" : 
                timeMetrics.daysUntilDeadline <= 2 ? "text-amber-600" : 
                "text-slate-400"
              )}>
                <Calendar className="h-2.5 w-2.5" />
                {timeMetrics.daysUntilDeadline < 0 ? `${Math.abs(timeMetrics.daysUntilDeadline)}d overdue` : `${timeMetrics.daysUntilDeadline}d left`}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
           <div className="flex flex-wrap gap-2 flex-1 min-w-0">
              {issue.status === 'done' ? (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                  Resolved
                </div>
              ) : (
                <AssignmentDropdown 
                  projectId={issue.project} 
                  issueId={issue._id} 
                  currentAssignee={issue.assignedTo} 
                />
              )}
           </div>

           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1 text-slate-400 hover:text-slate-900 transition-colors">
                    <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                </button>
           </div>
        </div>

        <div className="pt-1">
            {issue.status === 'todo' && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); }}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg border border-primary/20 text-primary text-[11px] font-semibold uppercase tracking-wider hover:bg-primary hover:text-white transition-all active:scale-95"
              >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Start Task
              </button>
            )}
            {issue.status === 'in_progress' && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleStatusChange('done'); }}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
              >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complete
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;