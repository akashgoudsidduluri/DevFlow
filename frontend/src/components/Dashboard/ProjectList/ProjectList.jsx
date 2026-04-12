import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectList = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-3xl border border-dashed border-border">
        <div className="text-4xl mb-4">📂</div>
        <h3 className="text-xl font-bold text-foreground">No Projects Found</h3>
        <p className="text-muted">Start by launching a new project on the left.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">Active Workspaces</h3>
        <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
          {projects.length} Total
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {projects.map(project => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;