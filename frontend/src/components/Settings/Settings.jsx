import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';
import { 
  User, Shield, Wand2, Info, Lock, Eye, EyeOff, 
  Bell, Moon, LogOut, Trash2, Check, AlertTriangle,
  Activity, Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import API from '../../utils/api';

const Settings = () => {
  const { user, updateProfile, logout } = useAuth();
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

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    activityUpdates: true,
    collaborationRequests: true,
    issueAssignments: true,
    publicProfile: true,
    darkMode: false,
  });
  const [isPrefLoading, setIsPrefLoading] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Current session', lastActive: 'now', ip: '192.168.x.x' },
    { id: 2, device: 'Safari on iPhone', location: 'Last accessed 2 days ago', lastActive: '2 days ago', ip: '10.0.x.x' },
  ]);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

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

  const handlePreferenceToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = async () => {
    setIsPrefLoading(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfileMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch {
      setProfileMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setIsPrefLoading(false);
    }
  };

  const handleLogoutSession = (sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setProfileMessage({ type: 'error', text: 'Please type DELETE to confirm' });
      return;
    }
    try {
      await API.delete('/users/account');
      logout();
    } catch {
      setProfileMessage({ type: 'error', text: 'Failed to delete account' });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Settings</h1>
        <p className="text-muted text-sm font-medium">Manage your profile, security, preferences, and account.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { id: 'publicProfile', label: 'Profile', icon: User },
          { id: 'accountSecurity', label: 'Security', icon: Shield },
          { id: 'preferences', label: 'Preferences', icon: Bell },
          { id: 'sessions', label: 'Sessions', icon: Activity },
          { id: 'dangerZone', label: 'Account', icon: AlertTriangle },
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all border',
              activeTab === tab.id
                ? 'bg-primary/15 text-primary border-primary/30 shadow-sm'
                : 'text-muted hover:bg-primary/8 border-border/40 hover:border-primary/20'
            )}
          >
            <IconComponent className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="space-y-6">

        {/* Public Profile */}
        {activeTab === 'publicProfile' && (
          <GlassPanel className="p-6 md:p-8 space-y-8">
            <div className="space-y-2 pb-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Public Profile
              </h2>
              <p className="text-xs text-muted">Customize how others see your profile.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-border/50">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 shadow-md">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-primary">
                        {name?.charAt(0) || user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2">Avatar Identity</h3>
                    <p className="text-xs text-muted mb-3">Generate a unique developer avatar or upload your own.</p>
                    <Button
                      type="button"
                      onClick={handleGenerateAvatar}
                      variant="secondary"
                      className="gap-2"
                    >
                      <Wand2 className="h-4 w-4" />
                      Generate Magic Avatar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-2">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-sm font-medium"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-2">Developer Bio</label>
                  <div className="relative group">
                    <Info className="absolute left-3 top-3 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 160))}
                      rows={3}
                      maxLength={160}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-sm font-medium resize-none"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-[10px] text-muted text-right mt-1">{bio.length}/160 characters</p>
                  </div>
                </div>
              </div>

              {profileMessage.text && (
                <div className={cn(
                  'p-3 rounded-lg text-xs font-semibold flex items-center gap-2',
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                )}>
                  {profileMessage.type === 'success' && <Check className="h-4 w-4" />}
                  {profileMessage.text}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isProfileLoading} className="px-6">
                  Save Changes
                </Button>
              </div>
            </form>
          </GlassPanel>
        )}

        {/* Account Security */}
        {activeTab === 'accountSecurity' && (
          <GlassPanel className="p-6 md:p-8 space-y-8">
            <div className="space-y-2 pb-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Account Security
              </h2>
              <p className="text-xs text-muted">Keep your account secure with a strong password.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-2">Current Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type={showPasswords.current ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-sm font-medium"
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

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-2">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type={showPasswords.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-sm font-medium"
                    placeholder="Enter a new password (min. 6 characters)"
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

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-2">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-sm font-medium"
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
                  'p-3 rounded-lg text-xs font-semibold flex items-center gap-2',
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                )}>
                  {passwordMessage.type === 'success' && <Check className="h-4 w-4" />}
                  {passwordMessage.text}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordMessage({ type: '', text: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isPasswordLoading}>
                  Change Password
                </Button>
              </div>
            </form>
          </GlassPanel>
        )}

        {/* Preferences */}
        {activeTab === 'preferences' && (
          <GlassPanel className="p-6 md:p-8 space-y-8">
            <div className="space-y-2 pb-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Preferences & Notifications
              </h2>
              <p className="text-xs text-muted">Control how you receive updates and notifications.</p>
            </div>

            <div className="space-y-4">
              {/* Notification Preferences */}
              <div className="space-y-3 pb-6 border-b border-border/50">
                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'activityUpdates', label: 'Activity Updates', desc: 'Get notified about project activity' },
                  { key: 'collaborationRequests', label: 'Collaboration Requests', desc: 'When someone requests to collaborate' },
                  { key: 'issueAssignments', label: 'Issue Assignments', desc: 'When you are assigned to an issue' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted">{desc}</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceToggle(key)}
                      className={cn(
                        'relative w-12 h-6 rounded-full transition-all',
                        preferences[key] ? 'bg-primary' : 'bg-border'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5',
                        preferences[key] ? 'translate-x-6' : 'translate-x-0.5'
                      )} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Privacy Settings */}
              <div className="space-y-3 pb-6 border-b border-border/50">
                <h3 className="text-sm font-bold text-foreground">Privacy</h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Public Profile</p>
                    <p className="text-xs text-muted">Allow others to find and view your profile</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceToggle('publicProfile')}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-all',
                      preferences.publicProfile ? 'bg-primary' : 'bg-border'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5',
                      preferences.publicProfile ? 'translate-x-6' : 'translate-x-0.5'
                    )} />
                  </button>
                </div>
              </div>

              {/* Display */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Display</h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">Dark Mode <Moon className="h-4 w-4" /></p>
                    <p className="text-xs text-muted">Coming soon - dark theme support</p>
                  </div>
                  <button
                    disabled
                    className="relative w-12 h-6 rounded-full bg-gray-200 opacity-50 cursor-not-allowed"
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={savePreferences} isLoading={isPrefLoading}>
                Save Preferences
              </Button>
            </div>
          </GlassPanel>
        )}

        {/* Sessions & Activity */}
        {activeTab === 'sessions' && (
          <GlassPanel className="p-6 md:p-8 space-y-6">
            <div className="space-y-2 pb-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Active Sessions
              </h2>
              <p className="text-xs text-muted">Manage all your active sessions and connected devices.</p>
            </div>

            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-white/40 border border-border/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">{session.device}</p>
                      {session.id === 1 && <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">Current</span>}
                    </div>
                    <p className="text-xs text-muted">{session.location} · IP: {session.ip}</p>
                    <p className="text-[10px] text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Last active: {session.lastActive}
                    </p>
                  </div>
                  {session.id !== 1 && (
                    <Button
                      onClick={() => handleLogoutSession(session.id)}
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </GlassPanel>
        )}

        {/* Delete Account */}
        {activeTab === 'dangerZone' && (
          <GlassPanel className="p-6 md:p-8 space-y-6 border-red-200/50 bg-red-50/50">
            <div className="space-y-2 pb-6 border-b border-red-200/50">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h2>
              <p className="text-xs text-red-700/70">Irreversible and destructive actions.</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-200">
                <h3 className="text-sm font-bold text-red-600 mb-2">Delete Account</h3>
                <p className="text-xs text-red-700/70 mb-4">This action cannot be undone. All your data, projects, and collaborations will be permanently deleted.</p>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account Permanently
                </Button>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <GlassPanel className="w-full max-w-md p-6 rounded-2xl space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Delete Account?
                    </h3>
                    <p className="text-sm text-muted">Type <span className="font-bold text-red-600">DELETE</span> to confirm deletion of your account and all associated data.</p>
                  </div>

                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none text-sm font-medium"
                  />

                  <div className="flex gap-3 justify-end">
                    <Button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteConfirm('');
                      }}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="danger"
                      disabled={deleteConfirm !== 'DELETE'}
                    >
                      Delete Account
                    </Button>
                  </div>
                </GlassPanel>
              </div>
            )}
          </GlassPanel>
        )}
      </div>
    </div>
  );
};

export default Settings;
