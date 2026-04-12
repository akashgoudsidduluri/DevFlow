import React from 'react';
import { Crown, Mail, Clock, ShieldCheck, UserMinus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useProject } from '../../../context/ProjectContext';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

const MemberList = ({ members, ownerId, pendingInvites = [], issues = [] }) => {
  const { id: projectId } = useParams();
  const { removeMember } = useProject();
  const { user } = useAuth();
  
  const isOwnerOfProject = user?._id === ownerId;

  const handleRemove = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the project?`)) {
      try {
        await removeMember(projectId, memberId);
      } catch (err) {
        alert(err.message || "Failed to remove member");
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Current Members */}
      {members.map((member, index) => {
        const isThisMemberOwner = member?._id === ownerId;
        if (!member) return null;
        
        // Intelligence: Calculate active workload
        const activeTasks = issues.filter(issue => 
            (issue.assignedTo?._id === member._id || issue.assignedTo === member._id) && 
            issue.status !== 'Done'
        ).length;
        const isBusy = activeTasks >= 3;

        return (
          <div key={`member-${member._id}-${index}`} className="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-transparent hover:border-border transition-all group">
            <div className="flex items-center gap-3">
               <div className="relative">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black",
                        isThisMemberOwner ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary/10 text-primary"
                    )}>
                        {member.name?.charAt(0) || '?'}
                    </div>
                    {/* Workload Intelligence Dot */}
                    <div 
                        className={cn(
                            "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white",
                            isBusy ? "bg-red-500" : "bg-green-500"
                        )} 
                        title={isBusy ? `Busy: ${activeTasks} tasks` : `${activeTasks} active tasks`}
                    />
               </div>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Link to={`/profile/${member._id}`} className="text-sm font-bold text-foreground group-hover:text-primary transition-colors hover:underline">
                      {member.name}
                    </Link>
                    {isBusy && <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Busy</span>}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-muted">
                    <Mail className="h-2.5 w-2.5" />
                    {member.email}
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
                {isThisMemberOwner ? (
                <div className="p-1.5 bg-yellow-400/10 text-yellow-600 rounded-lg group-hover:scale-110 transition-transform">
                    <Crown className="h-4 w-4" />
                </div>
                ) : (
                <>
                    {/* Show remove button only if the logged in user is the owner */}
                    {isOwnerOfProject && (
                        <button 
                            onClick={() => handleRemove(member._id, member.name)}
                            className="p-1.5 bg-red-100/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            title="Remove Member"
                        >
                            <UserMinus className="h-4 w-4" />
                        </button>
                    )}
                    <div className="p-1.5 bg-primary/5 text-primary/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                </>
                )}
            </div>
          </div>
        );
      })}

      {/* Pending Invitations */}
      {pendingInvites.map((invite, index) => (
        <div key={`invite-${invite._id}-${index}`} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50/50 border border-dashed border-border transition-all group opacity-70">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black bg-neutral-100 text-muted">
               ?
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-bold text-muted">Pending Verification</span>
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted">
                  <Mail className="h-2.5 w-2.5" />
                  {invite.email}
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-lg text-muted">
              <Clock className="h-3 w-3 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest">Invited</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberList;