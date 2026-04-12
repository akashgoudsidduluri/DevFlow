import React, { useState } from 'react';
import { MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import Button from '../../shared/Button';
import GlassPanel from '../../shared/GlassPanel';
import { cn } from '../../../lib/utils';
import API from '../../../utils/api';

const RequestCollaborationModal = ({ projectId, projectName, onSuccess, isOpen, onClose }) => {
  const [message, setMessage] = useState("I'm interested in collaborating on this project");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await API.post(`/projects/${projectId}/request-collaboration`, { message });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setMessage("I'm interested in collaborating on this project");
      }, 2000);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send collaboration request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassPanel className="w-full max-w-lg p-8 bg-white/95 space-y-6 animate-in fade-in slide-in-from-bottom-4">
        {!isSuccess ? (
          <>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Request Collaboration
              </h2>
              <p className="text-sm text-muted">
                Let <span className="font-bold text-foreground">{projectName}</span> owner know you're interested in joining the team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                  maxLength={300}
                  rows={4}
                  className="w-full p-3 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm font-medium resize-none"
                  placeholder="Tell the owner why you'd like to join..."
                />
                <p className="text-[9px] text-muted text-right">{message.length}/300</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Send Request
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">Request Sent!</h3>
              <p className="text-sm text-muted">
                The project owner will review your collaboration request soon.
              </p>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
};

export default RequestCollaborationModal;
