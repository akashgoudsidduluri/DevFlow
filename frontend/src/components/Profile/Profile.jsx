import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import API from '../../utils/api';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';
import { 
  Users, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  FolderKanban, 
  TrendingUp, 
  Github,
  Award,
  CircleDot,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
 
const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
 
  // If no ID in params, we are viewing our own profile
  const targetId = id || currentUser?._id;
  const isOwnProfile = targetId === currentUser?._id;
 
  useEffect(() => {
    fetchProfile();
  }, [id, currentUser]);
 
  const fetchProfile = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const response = await API.get(`/users/${targetId}`);
      setProfile(response.data);
      setIsFollowing(response.data.isFollowing);
      setError(null);
    } catch (err) {
      setError("User profile not found");
    } finally {
      setLoading(false);
    }
  };
 
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
    } catch (err) {
      console.error("Follow error:", err);
      alert(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user: ${err.response?.data?.message || err.message}`);
    } finally {
      setFollowLoading(false);
    }
  };
 
  if (loading && !profile) return (
    <div className="flex h-[70vh] items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
 
  if (error) return (
    <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
       <CircleDot className="h-12 w-12 text-red-400" />
       <h1 className="text-xl font-bold">{error}</h1>
       <Link to="/dashboard" className="text-primary hover:underline font-bold">Back to Dashboard</Link>
    </div>
  );
 
  const followersCount = profile.followersCount ?? profile.followers?.length ?? 0;
  const followingCount = profile.followingCount ?? profile.following?.length ?? 0;
  const projectsCount  = profile.projectsCount  ?? profile.projects?.length  ?? 0;
 
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-faded-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: ID Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative group">
            <div className="w-full aspect-square rounded-[32px] overflow-hidden border-4 border-white shadow-2xl bg-neutral-100 transition-transform duration-500 group-hover:scale-[1.02]">
                {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-black text-primary/30 bg-primary/5">
                        {profile.name?.charAt(0)}
                    </div>
                )}
            </div>
            {isOwnProfile && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-border/50 text-primary animate-pulse">
                    <Award className="h-4 w-4" />
                </div>
            )}
          </div>
 
          <div className="space-y-4 px-2">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">{profile.name}</h1>
              <p className="text-muted font-medium text-sm">@{profile.name?.toLowerCase().replace(/\s/g, '')}</p>
            </div>
 
            <p className="text-sm font-medium leading-relaxed text-muted/80 italic">
               "{profile.bio || "No biography provided yet."}"
            </p>
 
            <div className="pt-4 flex flex-col gap-2">
              {isOwnProfile ? (
                 <Link to="/settings" className="w-full">
                    <Button variant="secondary" className="w-full font-bold bg-neutral-100 border-neutral-200">
                        Edit Profile
                    </Button>
                 </Link>
              ) : (
                 <Button 
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    variant={isFollowing ? "secondary" : "primary"}
                    className={cn(
                        "w-full font-bold shadow-lg transition-all",
                        isFollowing ? "bg-white border-neutral-200" : "shadow-primary/20"
                    )}
                 >
                   {followLoading ? 'Processing...' : (isFollowing ? 'Unfollow' : '+ Follow')}
                 </Button>
              )}
            </div>
 
            <div className="space-y-3 pt-6 border-t border-border/50">
              <div className="flex items-center gap-3 text-xs font-bold text-muted">
                <Calendar className="h-4 w-4 shrink-0" />
                Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
 
              {/* Compact GitHub-style stats — single row, no duplicate cards */}
              <div className="flex items-center gap-1 text-xs text-muted flex-wrap">
                <Users className="h-3.5 w-3.5 shrink-0 mr-0.5" />
                <button
                  onClick={() => { setFollowersOpen(p => !p); setFollowingOpen(false); }}
                  className="hover:text-primary hover:underline underline-offset-2 transition-colors"
                >
                  <span className="font-black text-foreground">{followersCount}</span>
                  {' '}<span className="font-semibold">followers</span>
                </button>
                <span className="mx-1 text-border select-none">·</span>
                <button
                  onClick={() => { setFollowingOpen(p => !p); setFollowersOpen(false); }}
                  className="hover:text-primary hover:underline underline-offset-2 transition-colors"
                >
                  <span className="font-black text-foreground">{followingCount}</span>
                  {' '}<span className="font-semibold">following</span>
                </button>
                <span className="mx-1 text-border select-none">·</span>
                <span>
                  <span className="font-black text-foreground">{projectsCount}</span>
                  {' '}<span className="font-semibold">projects</span>
                </span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Right Column: Activity & Projects */}
        <div className="lg:col-span-3 space-y-6">
 
          {/* Followers list — appears inline when clicked from left col */}
          {followersOpen && (
            <GlassPanel className="p-4 bg-white/30 border-white/40">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted">
                  Followers
                </h3>
                <button onClick={() => setFollowersOpen(false)}>
                  <ChevronUp className="h-4 w-4 text-muted" />
                </button>
              </div>
              <div className="space-y-3">
                {profile.followers && profile.followers.length > 0 ? (
                  profile.followers.map((follower) => (
                    <Link
                      key={follower._id}
                      to={`/profile/${follower._id}`}
                      className="flex items-center gap-3 p-3 rounded-3xl bg-surface/70 hover:bg-white transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {follower.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{follower.name}</p>
                        <p className="text-[11px] text-muted">View profile</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted">No followers yet.</p>
                )}
              </div>
            </GlassPanel>
          )}
 
          {/* Following list — appears inline when clicked from left col */}
          {followingOpen && (
            <GlassPanel className="p-4 bg-white/30 border-white/40">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted">
                  Following
                </h3>
                <button onClick={() => setFollowingOpen(false)}>
                  <ChevronUp className="h-4 w-4 text-muted" />
                </button>
              </div>
              <div className="space-y-3">
                {profile.following && profile.following.length > 0 ? (
                  profile.following.map((followed) => (
                    <Link
                      key={followed._id}
                      to={`/profile/${followed._id}`}
                      className="flex items-center gap-3 p-3 rounded-3xl bg-surface/70 hover:bg-white transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {followed.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{followed.name}</p>
                        <p className="text-[11px] text-muted">View profile</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted">Not following anyone yet.</p>
                )}
              </div>
            </GlassPanel>
          )}
 
           <div className="flex items-center justify-between">
             <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                 <FolderKanban className="h-5 w-5 text-primary" />
                 Project Contributions
             </h2>
           </div>
 
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.projects && profile.projects.length > 0 ? (
                 profile.projects.map((project) => (
                     <Link key={project._id} to={`/project/${project._id}`}>
                         <GlassPanel className="p-5 hover:border-primary/30 transition-all hover:scale-[1.01] group relative bg-white/40">
                             {project.isAtRisk && (
                                 <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                             )}
                             <h3 className="font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
                             <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                                 {project.description || "No description available for this workspace."}
                             </p>
                             <div className="mt-4 flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                     <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                         {project.owner?.name?.charAt(0)}
                                     </div>
                                     <span className="text-[9px] font-bold text-muted uppercase tracking-tight">Owned by {project.owner?.name}</span>
                                 </div>
                                 <span className="text-[9px] font-black text-primary uppercase bg-primary/5 px-2 py-1 rounded-lg">View Board</span>
                             </div>
                         </GlassPanel>
                     </Link>
                 ))
              ) : (
                 <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center gap-4 bg-white/20 border border-dashed border-border rounded-[32px]">
                     <Github className="h-10 w-10 text-muted/20" />
                     <p className="text-sm font-bold text-muted/40">This developer hasn't joined any projects yet.</p>
                 </div>
              )}
           </div>
        </div>
 
      </div>
    </div>
  );
};
 
export default Profile;