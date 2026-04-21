import React, { useState } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { Mail, UserPlus, Send, ShieldAlert } from 'lucide-react';
import Button from '../../shared/Button';

const AddMemberForm = ({ projectId, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const { addMember, loading, error } = useProject();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    try {
      await addMember(projectId, email);
      setEmail(''); 
      setSuccess(true);
      if (onMemberAdded) onMemberAdded();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Error is already set in context, just stop here
      console.error('Failed to add member:', err);
    }
  };

  return (
    <section className="space-y-4 animate-faded-in-up">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm font-medium"
          />
        </div>
        
        <Button 
            variant="primary" 
            type="submit" 
            className="w-full gap-2 py-3" 
            isLoading={loading}
        >
            <UserPlus className="h-4 w-4" />
            Provision Access
        </Button>
      </form>

      {success && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[10px] font-black uppercase tracking-widest text-emerald-600">
          Invitation sent successfully.
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
            <ShieldAlert className="h-3 w-3" />
            {error}
        </div>
      )}
    </section>
  );
};

export default AddMemberForm;
