import React, { useState } from 'react';
import { useIssue } from '../../../context/IssueContext';
import { useProject } from '../../../context/ProjectContext';
import { Plus, X, ListTodo, AlignLeft, BarChart3, UserPlus, Calendar, Rocket, Sparkles } from 'lucide-react';
import GlassPanel from '../../shared/GlassPanel';
import Button from '../../shared/Button';
import { cn } from '../../../lib/utils';

const CreateIssueForm = ({ projectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const { createIssue, issues, loading, error } = useIssue();
  const { currentProject } = useProject();

  const getWorkloads = () => {
    if (!currentProject || !currentProject.members) return [];
    const loads = {};
    currentProject.members.forEach(member => loads[member._id] = 0);
    issues.forEach(iss => {
      if (iss.assignedTo && (iss.status === 'todo' || iss.status === 'in_progress')) {
        const id = iss.assignedTo._id || iss.assignedTo;
        if (loads[id] !== undefined) loads[id]++;
      }
    });
    return Object.keys(loads).map(id => ({
      member: currentProject.members.find(m => m._id === id),
      count: loads[id]
    }));
  };

  const workloads = getWorkloads();
  let suggestedMemberId = null;
  if (workloads.length > 0) {
    const minLoad = Math.min(...workloads.map(w => w.count));
    const suggested = workloads.find(w => w.count === minLoad);
    if (suggested) suggestedMemberId = suggested.member._id;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIssue(
        projectId, 
        title, 
        description, 
        priority, 
        assignedTo || undefined, 
        deadline || null
      );
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignedTo('');
      setDeadline('');
      setShowForm(false);
    } catch (err) { }
  };

  if (!showForm) {
    return (
      <Button 
        variant="primary" 
        size="sm"
        className="gap-2"
        onClick={() => setShowForm(true)}
      >
        <Plus className="h-4 w-4" />
        New Task
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <GlassPanel className="w-full max-w-lg p-8 bg-white/90 shadow-2xl relative animate-in zoom-in-95 self-center">
        <button 
          onClick={() => setShowForm(false)}
          className="absolute top-6 right-6 p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-muted" />
        </button>

        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl">
                <ListTodo className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h2 className="text-xl font-bold tracking-tight">Technical Issue Entry</h2>
                <p className="text-xs text-muted font-medium uppercase tracking-widest">Protocol Assignment Stage</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                <Rocket className="h-3 w-3 text-primary" />
                Issue Identity
            </label>
            <input
              type="text"
              placeholder="What task segment needs execution?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                <AlignLeft className="h-3 w-3 text-primary" />
                System Description
            </label>
            <textarea
              placeholder="Briefly describe the technical requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                <BarChart3 className="h-3 w-3 text-primary" />
                Threat Level
              </label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="low">Minor (Low)</option>
                <option value="medium">Standard (Med)</option>
                <option value="high">Critical (High)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                <UserPlus className="h-3 w-3 text-primary" />
                Assign Specialist
              </label>
              <select 
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Unassigned</option>
                {workloads.map(wl => (
                  <option key={wl.member._id} value={wl.member._id} className="text-sm">
                    {wl.member.name} {wl.member._id === suggestedMemberId ? '✦' : ''}
                  </option>
                ))}
              </select>
              {suggestedMemberId && !assignedTo && (
                  <p className="text-[9px] font-bold text-primary flex items-center gap-1 mt-1">
                      <Sparkles className="h-2 w-2" />
                      Workload Suggestion Active
                  </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                <Calendar className="h-3 w-3 text-primary" />
                System Deadline
              </label>
              <input 
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
                variant="secondary" 
                type="button" 
                className="flex-1"
                onClick={() => setShowForm(false)}
            >
                Cancel
            </Button>
            <Button 
                variant="primary" 
                type="submit" 
                className="flex-[2]"
                isLoading={loading}
            >
                Create Issue Entry
            </Button>
          </div>
        </form>

        {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">
                {error}
            </div>
        )}
      </GlassPanel>
    </div>
  );
};

export default CreateIssueForm;