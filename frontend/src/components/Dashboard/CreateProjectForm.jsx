import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Plus, X, Users, Mail, Globe, Calendar, Layout, ChevronRight, Rocket } from 'lucide-react';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';
import { cn } from '../../lib/utils';

const CreateProjectForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [projectType, setProjectType] = useState('solo');
  const [showForm, setShowForm] = useState(false);
  const [emails, setEmails] = useState(['']); // Start with one empty email field

  const { createProject, loading, error } = useProject();

  const handleAddEmailField = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmailField = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails.length > 0 ? newEmails : ['']);
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        name,
        description,
        githubUrl,
        deadline: deadline || null,
        projectType,
        emails: projectType === 'group' ? emails.filter(email => email.trim() !== '') : []
      };
      
      await createProject(projectData);
      
      // Reset form
      setName('');
      setDescription('');
      setGithubUrl('');
      setDeadline('');
      setProjectType('solo');
      setEmails(['']);
      setShowForm(false);
    } catch (err) { }
  };

  if (!showForm) {
    return (
      <Button 
        variant="primary" 
        size="lg"
        className="w-full group" 
        onClick={() => setShowForm(true)}
      >
        <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
        Launch New Project
      </Button>
    );
  }

  return (
    <GlassPanel className="p-8 mb-8 relative overflow-hidden bg-white/40">
      <div className="absolute top-0 right-0 p-4">
        <button 
          onClick={() => setShowForm(false)}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Rocket className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Project Configuration</h2>
          <p className="text-sm text-muted">Initialize your next masterpiece with DevFlow.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Layout className="h-4 w-4 text-primary" />
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g., Quantum Engine"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              GitHub Repository
            </label>
            <input
              type="url"
              placeholder="https://github.com/..."
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            Mission Statement
          </label>
          <textarea
            placeholder="Describe the problem you're solving..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2 text-primary">
              <Users className="h-4 w-4" />
              Collaboration Mode
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="projectType"
                  checked={projectType === 'solo'}
                  onChange={() => setProjectType('solo')}
                  className="w-4 h-4 text-primary focus:ring-primary border-border"
                />
                <span className={cn("text-sm transition-colors", projectType === 'solo' ? "font-bold text-foreground" : "text-muted group-hover:text-foreground")}>Solo Pursuit</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="projectType"
                  checked={projectType === 'group'}
                  onChange={() => setProjectType('group')}
                  className="w-4 h-4 text-primary focus:ring-primary border-border"
                />
                <span className={cn("text-sm transition-colors", projectType === 'group' ? "font-bold text-foreground" : "text-muted group-hover:text-foreground")}>Team Project</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2 text-primary">
              <Calendar className="h-4 w-4" />
              Project Deadline
            </label>
            <input 
              type="date" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-white/80 border border-primary/20 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {projectType === 'group' && (
          <div className="space-y-4 animate-faded-in-up">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold flex items-center gap-2 text-primary">
                <Mail className="h-4 w-4" />
                Invite Team Members
              </label>
              <button 
                type="button"
                onClick={handleAddEmailField}
                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Member
              </button>
            </div>
            
            <div className="space-y-3">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2 animate-faded-in-up">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                      type="email"
                      placeholder="teammate@example.com"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    />
                  </div>
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmailField(index)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button 
            variant="primary" 
            type="submit" 
            isLoading={loading} 
            className="w-full py-4 text-lg"
          >
            Start Project
            {!loading && <ChevronRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm text-center font-medium animate-pulse">
          {error}
        </div>
      )}
    </GlassPanel>
  );
};

export default CreateProjectForm;