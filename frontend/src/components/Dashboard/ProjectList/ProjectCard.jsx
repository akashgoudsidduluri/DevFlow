import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';
import { Edit2, Trash2, ExternalLink, MoreVertical, Github, Calendar, Users } from 'lucide-react';
import GlassPanel from '../../shared/GlassPanel';
import Button from '../../shared/Button';
import { cn } from '../../../lib/utils';

const ProjectCard = ({ project }) => {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const { updateProject, deleteProject, loading } = useProject();

  const isOwner = project.owner === currentUser?._id || project.owner?._id === currentUser?._id;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProject(project._id, name, description);
      setIsEditing(false);
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        await deleteProject(project._id);
      } catch (err) {}
    }
  };

  if (isEditing) {
    return (
      <GlassPanel className="p-6 border-primary/20 bg-blue-50/30">
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-white border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-white border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" type="submit" isLoading={loading}>Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </form>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel hoverEffect className="group p-6 flex flex-col h-full bg-white/40">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
            {project.name}
            {project.githubUrl && <Github className="h-4 w-4 text-muted group-hover:text-primary/50" />}
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.members?.length || 1} Members
            </span>
             {project.totalIssues > 0 && (
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                        project.isAtRisk 
                            ? "bg-red-500 text-white shadow-sm shadow-red-200" 
                            : "bg-green-500 text-white shadow-sm shadow-green-200"
                    )}>
                        {project.isAtRisk ? 'At Risk' : 'Healthy'}
                    </span>
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        project.overdueIssues > 0 ? "text-red-500" : "text-muted"
                    )}>
                        {project.overdueIssues} Overdue / {project.totalIssues} total
                    </span>
                </div>
             )}
              {project.deadline && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.deadline).toLocaleDateString()}
                </span>
             )}
          </div>
        </div>
        
        {isOwner && (
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 hover:bg-primary/10 rounded-lg text-muted hover:text-primary transition-all"
                >
                    <Edit2 className="h-4 w-4" />
                </button>
                <button 
                    onClick={handleDelete}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-muted hover:text-red-500 transition-all"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        )}
      </div>

      <p className="text-sm text-neutral-500 line-clamp-2 mb-4 flex-grow leading-relaxed">
        {project.description || 'No specialized description provided for this workspace segment.'}
      </p>

      {/* Progress Logic */}
      {project.totalIssues > 0 && (
          <div className="mb-6 space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted">Workspace Progress</span>
                  <span className="text-primary">{Math.round((project.completedIssues / project.totalIssues) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${(project.completedIssues / project.totalIssues) * 100}%` }}
                  />
              </div>
          </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Link 
            to={`/project/${project._id}`}
            className="text-xs font-bold text-primary flex items-center gap-1 group/link"
        >
            Enter Workspace
            <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </Link>
        <div className="flex -space-x-2">
            {[1, 2, 3].slice(0, project.members?.length || 1).map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(65 + i)}
                </div>
            ))}
            {(project.members?.length || 1) > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center text-[8px] font-bold">
                    +{(project.members?.length || 1) - 3}
                </div>
            )}
        </div>
      </div>
    </GlassPanel>
  );
};

export default ProjectCard;