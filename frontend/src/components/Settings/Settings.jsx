import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';
import { User, Shield, Wand2, Mail, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAvatar = () => {
    const seed = name || user?.name || Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setAvatarUrl(newAvatar);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile({ name, bio, avatarUrl });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-faded-in-up">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Settings</h1>
        <p className="text-muted text-sm font-medium">Manage your identity and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar (Local) */}
        <div className="lg:col-span-1 space-y-2">
           <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm transition-all border border-primary/20">
              <User className="h-4 w-4" />
              Public Profile
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:bg-neutral-100 rounded-xl font-bold text-sm transition-all">
              <Shield className="h-4 w-4" />
              Account Security
           </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel className="p-6 md:p-8 space-y-8 bg-white/40">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-border/50">
                 <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-neutral-100">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-primary/30 bg-primary/5">
                                {name?.charAt(0) || user?.name?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={handleGenerateAvatar}
                        className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform active:scale-95 group-hover:rotate-12"
                        title="Generate Magic Avatar"
                    >
                        <Wand2 className="h-4 w-4" />
                    </button>
                 </div>
                 <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-lg font-bold text-foreground">Avatar Identity</h3>
                    <p className="text-xs text-muted max-w-[200px]">Use the wand to generate a unique developer avatar based on your name.</p>
                 </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm font-medium"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Developer Bio</label>
                  <div className="relative group">
                    <Info className="absolute left-3 top-3 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm font-medium resize-none"
                      placeholder="System architect focusing on cloud-native workflows..."
                    />
                  </div>
                  <p className="text-[9px] text-muted text-right">{bio.length}/160</p>
                </div>
              </div>

              {message.text && (
                <div className={cn(
                    "p-3 rounded-lg text-xs font-bold animate-pulse",
                    message.type === 'success' ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                )}>
                    {message.text}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={isLoading} className="px-8 py-3 rounded-xl shadow-lg shadow-primary/20">
                  Save All Changes
                </Button>
              </div>
            </form>
          </GlassPanel>

          <GlassPanel className="p-6 bg-red-500/5 border-red-500/10 opacity-50 cursor-not-allowed">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-red-600">Danger Zone</h3>
                    <p className="text-[10px] text-muted">Delete account and purge all workspace data.</p>
                </div>
                <Button variant="secondary" size="sm" className="bg-white border-red-100 text-red-400">
                    Delete Account
                </Button>
             </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

export default Settings;
