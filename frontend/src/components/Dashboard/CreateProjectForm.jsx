import React, { useState } from 'react';
import { Calendar, ChevronRight, Globe, Layout, Mail, Plus, Rocket, Users, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
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
  const [emails, setEmails] = useState(['']);

  const { createProject, loading, error } = useProject();

  const handleAddEmailField = () => setEmails([...emails, '']);

  const handleRemoveEmailField = (index) => {
    const nextEmails = emails.filter((_, i) => i !== index);
    setEmails(nextEmails.length > 0 ? nextEmails : ['']);
  };

  const handleEmailChange = (index, value) => {
    const nextEmails = [...emails];
    nextEmails[index] = value;
    setEmails(nextEmails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject({
        name,
        description,
        githubUrl,
        deadline: deadline || null,
        projectType,
        emails: projectType === 'group' ? emails.filter((email) => email.trim() !== '') : [],
      });
      setName('');
      setDescription('');
      setGithubUrl('');
      setDeadline('');
      setProjectType('solo');
      setEmails(['']);
      setShowForm(false);
    } catch {
      // Project errors are surfaced through context state.
    }
  };

  // ── Collapsed: just the launch button ───────────────────────────────────
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

  // ── Expanded: full form in its own panel ─────────────────────────────────
  return (
    <GlassPanel className="relative overflow-hidden p-6 sm:p-8">
      <div className="absolute right-4 top-4">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-full p-2 text-muted transition-colors hover:bg-black/5 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3">
          <Rocket className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Project Configuration</h2>
          <p className="text-sm text-muted">Set up the workspace clearly before work starts moving.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <Layout className="h-4 w-4 text-primary" />
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g., Platform Revamp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <Globe className="h-4 w-4 text-primary" />
              GitHub Repository
            </label>
            <input
              type="url"
              placeholder="https://github.com/..."
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Project Summary</label>
          <textarea
            placeholder="Briefly describe the project objective and scope..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-white/70 px-4 py-3 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-primary/10 bg-primary/5 p-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-primary">
              <Users className="h-4 w-4" />
              Collaboration Mode
            </label>
            <div className="flex flex-wrap gap-4">
              {[
                { id: 'solo', label: 'Solo Project' },
                { id: 'group', label: 'Team Project' },
              ].map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="projectType"
                    checked={projectType === option.id}
                    onChange={() => setProjectType(option.id)}
                    className="h-4 w-4 border-border text-primary focus:ring-primary"
                  />
                  <span className={cn('text-sm', projectType === option.id ? 'font-bold text-foreground' : 'text-muted')}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-primary">
              <Calendar className="h-4 w-4" />
              Project Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-primary/20 bg-white/85 px-3 py-2.5 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        {projectType === 'group' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-primary">
                <Mail className="h-4 w-4" />
                Invite Team Members
              </label>
              <button
                type="button"
                onClick={handleAddEmailField}
                className="flex items-center gap-1 text-xs font-bold text-primary"
              >
                <Plus className="h-3 w-3" />
                Add Member
              </button>
            </div>

            <div className="space-y-3">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="email"
                      placeholder="teammate@example.com"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="w-full rounded-xl border border-border bg-white/70 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmailField(index)}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="primary" type="submit" isLoading={loading} className="w-full py-4 text-lg">
          Start Project
          {!loading && <ChevronRight className="ml-2 h-5 w-5" />}
        </Button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-500">
          {error}
        </div>
      )}
    </GlassPanel>
  );
};

export default CreateProjectForm;
