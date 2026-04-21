import React from 'react';
import IssueCard from './IssueCard';
import { AlertTriangle, Timer, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const IssueColumn = ({ status, issues, onOpenDetail }) => {
  // WIP Limits
  const wipLimits = {
    'To Do': 20,
    'In Progress': 5,
    'Done': Infinity
  };

  const wipLimit = wipLimits[status] || Infinity;
  const isBottleneck = status === 'In Progress' && issues.length > 3;
  const isAtCapacity = issues.length >= wipLimit;
  const percentFilled = Math.min((issues.length / wipLimit) * 100, 100);

  // Correct icons
  const icons = {
    'Backlog': Timer,
    'In Progress': AlertTriangle, 
    'Completed': CheckCircle2
  };

  const Icon = icons[status];

  return (
    <div className="flex flex-col gap-5 min-w-[300px]">
      <div className={cn(
          "flex items-center justify-between px-3 py-3 transition-all rounded-2xl",
          isAtCapacity && wipLimit !== Infinity ? "bg-red-500/10 border border-red-500/20" : 
          isBottleneck ? "bg-amber-500/10 border border-amber-500/20" : ""
      )}>
        <div className="flex items-center gap-2 flex-1">
           <div className={cn("p-2 rounded-lg", status === 'Completed' ? "bg-slate-100" : status === 'In Progress' ? "bg-primary/10" : "bg-slate-100")}>
              <Icon className={cn("h-4 w-4", status === 'Completed' ? "text-slate-500" : status === 'In Progress' ? "text-primary" : "text-slate-500")} />
           </div>
           <div className="flex flex-col gap-1">
             <h3 className="font-bold text-sm tracking-tight text-foreground uppercase">{status}</h3>
             {wipLimit !== Infinity && (
               <div className="text-[8px] text-muted font-medium">WIP: {issues.length}/{wipLimit}</div>
             )}
           </div>
           <span className={cn(
             "px-2 py-1 text-[10px] font-black rounded-lg",
             isAtCapacity && wipLimit !== Infinity ? "bg-red-500/20 text-red-600" : "bg-neutral-100 text-muted"
           )}>
             {issues.length}
           </span>
        </div>
        <div className="flex items-center gap-2">
          {isAtCapacity && wipLimit !== Infinity && (
            <div className="text-[8px] font-black text-red-600 uppercase">AT CAPACITY</div>
          )}
          {isBottleneck && (
              <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  BOTTLENECK
              </div>
          )}
        </div>
      </div>

      <div className={cn(
        "flex flex-col gap-4 p-3 rounded-3xl transition-colors duration-300 min-h-[500px] relative",
        status === 'In Progress' && isBottleneck ? "bg-amber-500/5 border border-dashed border-amber-500/20 shadow-inner" : 
        isAtCapacity && wipLimit !== Infinity ? "bg-red-500/5 border border-dashed border-red-500/20" : "bg-white/10"
      )}>
        {/* Capacity Bar */}
        {wipLimit !== Infinity && (
          <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all rounded-full", 
                percentFilled > 80 ? "bg-red-500" : percentFilled > 60 ? "bg-amber-500" : "bg-green-500"
              )}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        )}

        {issues.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted/30 py-10">
                <Icon className="h-10 w-10 mb-2 opacity-20" />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {status === 'Backlog' ? 'Ready to Work' : status === 'In Progress' ? 'No Active Tasks' : 'Great Job!'}
                </span>
            </div>
        ) : (
            issues.map(issue => (
                <IssueCard key={issue._id} issue={issue} onOpenDetail={onOpenDetail} />
            ))
        )}
      </div>
    </div>
  );
};

export default IssueColumn;