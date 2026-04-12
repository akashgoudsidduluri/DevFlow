import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import { Send, Loader2, MessageSquare, ShieldCheck, Clock, AtSign, Users } from 'lucide-react';
import GlassPanel from '../../../shared/GlassPanel';
import { cn } from '../../../../lib/utils';

// ─── Mention Renderer ────────────────────────────────────────────────────────
// Parses message text and highlights @mentions with a styled chip
const renderMessageWithMentions = (text) => {
  const parts = text.split(/(@\w+(?:\s\w+)?)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span
          key={i}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/20 text-white font-bold text-[11px] tracking-tight"
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const renderReceivedMentions = (text) => {
  const parts = text.split(/(@\w+(?:\s\w+)?)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span
          key={i}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[11px] tracking-tight"
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DiscussionTab = ({ projectId, members = [], owner = null }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Mention state
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const pickerRef = useRef(null);

  // Build full members list (members + owner, deduplicated)
  const allMembers = React.useMemo(() => {
    const list = [...members];
    if (owner && !list.some(m => (m._id || m) === (owner._id || owner))) {
      list.push(owner);
    }
    return list;
  }, [members, owner]);

  // Filter members based on mention query
  const filteredMembers = React.useMemo(() => {
    const q = mentionQuery.toLowerCase();
    const all = { _id: 'all', name: 'all', isAll: true };
    if (!q) return [all, ...allMembers];
    if ('all'.startsWith(q)) return [all, ...allMembers.filter(m => m.name?.toLowerCase().includes(q))];
    return allMembers.filter(m => m.name?.toLowerCase().includes(q));
  }, [mentionQuery, allMembers]);

  // ── Fetching ──────────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      const response = await API.get(`/discussions/${projectId}`);
      setMessages(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync discussions');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Mention Detection ─────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setInputText(val);

    // Find the last '@' before cursor that hasn't been closed by a space
    const textUpToCursor = val.slice(0, cursor);
    const atMatch = textUpToCursor.match(/@(\w*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionStartIndex(atMatch.index);
      setShowMentionPicker(true);
      setHighlightedIndex(0);
    } else {
      setShowMentionPicker(false);
      setMentionQuery('');
      setMentionStartIndex(-1);
    }
  };

  const insertMention = (member) => {
    if (mentionStartIndex === -1) return;

    const cursor = textareaRef.current?.selectionStart || inputText.length;
    const before = inputText.slice(0, mentionStartIndex);
    const after = inputText.slice(cursor);
    const mentionText = member.isAll ? '@all ' : `@${member.name.split(' ')[0]} `;

    const newText = before + mentionText + after;
    setInputText(newText);
    setShowMentionPicker(false);
    setMentionQuery('');
    setMentionStartIndex(-1);

    // Restore focus + move cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = before.length + mentionText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // ── Keyboard Navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (showMentionPicker && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, filteredMembers.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[highlightedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentionPicker(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !showMentionPicker) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // ── Sending ───────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const response = await API.post('/discussions', {
        projectId,
        message: inputText.trim()
      });
      setMessages(prev => [...prev, response.data]);
      setInputText('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Protocol delivery failed');
    } finally {
      setSending(false);
    }
  };

  if (loading && !messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] gap-4 bg-neutral-50/30 rounded-3xl p-4 md:p-6 border border-border/50 relative">

      {/* ── Message List ── */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30">
            <MessageSquare className="h-10 w-10" />
            <p className="text-xs font-bold uppercase tracking-widest">No messages yet. Start the discussion!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.userId?._id === user?._id || msg.userId === user?._id;
            return (
              <div
                key={msg._id}
                className={cn(
                  'flex gap-3',
                  isMine ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-black text-primary shrink-0 self-end mb-1 shadow-sm">
                  {msg.userId?.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className={cn('max-w-[78%] space-y-1', isMine ? 'items-end' : 'items-start', 'flex flex-col')}>
                  <div className={cn('flex items-center gap-2 px-1', isMine ? 'flex-row-reverse' : 'flex-row')}>
                    <span className="text-[10px] font-black tracking-tight text-muted-foreground">
                      {msg.userId?.name}
                    </span>
                    <span className="text-[9px] text-muted flex items-center gap-0.5">
                      <Clock className="h-2 w-2" />
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={cn(
                    'px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
                    isMine
                      ? 'bg-primary text-white rounded-br-sm shadow-primary/20'
                      : 'bg-white text-foreground rounded-bl-sm border border-border/50'
                  )}>
                    {isMine
                      ? renderMessageWithMentions(msg.message)
                      : renderReceivedMentions(msg.message)
                    }
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="pt-3 border-t border-border/50 relative">

        {/* Mention Picker Popover */}
        {showMentionPicker && filteredMembers.length > 0 && (
          <div
            ref={pickerRef}
            className="absolute bottom-full mb-2 left-0 w-64 z-50 shadow-2xl"
          >
            <GlassPanel className="p-2 bg-white/98 border-primary/10 overflow-hidden">
              <div className="flex items-center gap-2 px-2 py-1.5 mb-1 border-b border-border/40">
                <AtSign className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                  Mention a teammate
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {filteredMembers.map((member, index) => (
                  <button
                    key={member._id}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur before click
                      insertMention(member);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all',
                      highlightedIndex === index
                        ? 'bg-primary text-white'
                        : 'hover:bg-neutral-50 text-foreground'
                    )}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {member.isAll ? (
                      <>
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-primary flex items-center justify-center shrink-0">
                          <Users className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-black">@everyone</div>
                          <div className={cn('text-[9px]', highlightedIndex === index ? 'text-white/70' : 'text-muted')}>
                            Notify all {allMembers.length} members
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                          {member.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{member.name}</div>
                          <div className={cn('text-[9px]', highlightedIndex === index ? 'text-white/70' : 'text-muted')}>
                            @{member.name?.split(' ')[0]?.toLowerCase()}
                          </div>
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </GlassPanel>
          </div>
        )}

        {/* Textarea */}
        <form onSubmit={handleSend} className="relative">
          <textarea
            ref={textareaRef}
            placeholder="Type a message... use @ to mention"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-white/90 border border-border rounded-2xl py-3 pl-4 pr-20 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none min-h-[52px] max-h-[120px] leading-relaxed"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <span className={cn(
              'text-[10px] font-black transition-colors',
              inputText.length > 250 ? 'text-red-500' : 'text-muted/30'
            )}>
              {inputText.length}/300
            </span>
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all shadow-lg shadow-primary/20"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest text-center">
            {error}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 mt-3 py-1.5 bg-neutral-100/50 rounded-xl border border-dashed border-border/40">
          <ShieldCheck className="h-3 w-3 text-green-500" />
          <span className="text-[8px] font-black text-muted uppercase tracking-widest">
            Secure · type @ to mention · Enter to send
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiscussionTab;
