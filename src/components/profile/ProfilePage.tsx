import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  Headphones, 
  Clock, 
  Heart, 
  LogOut, 
  Check, 
  Edit3, 
  Save, 
  X,
  Compass,
  Bookmark,
  Download,
  FolderArchive
} from 'lucide-react';
import { formatDate, formatDuration } from '../../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { 
    currentUser, 
    progressList, 
    relations, 
    updateUserProfile, 
    logout, 
    setActiveTab, 
    setAuthModalOpen, 
    setAuthModalMode,
    switchUserRole,
    setExportModalOpen
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [profileImg, setProfileImg] = useState(currentUser?.profile_image || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-slate-100">
        <UserIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Profile Found</h2>
        <p className="text-xs text-slate-400 mb-6">Sign in or create an account to view your listener profile.</p>
        <button
          onClick={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-xl text-white text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Listening stats
  const userProgress = progressList.filter((p) => p.user_id === currentUser.id);
  const completedEpisodes = userProgress.filter((p) => p.completed).length;
  const totalSecondsListened = userProgress.reduce((sum, p) => sum + p.current_position, 0);
  const userFavoritesCount = relations.filter((r) => r.user_id === currentUser.id && r.is_favorite).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      profile_image: profileImg.trim() || currentUser.profile_image,
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen pb-28 md:pb-20 text-slate-100 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Account & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal details, streaming stats, and permissions.
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Avatar with fallback */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-xl shrink-0">
            <img
              src={currentUser.profile_image}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-purple-800 to-orange-600 flex items-center justify-center font-bold text-white text-2xl">
              {currentUser.name.charAt(0)}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                {currentUser.name}
              </h2>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                currentUser.role === 'admin'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                  : 'bg-orange-950 text-orange-300 border border-orange-800'
              }`}>
                {currentUser.role === 'admin' ? 'Administrator' : 'Listener'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{currentUser.email}</span>
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined {formatDate(currentUser.created_at)}</span>
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-emerald-400 font-medium capitalize">
                Account {currentUser.status}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => {
                  setName(currentUser.name);
                  setEmail(currentUser.email);
                  setProfileImg(currentUser.profile_image);
                  setIsEditing(!isEditing);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className="px-4 py-2 bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-purple-600/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              <button
                onClick={logout}
                className="px-4 py-2 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/60 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-800 space-y-4 max-w-lg">
            <h3 className="text-sm font-bold text-white">Update Profile Info</h3>
            
            <div>
              <label className="text-xs text-slate-400 block mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Profile Image URL</label>
              <input
                type="url"
                value={profileImg}
                onChange={(e) => setProfileImg(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Streaming Stats Grid */}
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
        Your Listening Stats
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-white font-mono tabular-nums">
              {formatDuration(totalSecondsListened)}
            </p>
            <p className="text-xs text-slate-400">Total Stream Time</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-white font-mono tabular-nums">
              {userProgress.length}
            </p>
            <p className="text-xs text-slate-400">Episodes Started</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-white font-mono tabular-nums">
              {userFavoritesCount}
            </p>
            <p className="text-xs text-slate-400">Favorited Stories</p>
          </div>
        </div>
      </div>

      {/* Demo Account Switcher Banner */}
      <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Switch Role for Testing</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly toggle between Administrator capabilities and Listener streaming mode.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => switchUserRole('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentUser.role === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Admin Account
            </button>
            <button
              onClick={() => switchUserRole('listener')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentUser.role === 'listener'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Listener Account
            </button>
          </div>
        </div>
      </div>

      {/* Export Source Code Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-orange-950/30 via-slate-900 to-slate-900 border border-orange-500/30 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">Export App Source Code</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">
                  .ZIP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Download the complete codebase including all React components, contexts, audio assets, full documentation, and dependencies to run locally on your computer with <code className="text-orange-300 font-mono">npm run dev</code>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Setup Guide
            </button>
            <a
              href="/dk-fm-audio-app-source.zip"
              download="dk-fm-audio-app-source.zip"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};
