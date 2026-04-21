import React, { useCallback, useEffect, useState } from 'react';
import { X, Loader2, MessageCircle, Send } from 'lucide-react';
import API from '../../utils/api';
import Button from '../shared/Button';
import GlassPanel from '../shared/GlassPanel';
import { cn } from '../../lib/utils';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const CommentItem = ({ comment }) => {
  const user = comment.userId || comment.user;
  const initials = user?.name?.charAt(0) || '?';

  return (
    <div className="flex gap-3 rounded-3xl bg-surface/80 p-4 border border-border">
      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
        ) : initials}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-foreground">{user?.name || 'Unknown'}</p>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted">{formatTimestamp(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{comment.text}</p>
      </div>
    </div>
  );
};

const IssueDetailModal = ({ issueId, onClose, isMember }) => {
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIssueDetail = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await API.get(`/issues/${issueId}`);
      if (!response.data.issue) {
        setError('Issue not found');
        return;
      }
      setIssue(response.data.issue);
      setComments(response.data.comments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load issue details');
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    if (!issueId) return;
    setIssue(null);
    setComments([]);
    setError('');
    setNewComment('');
    fetchIssueDetail();
  }, [issueId, fetchIssueDetail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await API.post('/comments', {
        issueId,
        text: newComment.trim(),
      });

      setComments(prev => [...prev, response.data]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!issueId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <GlassPanel className="w-full max-w-4xl mt-10 p-6 bg-white/95 space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="space-y-4 text-center py-20">
            <p className="text-red-600 font-bold">{error}</p>
            <Button type="button" onClick={fetchIssueDetail}>Retry</Button>
          </div>
        ) : !issue ? (
          <div className="space-y-4 text-center py-20">
            <p className="text-muted font-bold">Issue not found</p>
            <Button type="button" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-foreground">{issue.title}</h2>
                    <p className="text-sm text-muted mt-1">{issue.description || 'No issue description provided.'}</p>
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em]",
                    issue.status === 'done' ? 'bg-green-100 text-green-700' : issue.status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-muted'
                  )}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-3xl bg-surface/80 p-4 border border-border">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-muted font-black">Assigned To</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary grid place-items-center font-black">
                        {issue.assignedTo?.name?.charAt(0) || issue.createdBy?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{issue.assignedTo?.name || 'Unassigned'}</p>
                        <p className="text-[11px] text-muted">Created by {issue.createdBy?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-surface/80 p-4 border border-border">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-muted font-black">Activity</p>
                    <div className="mt-3 space-y-2 text-sm text-muted">
                      <p><span className="font-bold text-foreground">{issue.comments?.length ?? comments.length}</span> comments</p>
                      <p>Opened {new Date(issue.createdAt).toLocaleDateString()}</p>
                      {issue.deadline && <p>Deadline {new Date(issue.deadline).toLocaleDateString()}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-surface/80 p-4 border border-border space-y-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted">Comments</p>
                    <p className="text-sm text-foreground">{comments.length} total</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">{isMember ? 'Add updates and context to this issue.' : 'Read-only comments for public viewers.'}</p>
              </div>
            </div>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="rounded-3xl border border-border bg-surface/70 p-8 text-center text-sm text-muted">
                  No comments yet. {isMember ? 'Be the first to add one.' : 'Waiting for team members to contribute.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <CommentItem key={comment._id} comment={comment} />
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Add comment</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value.slice(0, 300))}
                  rows={4}
                  disabled={!isMember}
                  className="w-full rounded-3xl border border-border bg-white/90 p-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder={isMember ? 'Describe the current status or next step...' : 'Only project members can leave comments.'}
                />
              </div>

              {error && (
                <div className="rounded-3xl bg-red-50 border border-red-100 p-3 text-sm font-bold text-red-600">{error}</div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <p className="text-[11px] text-muted">Max 300 characters.</p>
                <Button type="submit" disabled={!isMember || isSubmitting} isLoading={isSubmitting} className="w-full sm:w-auto">
                  <span className="inline-flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Post Comment
                  </span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </GlassPanel>
    </div>
  );
};

export default IssueDetailModal;
