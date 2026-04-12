import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';
import { User, Shield, Wand2, Mail, Info, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import API from '../../utils/api';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('publicProfile');
  
  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (profileMessage.text) {
      const timer = setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [profileMessage.text]);

  useEffect(() => {
    if (passwordMessage.text) {
      const timer = setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [passwordMessage.text]);

  const handleGenerateAvatar = () => {
    const seed = name || user?.name || Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setAvatarUrl(newAvatar);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      await updateProfile({ name, bio, avatarUrl });
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'All fields are required' });
      setIsPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      setIsPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setIsPasswordLoading(false);
      return;
    }

    try {
      await API.post('/users/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setIsPasswordLoading(false);
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
           <button 
             onClick={() => setActiveTab('publicProfile')}
             className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border",
               activeTab === 'publicProfile' 
                 ? "bg-primary/10 text-primary border-primary/20" 
                 : "text-muted hover:bg-neutral-100 border-transparent"
             )}
           >
              <User className="h-4 w-4" />
              Public Profile
           </button>
           <button 
             onClick={() => setActiveTab('accountSecurity')}
             className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border",
               activeTab === 'accountSecurity' 
                 ? "bg-primary/10 text-primary border-primary/20" 
                 : "text-muted hover:bg-neutral-100 border-transparent"
             )}
           >
              <Shield className="h-4 w-4" />
              Account Security
           </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Public Profile Tab */}
          {activeTab === 'publicProfile' && (
            <GlassPanel className="p-6 md:p-8 space-y-8 bg-white/40">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
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

                {profileMessage.text && (
                  <div className={cn(
                      "p-3 rounded-lg text-xs font-bold animate-pulse",
                      profileMessage.type === 'success' ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                  )}>
                      {profileMessage.text}
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button type="submit" isLoading={isProfileLoading} className="px-8 py-3 rounded-xl shadow-lg shadow-primary/20">
                    Save All Changes
                  </Button>
                </div>
              </form>
            </GlassPanel>
          )}

          {/* Account Security Tab */}
          {activeTab === 'accountSecurity' && (
            <GlassPanel className="p-6 md:p-8 space-y-6 bg-white/40">
              <div className="space-y-2 pb-6 border-b border-border/50">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Change Password
                </h3>
                <p className="text-xs text-muted">Update your password to secure your account.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Current Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                      type={showPasswords.current ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm font-medium"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm font-medium"
                      placeholder="Enter your new password (min. 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                      type={showPasswords.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm font-medium"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {passwordMessage.text && (
                  <div className={cn(
                      "p-3 rounded-lg text-xs font-bold animate-pulse",
                      passwordMessage.type === 'success' ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                  )}>
                      {passwordMessage.text}
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordMessage({ type: '', text: '' });
                    }}
                    className="px-8 py-3 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isPasswordLoading} className="px-8 py-3 rounded-xl shadow-lg shadow-primary/20">
                    Change Password
                  </Button>
                </div>
              </form>
            </GlassPanel>
          )}

          {/* Danger Zone */}
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
