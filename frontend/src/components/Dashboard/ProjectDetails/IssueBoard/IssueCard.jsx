import React, { useState, useEffect } from 'react';
import { useIssue } from '../../../../context/IssueContext';
import { 
    Clock, 
    Calendar, 
    ArrowUpCircle, 
    Trash2, 
    Edit3, 
    CheckCircle2,
    PlayCircle
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

  const isOverdue = issue.status !== 'done' && issue.deadline && new Date(issue.deadline) < new Date();

  return (
    <GlassPanel 
        className={cn(
            "p-5 border-l-4 relative group transition-all duration-300",
            issue.priority === 'high' ? "border-l-red-500" : issue.priority === 'medium' ? "border-l-amber-500" : "border-l-primary",
            issue.status === 'done' ? "bg-green-50/40 opacity-70" : "bg-white/60 hover:bg-white"
        )}
    >
      {/* Visual Delay Indicator */}
      {isDelayed && (
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-lg shadow-sm animate-pulse z-10 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Delayed
          </div>
      )}

      <div className="flex flex-col gap-4">
        <div
          onClick={() => onOpenDetail?.(issue._id)}
          className="space-y-1 cursor-pointer"
        >
          <div className="flex justify-between items-start">
             <h4 className={cn("text-sm font-bold tracking-tight transition-colors", issue.status === 'done' ? "text-muted line-through" : "text-foreground")}>
               {issue.title}
             </h4>
             <div className={cn("flex items-center gap-1.2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", config.color, config.bg, config.border)}>
                 <ArrowUpCircle className="h-2.5 w-2.5" />
                 {issue.priority}
             </div>
          </div>
          
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
            {issue.description || 'No system logs provided for this task.'}
          </p>
        </div>

        <div className="flex items-center justify-between">
           <div className="flex flex-wrap gap-2">
              {issue.status === 'done' ? (
                <div className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </div>
              ) : (
                <AssignmentDropdown 
                  projectId={issue.project} 
                  issueId={issue._id} 
                  currentAssignee={issue.assignedTo} 
                />
              )}
              {issue.deadline && (
                  <div className={cn(
                      "flex items-center gap-1 text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded-md",
                      isOverdue ? "bg-red-50 text-red-500" : "text-muted"
                  )}>
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(issue.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
              )}
           </div>

           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Engage Module
                </button>
            )}
            {issue.status === 'in_progress' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStatusChange('done'); }}
                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl bg-green-500/5 text-green-600 text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all active:scale-95"
                >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Finalize Deployment
                </button>
            )}
            {issue.status === 'done' && (
                <div className="flex items-center justify-center gap-2 py-1.5 rounded-xl bg-neutral-100 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500/40" />
                    Protocol Complete
                </div>
            )}
        </div>
      </div>
    </GlassPanel>
  );
};

export default IssueCard;