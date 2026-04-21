import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import { useIssue } from '../../../context/IssueContext';
import MemberList from './MemberList';
import IssueBoard from './IssueBoard/IssueBoard';
import AddMemberForm from './AddMemberForm';
import CreateIssueForm from './CreateIssueForm';
import ProjectStats from './ProjectStats';
import DiscussionTab from './Discussion/DiscussionTab';
import RequestCollaborationModal from './RequestCollaborationModal';
import GlassPanel from '../../shared/GlassPanel';
import Button from '../../shared/Button';
import { ChevronLeft, Github, Info, Users, Layout, Plus, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';

const ProjectDetails = () => {
  const { id } = useParams();
  const { currentProject, loading, error, getProjectById, getProjectInvitations } = useProject();
  const { issues } = useIssue();
  const [activeTab, setActiveTab] = useState('board'); // 'board', 'dashboard', 'discussion'
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProjectById(id);
  }, [id, getProjectById]);

  useEffect(() => {
    if (!id) return;

    let isActive = true;

    getProjectInvitations(id).then((invites) => {
      if (isActive) {
        setPendingInvites(invites);
      }
    });

    return () => {
      isActive = false;
    };
  }, [getProjectInvitations, id]);

  const reloadInvites = () => {
    if (!id) return;
    getProjectInvitations(id).then(setPendingInvites);
  };

  if (loading) return (
    <div className="p-10 space-y-4">
        <div className="h-10 w-64 bg-primary/10 animate-pulse rounded-lg" />
        <div className="h-4 w-96 bg-muted/10 animate-pulse rounded-lg" />
    </div>
  );
  
  if (error && !currentProject) return (
      <div className="p-10">
          <GlassPanel className="p-6 border-red-100 bg-red-50/30">
              <h2 className="text-red-600 font-bold">Error Loading Project</h2>
              <p className="text-red-500">{error}</p>
              <Link to="/dashboard" className="text-sm font-bold mt-4 inline-block text-primary">Return to Dashboard</Link>
          </GlassPanel>
      </div>
  );

  if (!currentProject) return null;

  const tabs = [
    { id: 'board', label: 'Board', icon: Layout },
    { id: 'dashboard', label: 'Dashboard', icon: Info },
    { id: 'discussion', label: 'Discussion', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 max-w-7xl mx-auto w-full space-y-10">
      
      {/* Breadcrumbs & Header */}
      <header className="space-y-6">
        <Link 
            to="/dashboard" 
            className="inline-flex items-center text-sm font-bold text-muted hover:text-primary transition-colors group"
        >
            <ChevronLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-foreground">{currentProject.name}</h1>
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                    {currentProject.projectType === 'group' ? 'Multi-Player' : 'Solo Base'}
                </span>
            </div>
            <p className="text-neutral-500 text-lg max-w-2xl leading-relaxed">
              {currentProject.description}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none bg-surface text-surface-foreground hover:bg-surface/80 border border-border shadow-sm px-4 py-2 text-base gap-2"
              href="https://github.com/akashgoudsidduluri/DevFlow"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-4 w-4" />
              Repository
            </a>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="flex items-center gap-8 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
              activeTab === tab.id ? "text-primary" : "text-muted hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />
            )}
          </button>
        ))}
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left Column: Tab Content */}
        <section className="xl:col-span-8 space-y-8 min-h-[600px]">
            {activeTab === 'dashboard' && <ProjectStats />}
            
            {activeTab === 'board' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Layout className="h-5 w-5 text-primary" />
                            Task & Issue Board
                        </h2>
                        {currentProject?.isMember ? (
                            <CreateIssueForm projectId={id} />
                        ) : (
                            <Button 
                              onClick={() => setShowCollaborationModal(true)}
                              className="gap-2"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Request Collaboration
                            </Button>
                        )}
                    </div>
                    <IssueBoard 
                      projectId={id} 
                      projectMembers={currentProject.members || []}
                      ownerId={currentProject.owner?._id || currentProject.owner}
                      isMember={currentProject.isMember}
                      isOwner={currentProject.isOwner}
                    />
                </div>
            )}

            {activeTab === 'discussion' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 h-full">
                    <DiscussionTab 
                        projectId={id}
                        members={currentProject.members || []}
                        owner={currentProject.owner}
                    />
                </div>
            )}
        </section>

        {/* Right Column: Members & Meta */}
        <section className="xl:col-span-4 space-y-8">
            <GlassPanel className="p-6 bg-white/40 border-white/30 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Collaborators
                    </h3>
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                        {(currentProject.members?.length || 1) + pendingInvites.length}
                    </div>
                </div>
                
                <MemberList 
                    members={currentProject.members} 
                    ownerId={currentProject.owner?._id || currentProject.owner} 
                    pendingInvites={pendingInvites}
                    issues={issues}
                />
                
                {currentProject?.isOwner && (
                    <div className="mt-8 pt-6 border-t border-border/50">
                        <h4 className="text-xs font-bold mb-4 flex items-center gap-2 text-primary">
                            <Plus className="h-3 w-3" />
                            Expand the Core
                        </h4>
                        <AddMemberForm projectId={id} onMemberAdded={reloadInvites} />
                    </div>
                )}
            </GlassPanel>

            {currentProject?.isMember && (
                <GlassPanel className="p-1 justify-center items-center h-12 flex relative">
                   {/* Decorative Gradient Line */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-50" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground z-10">
                       DevFlow Engineering Protocol v3.0
                   </span>
                </GlassPanel>
            )}
        </section>
      </div>

      <RequestCollaborationModal 
        projectId={id}
        projectName={currentProject?.name}
        isOpen={showCollaborationModal}
        onClose={() => setShowCollaborationModal(false)}
      />
    </div>
  );
};

export default ProjectDetails;
