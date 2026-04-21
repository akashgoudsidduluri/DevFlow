import React from 'react';
import { Activity, FolderOpenDot, Layers3, TimerReset } from 'lucide-react';
import ProjectCard from './ProjectCard';
import GlassPanel from '../../shared/GlassPanel';

const ProjectList = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <GlassPanel className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-20 text-center">
        <div className="mb-4 rounded-2xl bg-primary/10 p-3 text-primary">
          <Layers3 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground">No Workspaces Yet</h3>
        <p className="mt-2 max-w-md text-sm text-muted">
          Create your first workspace to start managing issues, deadlines, and collaboration.
        </p>
      </GlassPanel>
    );
  }

  const totalOverdue = projects.reduce((sum, project) => sum + (project.overdueIssues || 0), 0);
  const projectsWithIssues = projects.filter((project) => (project.totalIssues || 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <GlassPanel className="rounded-2xl border border-primary/10 p-4">
          <FolderOpenDot className="mb-2 h-5 w-5 text-primary" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Workspaces</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{projects.length}</p>
        </GlassPanel>

        <GlassPanel className="rounded-2xl border border-emerald-500/10 p-4">
          <Activity className="mb-2 h-5 w-5 text-emerald-500" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Active Issues</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{projectsWithIssues}</p>
        </GlassPanel>

        <GlassPanel className="rounded-2xl border border-orange-500/10 p-4">
          <TimerReset className="mb-2 h-5 w-5 text-orange-500" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Overdue Items</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalOverdue}</p>
        </GlassPanel>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
