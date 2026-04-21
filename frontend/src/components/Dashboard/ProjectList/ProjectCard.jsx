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
      <GlassPanel className="rounded-[2rem] p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-2xl border border-border bg-white px-4 py-3 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
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
    <GlassPanel hoverEffect className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] p-6">
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_72%)]" />
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex h-full flex-col">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary shadow-sm">
                {projectType}
              </span>
              {project.isAtRisk ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  At Risk
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Healthy
                </span>
              )}
            </div>

            <div className="flex items-start gap-2">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-muted">{project.githubUrl ? 'Connected repository workspace' : 'Workspace overview and issue tracking'}</p>
              </div>
              {project.githubUrl && <Github className="mt-1 h-4 w-4 text-muted" />}
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-xl p-2 text-muted transition-all hover:bg-primary/10 hover:text-primary"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl p-2 text-muted transition-all hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="relative mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/75 px-4 py-3 shadow-sm ring-1 ring-white/60">
            <div className="flex items-center gap-2 text-muted">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.24em]">Members</span>
            </div>
            <p className="mt-2 text-lg font-black text-foreground">{memberCount}</p>
          </div>

          <div className="rounded-2xl bg-white/75 px-4 py-3 shadow-sm ring-1 ring-white/60">
            <div className="flex items-center gap-2 text-muted">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.24em]">Deadline</span>
            </div>
            <p className="mt-2 text-sm font-bold text-foreground">
              {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
            </p>
          </div>

          <div className="rounded-2xl bg-white/75 px-4 py-3 shadow-sm ring-1 ring-white/60">
            <div className="flex items-center gap-2 text-muted">
              <TimerReset className="h-4 w-4 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.24em]">Overdue</span>
            </div>
            <p className={cn('mt-2 text-lg font-black', overdueIssues > 0 ? 'text-red-600' : 'text-foreground')}>
              {overdueIssues}
            </p>
          </div>
        </div>

        <p className="relative mb-6 flex-grow text-sm leading-7 text-muted">
          {project.description || 'No project summary added yet. Open the workspace to start defining scope, issues, and collaboration details.'}
        </p>

        <div className="relative mb-6 rounded-[1.5rem] bg-slate-50/75 p-4 ring-1 ring-white/70">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted">Delivery progress</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {completedIssues} of {totalIssues} issues completed
              </p>
            </div>
            <p className="text-xl font-black text-primary">{progress}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-border/50 pt-5">
          <Link
            to={`/project/${project._id}`}
            className="inline-flex items-center gap-2 text-sm font-black text-primary transition-colors hover:text-primary/80"
          >
            Open Workspace
            <ArrowRight className="h-4 w-4" />
          </Link>

          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {totalIssues} total issues
          </span>
        </div>
      </div>
    </GlassPanel>
  );
};

export default ProjectCard;
