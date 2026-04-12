import React from 'react';
import IssueCard from './IssueCard';
import { AlertTriangle, Timer, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const IssueColumn = ({ status, issues, onOpenDetail }) => {
  const isBottleneck = status === 'In Progress' && issues.length > 3;

  // Correct icons
  const icons = {
    'To Do': Timer,
    'In Progress': AlertTriangle, 
    'Done': CheckCircle2
  };

  const Icon = icons[status];

  return (
    <div className="flex flex-col gap-5 min-w-[300px]">
      <div className={cn(
          "flex items-center justify-between px-3 py-2 transition-all",
          isBottleneck ? "bg-amber-500/10 border border-amber-500/20 rounded-2xl" : ""
      )}>
        <div className="flex items-center gap-2">
           <div className={cn("p-2 rounded-xl", status === 'Done' ? "bg-green-500/10" : status === 'In Progress' ? "bg-primary/10" : "bg-neutral-100")}>
              <Icon className={cn("h-4 w-4", status === 'Done' ? "text-green-600" : status === 'In Progress' ? "text-primary" : "text-neutral-500")} />
           </div>
           <h3 className="font-bold text-sm tracking-tight text-foreground uppercase tracking-widest">{status}</h3>
           <span className="px-2 py-0.5 bg-neutral-100 border border-border text-[10px] font-black rounded-lg text-muted">
             {issues.length}
           </span>
        </div>
        {isBottleneck && (
            <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase tracking-widest animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                BOTTLENECK
            </div>
        )}
      </div>

      <div className={cn(
        "flex flex-col gap-4 p-2 rounded-3xl transition-colors duration-300 min-h-[500px]",
        status === 'In Progress' && isBottleneck ? "bg-amber-500/5 border border-dashed border-amber-500/20 shadow-inner" : "bg-white/10"
      )}>

        {issues.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted/30 py-10">
                <Icon className="h-10 w-10 mb-2 opacity-20" />
                <span className="text-[10px] font-black tracking-widest uppercase">Empty Slot</span>
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