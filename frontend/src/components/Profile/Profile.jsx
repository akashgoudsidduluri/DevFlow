import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Award,
  Calendar,
  CircleDot,
  FolderKanban,
  Github,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [modalTab, setModalTab] = useState('followers');

  const targetId = id || currentUser?._id;
  const isOwnProfile = targetId === currentUser?._id;

  const fetchProfile = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const response = await API.get(`/users/${targetId}`);
      setProfile(response.data);
      setIsFollowing(response.data.isFollowing);
      setError(null);
    } catch {
      setError('User profile not found');
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollowToggle = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await API.post(`/users/unfollow/${targetId}`);
      } else {
        await API.post(`/users/follow/${targetId}`);
      }
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch {
      alert(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <CircleDot className="h-12 w-12 text-red-400" />
        <h1 className="text-xl font-bold">{error}</h1>
        <Link to="/dashboard" className="font-bold text-primary hover:text-primary/80 transition-colors">Back to Dashboard</Link>
      </div>
    );
  }

  const followersCount = profile.followersCount ?? profile.followers?.length ?? 0;
  const followingCount = profile.followingCount ?? profile.following?.length ?? 0;
  const projectsCount = profile.projectsCount ?? profile.projects?.length ?? 0;
  const activeSocialList = modalTab === 'followers' ? profile.followers || [] : profile.following || [];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      {/* ── Profile Header ── */}
      <GlassPanel className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-28 w-28 overflow-hidden rounded-2xl border-2 border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-black text-primary">
                  {profile.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">{profile.name}</h1>
                <p className="text-sm font-medium text-primary/70">@{profile.name?.toLowerCase().replace(/\s/g, '')}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                Member
              </span>
              {isOwnProfile && (
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Award className="h-4 w-4" />
                </div>
              )}
            </div>

            <p className="max-w-2xl text-sm leading-6 text-muted">
              {profile.bio || 'No biography provided yet.'}
            </p>

            <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted sm:justify-start">
              <Calendar className="h-4 w-4" />
              Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>

            <div className="flex justify-center gap-3 pt-2 sm:justify-start">
              {isOwnProfile ? (
                <Link to="/settings" className="block">
                  <Button variant="primary" className="font-bold">
                    Edit Profile
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  variant={isFollowing ? 'secondary' : 'primary'}
                  className="font-bold"
                >
                  {followLoading ? 'Processing...' : isFollowing ? 'Unfollow' : '+ Follow'}
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-col sm:gap-3">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 text-center">
              <p className="text-lg font-bold text-foreground leading-none">{projectsCount}</p>
              <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">Projects</p>
            </div>
            <button
              onClick={() => {
                setModalTab('followers');
                setShowSocialModal(true);
              }}
              className="rounded-xl border border-sky-500/10 bg-sky-500/5 p-3 text-center cursor-pointer hover:border-sky-500/30 transition-all"
            >
              <p className="text-lg font-bold text-foreground leading-none">{followersCount}</p>
              <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">Followers</p>
            </button>
            <button
              onClick={() => {
                setModalTab('following');
                setShowSocialModal(true);
              }}
              className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3 text-center cursor-pointer hover:border-emerald-500/30 transition-all"
            >
              <p className="text-lg font-bold text-foreground leading-none">{followingCount}</p>
              <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">Following</p>
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* ── Projects Section ── */}
      <div className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <FolderKanban className="h-5 w-5 text-primary" />
            Project Contributions
          </h2>
          <p className="mt-1 text-sm text-muted">Active projects and collaborations</p>
        </div>

        {profile.projects && profile.projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {profile.projects.map((project) => (
              <Link key={project._id} to={`/project/${project._id}`}>
                <GlassPanel className="group relative overflow-hidden p-5 transition-all hover:scale-[1.02] hover:border-primary/30">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                        {project.name}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted">
                        {project.description || 'No description available'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
                          {project.owner?.name?.charAt(0)}
                        </div>
                        <span className="text-[11px] font-semibold text-muted truncate">
                          {project.owner?.name}
                        </span>
                      </div>
                      <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary whitespace-nowrap">
                        View Board →
                      </span>
                    </div>
                  </div>
                </GlassPanel>
              </Link>
            ))}
          </div>
        ) : (
          <GlassPanel className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-12 text-center">
            <Github className="mb-3 h-10 w-10 text-muted/30" />
            <p className="text-sm font-bold text-foreground">No projects yet</p>
            <p className="mt-1 text-xs text-muted">This developer hasn't joined any projects</p>
          </GlassPanel>
        )}
      </div>

      {/* ── Social Modal ── */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <GlassPanel className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl p-6 sm:p-7">
            {/* Modal Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {modalTab === 'followers' ? 'Followers' : 'Following'}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {modalTab === 'followers' ? 'People following this profile' : 'People this user follows'}
                </p>
              </div>
              <button
                onClick={() => setShowSocialModal(false)}
                className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-all"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-5 flex gap-2">
              <button
                onClick={() => setModalTab('followers')}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  modalTab === 'followers'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                    : 'bg-primary/6 text-muted hover:bg-primary/10'
                }`}
              >
                Followers ({followersCount})
              </button>
              <button
                onClick={() => setModalTab('following')}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  modalTab === 'following'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                    : 'bg-primary/6 text-muted hover:bg-primary/10'
                }`}
              >
                Following ({followingCount})
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1">
              {activeSocialList.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {activeSocialList.map((person) => (
                    <Link
                      key={person._id}
                      to={`/profile/${person._id}`}
                      onClick={() => setShowSocialModal(false)}
                      className="flex items-center gap-3 rounded-2xl border border-border/40 bg-white/50 p-4 transition-all hover:border-primary/30 hover:bg-white"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                        {person.name?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{person.name}</p>
                        <p className="text-xs text-muted">View profile →</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-10 w-10 text-muted/30" />
                  <p className="text-sm font-bold text-foreground">No {modalTab} yet</p>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-muted">
                    {modalTab === 'followers'
                      ? 'Once people follow this profile, they will appear here.'
                      : 'Profiles followed by this user will appear here.'}
                  </p>
                </div>
              )}
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
};

export default Profile;