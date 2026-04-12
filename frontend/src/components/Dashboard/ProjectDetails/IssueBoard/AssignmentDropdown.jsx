import React, { useState, useEffect, useRef } from 'react';
import { useIssue } from '../../../../context/IssueContext';
import { User, Check, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import GlassPanel from '../../../shared/GlassPanel';

const AssignmentDropdown = ({ projectId, issueId, currentAssignee }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { assignIssue, getSuggestions } = useIssue();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setLoadingSuggestions(true);
      try {
        const data = await getSuggestions(projectId);
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSuggestions(false);
      }
    }
  };

  const handleAssign = async (userId) => {
    try {
      await assignIssue(issueId, userId);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all text-[10px] font-bold",
          currentAssignee 
            ? "bg-primary/5 text-primary hover:bg-primary/10" 
            : "bg-neutral-100 text-muted hover:text-foreground hover:bg-neutral-200"
        )}
      >
        <User className="h-3 w-3" />
        <span className="truncate max-w-[80px]">
          {currentAssignee?.name?.split(' ')[0] || 'Unassigned'}
        </span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <GlassPanel className="absolute top-full left-0 mt-2 w-56 z-50 p-2 shadow-2xl bg-white/95 border-primary/10 animate-faded-in-up">
          <div className="text-[10px] font-black text-muted uppercase tracking-widest px-2 py-1 flex items-center justify-between">
            Assign Teammate
            {loadingSuggestions && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>

          <div className="mt-1 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
            {suggestions.map((member, index) => {
              const isSuggested = index === 0 && member.workload.totalWorkload === suggestions[0].workload.totalWorkload;
              const isSelected = currentAssignee?._id === member._id || currentAssignee === member._id;

              return (
                <button
                  key={member._id}
                  onClick={() => handleAssign(member._id)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-xl transition-all group relative",
                    isSelected ? "bg-primary/10" : "hover:bg-neutral-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">{member.name}</span>
                        {isSuggested && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-md text-[8px] font-black uppercase tracking-tighter">
                            <Sparkles className="h-2 w-2" />
                            Best Fit
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] text-muted-foreground flex gap-2">
                         <span>Load: {member.workload.totalWorkload}</span>
                         <span>Tasks: {member.workload.activeTaskCount}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
            {suggestions.length === 0 && !loadingSuggestions && (
              <div className="p-4 text-center text-xs text-muted">No members available</div>
            )}
          </div>
        </GlassPanel>
      )}
    </div>
  );
};

export default AssignmentDropdown;
