import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAudio } from '../../context/AudioContext';
import { StoryCard } from '../common/StoryCard';
import { 
  Bookmark, 
  Heart, 
  Clock, 
  RotateCcw, 
  Download, 
  Trash2, 
  Play, 
  Headphones, 
  AlertCircle,
  HardDrive,
  CheckCircle2,
  WifiOff
} from 'lucide-react';
import { formatDuration, formatDate } from '../../utils/formatters';
import { useDownload } from '../../context/DownloadContext';
import { formatBytes } from '../../utils/indexedDB';

type LibraryTab = 'continue' | 'favorites' | 'following' | 'history' | 'downloads';

export const LibraryPage: React.FC = () => {
  const { 
    currentUser, 
    stories, 
    episodes, 
    progressList, 
    relations, 
    setAuthModalOpen, 
    setAuthModalMode,
    removeStoryFromLibrary,
    navigateToStory,
    setActiveTab: setAppNavTab
  } = useApp();

  const { playEpisode } = useAudio();
  const { downloads, removeDownload, clearDownloads, totalStorageBytes } = useDownload();

  const [activeTab, setActiveTab] = useState<LibraryTab>('continue');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign in to view your Library</h2>
        <p className="text-xs text-slate-400 mb-6">
          Keep track of your listening history, save favorite stories, and resume episodes across all devices.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            }}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-xl text-white text-xs font-bold transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthModalMode('register');
              setAuthModalOpen(true);
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white text-xs font-semibold transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // Continue listening list
  const continueListeningItems = progressList
    .filter((p) => p.user_id === currentUser.id && !p.completed)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  // History list (all played)
  const historyItems = progressList
    .filter((p) => p.user_id === currentUser.id)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  // Favorite stories
  const favoriteStoryIds = relations
    .filter((r) => r.user_id === currentUser.id && r.is_favorite)
    .map((r) => r.story_id);
  const favoriteStories = stories.filter((s) => favoriteStoryIds.includes(s.id));

  // Followed stories
  const followedStoryIds = relations
    .filter((r) => r.user_id === currentUser.id && r.is_followed)
    .map((r) => r.story_id);
  const followedStories = stories.filter((s) => followedStoryIds.includes(s.id));

  return (
    <div className="min-h-screen pb-28 md:pb-20 text-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          My Audio Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Saved audiobooks, bookmarked series, and your listening progress.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('continue')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'continue'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Continue Listening ({continueListeningItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'favorites'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Favorites ({favoriteStories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('following')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'following'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Followed ({followedStories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'history'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History ({historyItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'downloads'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Downloads ({downloads.length})</span>
        </button>
      </div>

      {/* Tab Contents */}

      {/* 1. Continue Listening Tab */}
      {activeTab === 'continue' && (
        <div>
          {continueListeningItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 p-6">
              <Headphones className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">No audio in progress</h3>
              <p className="text-xs text-slate-400 mb-4">Start playing any episode and your exact time will be saved automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {continueListeningItems.map((item) => {
                const story = stories.find((s) => s.id === item.story_id);
                const episode = episodes.find((e) => e.id === item.episode_id);
                if (!story || !episode) return null;

                const percent = Math.min(100, Math.round((item.current_position / (item.duration || episode.duration)) * 100));

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 group transition-all"
                  >
                    <div 
                      onClick={() => playEpisode(story, episode, item.current_position)}
                      className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                        <img
                          src={story.cover_image_url}
                          alt={story.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 text-orange-400 fill-current" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                          {story.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          Ep {episode.episode_number}: {episode.title}
                        </p>

                        <div className="mt-2.5">
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
                            <span>{percent}% completed</span>
                            <span>{formatDuration(item.current_position)} / {formatDuration(episode.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => playEpisode(story, episode, item.current_position)}
                        className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-600/20"
                        title="Resume episode"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                      <button
                        onClick={() => removeStoryFromLibrary(story.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Remove from Library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Favorites Tab */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteStories.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 p-6">
              <Heart className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">No favorites saved yet</h3>
              <p className="text-xs text-slate-400">Click the heart icon on any story to add it to your favorites.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {favoriteStories.map((story) => (
                <div key={story.id} className="relative group">
                  <StoryCard story={story} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStoryFromLibrary(story.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-950 text-slate-300 hover:text-rose-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Followed Stories */}
      {activeTab === 'following' && (
        <div>
          {followedStories.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 p-6">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">No followed series</h3>
              <p className="text-xs text-slate-400">Follow audio dramas to get notifications when new episodes release.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {followedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 p-6">
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">No listening history</h3>
              <p className="text-xs text-slate-400">Episodes you listen to will appear here with timestamps.</p>
            </div>
          ) : (
            historyItems.map((item) => {
              const story = stories.find((s) => s.id === item.story_id);
              const episode = episodes.find((e) => e.id === item.episode_id);
              if (!story || !episode) return null;

              return (
                <div
                  key={item.id}
                  onClick={() => playEpisode(story, episode, item.current_position)}
                  className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={story.cover_image_url}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{story.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Ep {episode.episode_number}: {episode.title}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-xs text-slate-400 font-mono">
                    <p className="text-slate-300 font-semibold">{formatDuration(item.current_position)}</p>
                    <p className="text-[10px] text-slate-500">{formatDate(item.updated_at)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. Downloaded Episodes (Stored in IndexedDB) */}
      {activeTab === 'downloads' && (
        <div className="space-y-4">
          
          {/* Offline Storage Status Card */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white">IndexedDB Offline Storage</h3>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> No WiFi Required
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  <strong className="text-white">{downloads.length}</strong> {downloads.length === 1 ? 'episode' : 'episodes'} cached · <strong className="text-white">{formatBytes(totalStorageBytes)}</strong> stored on device
                </p>
              </div>
            </div>

            {downloads.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-950/70 border border-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Downloads</span>
              </button>
            )}
          </div>

          {/* Downloads list */}
          {downloads.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 p-6">
              <Download className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">No downloaded episodes yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                Download your favorite episodes to listen anytime, anywhere—even without an active internet or cellular connection.
              </p>
              <button
                onClick={() => setAppNavTab('discover')}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-xl text-white text-xs font-bold transition-colors"
              >
                Explore Audio Stories
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {downloads.map((item) => (
                <div
                  key={item.episode_id}
                  className="p-3.5 sm:p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 transition-all"
                >
                  <div 
                    onClick={() => playEpisode(item.story, item.episode)}
                    className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer group"
                  >
                    <div className="relative w-12 h-16 sm:w-14 sm:h-18 rounded-xl overflow-hidden shrink-0 bg-slate-800 shadow-md">
                      <img
                        src={item.story.cover_image_url}
                        alt={item.story.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-orange-400 fill-current" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-orange-400">
                          Episode {item.episode.episode_number}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Offline Ready
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                        {item.episode.title}
                      </h3>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.story.title} · {item.story.author}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                        <span>{formatDuration(item.episode.duration)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatBytes(item.size_bytes)}</span>
                        <span aria-hidden="true">·</span>
                        <span>Saved {formatDate(item.downloaded_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => playEpisode(item.story, item.episode)}
                      className="w-9 h-9 rounded-xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-600/20"
                      title="Play offline"
                      aria-label="Play offline"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                    <button
                      onClick={() => removeDownload(item.episode_id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                      title="Delete download from device"
                      aria-label="Delete download"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clear All Confirmation Modal */}
          {showClearConfirm && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Delete all offline downloads?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This will remove all {downloads.length} cached episodes from your device's IndexedDB storage ({formatBytes(totalStorageBytes)}). You can redownload them anytime.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await clearDownloads();
                      setShowClearConfirm(false);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
