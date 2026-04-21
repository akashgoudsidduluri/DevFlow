import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Edit2,
  Github,
  TimerReset,
  Trash2,
  Users,
} from 'lucide-react';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';
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
  const totalIssues = project.totalIssues || 0;
  const completedIssues = project.completedIssues || 0;
  const overdueIssues = project.overdueIssues || 0;
  const progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
  const memberCount = project.members?.length || 1;
  const projectType = project.projectType === 'group' ? 'Team Workspace' : 'Solo Workspace';

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProject(project._id, name, description);
      setIsEditing(false);
    } catch {
      // Project errors are surfaced through context state.
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        await deleteProject(project._id);
      } catch {
        // Project errors are surfaced through context state.
      }
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
          />
          <div className="flex gap-2">
            <Button size="sm" type="submit" isLoading={loading}>Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              {projectType}
            </span>
            {project.isAtRisk ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600">
                <AlertTriangle className="h-3 w-3" />
                At Risk
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                Healthy
              </span>
            )}
          </div>

          <div className="flex items-start gap-2">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-primary">
                {project.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{project.githubUrl ? 'Connected repository' : 'Standard workspace'}</p>
            </div>
            {project.githubUrl && <Github className="mt-1 h-4 w-4 text-slate-400" />}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4 border-y border-slate-100 py-4">
        <div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Members</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-slate-900">{memberCount}</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Deadline</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <TimerReset className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Overdue</span>
          </div>
          <p className={cn('mt-1 text-lg font-semibold', overdueIssues > 0 ? 'text-red-600' : 'text-slate-900')}>
            {overdueIssues}
          </p>
        </div>
      </div>

      <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-600">
        {project.description || 'No description provided for this workspace.'}
      </p>

      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <span>Progress</span>
          <span className="text-primary">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
        <Link
          to={`/project/${project._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
        >
          Open Workspace
          <ArrowRight className="h-4 w-4" />
        </Link>

        <span className="text-xs font-medium text-slate-400">
          {totalIssues} Issues
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;