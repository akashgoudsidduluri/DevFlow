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
  const { updateIssue, deleteIssue, loading } = useIssue();
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

  const isDelayed = issue.status === 'in_progress' && timeMetrics.daysInProgress > 2;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateIssue(issue._id, { title, description });
      setIsEditing(false);
    } catch {
      // Issue errors are surfaced through context state.
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateIssue(issue._id, { status: newStatus });
    } catch {
      // Issue errors are surfaced through context state.
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Terminate issue: "${issue.title}"?`)) {
      try {
        await deleteIssue(issue._id);
      } catch {
        // Issue errors are surfaced through context state.
      }
    }
  };

  const priorityConfig = {
    high: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    medium: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    low: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  };

  const config = priorityConfig[issue.priority] || priorityConfig.low;

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
    <GlassPanel 
        className={cn(
            "p-5 border-l-4 relative group transition-all duration-300",
            issue.priority === 'high' ? "border-l-red-500" : issue.priority === 'medium' ? "border-l-amber-500" : "border-l-primary",
            issue.status === 'done' ? "bg-green-50/40 opacity-70" : timeMetrics.isDueSoon ? "bg-amber-50/40 hover:bg-amber-50/60" : "bg-white/60 hover:bg-white"
        )}
    >
      {/* Visual Delay Indicator */}
      {isDelayed && (
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-lg shadow-sm animate-pulse z-10 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Delayed
          </div>
      )}

      {/* Due Soon Indicator */}
      {timeMetrics.isDueSoon && !isDelayed && (
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-lg shadow-sm animate-pulse z-10 flex items-center gap-1">
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
             <h4 className={cn("text-sm font-bold tracking-tight transition-colors flex-1", issue.status === 'done' ? "text-muted line-through" : "text-foreground")}>
               {issue.title}
             </h4>
             <div className={cn("flex items-center gap-1.2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0", config.color, config.bg, config.border)}>
                 <ArrowUpCircle className="h-2.5 w-2.5" />
                 {issue.priority}
             </div>
          </div>
          
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
            {issue.description || 'No system logs provided for this task.'}
          </p>

          {/* Time Metrics */}
          <div className="flex gap-2 pt-2 flex-wrap text-[8px] text-muted-foreground">
            {timeMetrics.daysInProgress > 0 && issue.status === 'in_progress' && (
              <div className={cn("px-2 py-0.5 rounded-lg flex items-center gap-1", timeMetrics.daysInProgress > 2 ? "bg-amber-100/50" : "bg-neutral-100")}>
                <Hourglass className={cn("h-2.5 w-2.5", timeMetrics.daysInProgress > 2 ? "text-amber-600" : "text-muted")} />
                {timeMetrics.daysInProgress}d in progress
              </div>
            )}
            {timeMetrics.daysUntilDeadline !== null && (
              <div className={cn(
                "px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium",
                timeMetrics.daysUntilDeadline < 0 ? "bg-red-100/50 text-red-700" : 
                timeMetrics.daysUntilDeadline <= 2 ? "bg-amber-100/50 text-amber-700" : 
                "bg-neutral-100 text-muted"
              )}>
                <Calendar className="h-2.5 w-2.5" />
                {timeMetrics.daysUntilDeadline < 0 ? `${Math.abs(timeMetrics.daysUntilDeadline)}d overdue` : `${timeMetrics.daysUntilDeadline}d left`}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
           <div className="flex flex-wrap gap-2 flex-1 min-w-0">
              {issue.status === 'done' ? (
                <div className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  Completed
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
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 hover:bg-primary/5 text-muted hover:text-primary rounded-lg transition-colors">
                    <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-1.5 hover:bg-red-50 text-muted hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
           </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-border/50">
            {issue.status === 'todo' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); }}
                  className={cn("w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95", isDelayed ? "bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white" : "bg-primary/5 text-primary hover:bg-primary hover:text-white")}
                >
                    <PlayCircle className="h-3.5 w-3.5" />
                    {isDelayed ? 'Resume (Delayed)' : 'Start Task'}
                </button>
            )}
            {issue.status === 'in_progress' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('done'); }}
                  className={cn("w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95", 
                    isDelayed ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-600 hover:text-white" : "bg-green-500/5 text-green-600 hover:bg-green-600 hover:text-white"
                  )}
                >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Complete
                </button>
            )}
            {issue.status === 'done' && (
                <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-neutral-100 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500/40" />
                    Completed
                </div>
            )}
        </div>
      </div>
    </GlassPanel>
  );
};

export default IssueCard;
