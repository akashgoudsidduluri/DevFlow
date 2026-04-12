import React, { useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import CreateProjectForm from './CreateProjectForm';
import ProjectList from './ProjectList/ProjectList';
import { Sparkles, Trophy, Plus, LayoutGrid } from 'lucide-react';
import Skeleton from '../shared/Skeleton';

const Dashboard = () => {
  const { projects, loading, error, getProjects } = useProject();

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              Developer Dashboard
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </h1>
            <p className="text-muted text-lg max-w-xl">
              Construct, collaborate, and manage your engineering workspaces with high-fidelity control.
            </p>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
            <div className="p-3 bg-yellow-400/10 rounded-xl">
               <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-muted uppercase">Global Rank</div>
              <div className="text-lg font-bold text-foreground">Elite Architect</div>
            </div>
          </div>
        </header>

        {/* Action Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          
          {/* Form Side */}
          <section className="xl:col-span-5 relative">
            <div className="sticky top-10">
                <CreateProjectForm />
                
                {/* Visual Accent */}
                <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-blue-400/10 border border-primary/5">
                    <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                        <Plus className="h-4 w-4" />
                        Quick Logic Tip
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                        Group projects allow you to invite team members by email immediately. They will see the workspace upon sign-in.
                    </p>
                </div>
            </div>
          </section>

          {/* List Side */}
          <section className="xl:col-span-7 space-y-6">
             {loading && !projects.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                </div>
             ) : (
                <ProjectList projects={projects} />
             )}

             {error && (
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 text-sm font-medium">
                    {error}
                </div>
             )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;