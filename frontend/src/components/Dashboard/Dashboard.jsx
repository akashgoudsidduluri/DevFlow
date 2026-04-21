import React, { useEffect } from 'react';
import { FolderKanban, Sparkles, Users2, TrendingUp } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import CreateProjectForm from './CreateProjectForm';
import ProjectList from './ProjectList/ProjectList';
import Skeleton from '../shared/Skeleton';
import GlassPanel from '../shared/GlassPanel';

const Dashboard = () => {
  const { projects, loading, error, getProjects } = useProject();

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  const activeProjects = projects.filter(p => p.status !== 'archived').length;
  const teamProjects   = projects.filter(p => p.members?.length > 1).length;

  return (
    <div className="min-h-screen flex-1 bg-transparent">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Hero Section ──*/}
        <section className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
              <Sparkles className="h-3 w-3" />
              Dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your Project Workspace
            </h1>
            <p className="mt-3 text-base text-muted max-w-3xl">
              Organize, track, and collaborate on projects seamlessly. Create workspaces, manage issues, and stay aligned with your team.
            </p>
          </div>
        </section>

        {/* ── Quick Stats ── */}
        <section>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GlassPanel className="p-4 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Active Projects</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{activeProjects}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <FolderKanban className="h-5 w-5" />
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-4 rounded-2xl border border-sky-500/10 hover:border-sky-500/20 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Collaboration</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{teamProjects}</p>
                </div>
                <div className="rounded-xl bg-sky-500/10 p-2 text-sky-500">
                  <Users2 className="h-5 w-5" />
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-4 rounded-2xl border border-orange-500/10 hover:border-orange-500/20 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Status</p>
                  <p className="mt-2 text-lg font-bold text-foreground">Active</p>
                </div>
                <div className="rounded-xl bg-orange-500/10 p-2">
                  <div className="h-5 w-5 rounded-full bg-orange-500" />
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-4 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Performance</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">100%</p>
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </GlassPanel>
          </div>
        </section>

        {/* ── Workspaces Section ── */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Workspaces</h2>
              <p className="mt-1 text-sm text-muted">Create and manage your active projects</p>
            </div>
            <CreateProjectForm />
          </div>

          {loading && !projects.length ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl" />
            </div>
          ) : (
            <ProjectList projects={projects} />
          )}

          {error && (
            <GlassPanel className="border border-red-200/50 bg-red-50/50 p-4 rounded-2xl">
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </GlassPanel>
          )}
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
