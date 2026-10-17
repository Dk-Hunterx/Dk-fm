import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAudio } from '../../context/AudioContext';
import { StoryCard } from '../common/StoryCard';
import { 
  Play, 
  Heart, 
  Bookmark, 
  Share2, 
  Star, 
  Headphones, 
  Calendar, 
  Globe, 
  User, 
  Mic, 
  ChevronLeft, 
  Clock, 
  Check, 
  MessageSquare,
  Lock,
  Sparkles,
  Download,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { formatDate, formatDuration, formatViewCount } from '../../utils/formatters';
import { useDownload } from '../../context/DownloadContext';

export const StoryDetailPage: React.FC = () => {
  const { 
    selectedStoryId, 
    stories, 
    categories, 
    episodes, 
    reviews, 
    progressList, 
    currentUser, 
    setActiveTab, 
    toggleFavorite, 
    toggleFollow, 
    isFavorite, 
    isFollowed,
    addReview,
    setAuthModalOpen,
    getProgress
  } = useApp();

  const { playEpisode, currentEpisode, isPlaying } = useAudio();
  const { isDownloaded, isDownloading, downloadingIds, downloadEpisode, removeDownload } = useDownload();

  const [activeTab, setActiveDetailTab] = useState<'episodes' | 'synopsis' | 'reviews'>('episodes');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const story = stories.find((s) => s.id === selectedStoryId);

  if (!story) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Story Not Found</h2>
        <p className="text-slate-400 mb-6">The audio series you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-full text-white text-xs font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === story.category_id);
  const storyEpisodes = episodes
    .filter((e) => e.story_id === story.id && e.status === 'published')
    .sort((a, b) => a.episode_number - b.episode_number);

  const storyReviews = reviews.filter((r) => r.story_id === story.id);
  const relatedStories = stories
    .filter((s) => s.id !== story.id && s.category_id === story.category_id && s.status === 'published')
    .slice(0, 4);

  const favorite = isFavorite(story.id);
  const followed = isFollowed(story.id);

  // Resume or start episode
  const userStoryProgress = currentUser
    ? progressList
        .filter((p) => p.user_id === currentUser.id && p.story_id === story.id)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
    : undefined;

  const episodeToResume = userStoryProgress
    ? storyEpisodes.find((e) => e.id === userStoryProgress.episode_id) || storyEpisodes[0]
    : storyEpisodes[0];

  const handleMainPlay = () => {
    if (!episodeToResume) return;
    const startPos = userStoryProgress?.episode_id === episodeToResume.id ? userStoryProgress.current_position : 0;
    playEpisode(story, episodeToResume, startPos);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!reviewComment.trim()) return;

    addReview(story.id, reviewRating, reviewComment);
    setReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${story.title} - DK Fm`,
        text: story.short_description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pb-28 md:pb-20 text-slate-100">
      
      {/* Top back navigation bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <button
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </button>
      </div>

      {/* Story Hero Header */}
      <section className="relative w-full overflow-hidden border-b border-slate-800/80 bg-slate-950/70">
        {/* Background ambience blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundImage: `url(${story.cover_image_url})` }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
            
            {/* Story Cover Image */}
            <div className="relative w-48 sm:w-56 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-slate-900">
              <img
                src={story.cover_image_url}
                alt={story.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md ${
                  story.access_type === 'premium' ? 'bg-amber-500 text-slate-950' : 'bg-black/60 text-white'
                }`}>
                  {story.access_type === 'premium' ? 'VIP Series' : 'Free Series'}
                </span>
              </div>
            </div>

            {/* Story Details */}
            <div className="flex-1 text-center md:text-left min-w-0">
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-orange-400 font-semibold mb-2">
                <span>{category?.name || 'Story'}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-slate-400 font-normal">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{story.language}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-slate-400 font-normal">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(story.release_date)}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display mb-2">
                {story.title}
              </h1>

              <p className="text-sm text-slate-300 line-clamp-2 mb-4 max-w-2xl leading-relaxed">
                {story.short_description}
              </p>

              {/* Author & Narrator info */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 mb-5">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Author: <strong className="text-slate-200">{story.author}</strong></span>
                </div>
                <span aria-hidden="true" className="text-slate-700">|</span>
                <div className="flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-orange-400" />
                  <span>Voice: <strong className="text-slate-200">{story.narrator}</strong></span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-xs text-slate-400 mb-6 py-2 px-4 bg-slate-900/60 rounded-xl border border-slate-800/80 inline-flex">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{story.rating.toFixed(1)}</span>
                  <span className="text-slate-500 font-normal">({story.review_count} ratings)</span>
                </div>
                <span aria-hidden="true" className="text-slate-700">|</span>
                <div className="flex items-center gap-1 text-slate-300">
                  <Headphones className="w-4 h-4 text-orange-400" />
                  <span className="tabular-nums font-semibold">{formatViewCount(story.total_views)}</span>
                  <span className="text-slate-500">listens</span>
                </div>
                <span aria-hidden="true" className="text-slate-700">|</span>
                <div className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="tabular-nums font-semibold">{storyEpisodes.length}</span>
                  <span className="text-slate-500">episodes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={handleMainPlay}
                  className="h-11 px-6 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 hover:from-orange-500 hover:to-amber-300 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{userStoryProgress ? `Resume Ep ${episodeToResume?.episode_number}` : 'Start Listening (Ep 1)'}</span>
                </button>

                <button
                  onClick={() => toggleFollow(story.id)}
                  className={`h-11 px-4 rounded-full border text-xs font-semibold flex items-center gap-2 transition-colors ${
                    followed
                      ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                      : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${followed ? 'fill-current' : ''}`} />
                  <span>{followed ? 'Following' : 'Follow Story'}</span>
                </button>

                <button
                  onClick={() => toggleFavorite(story.id)}
                  className={`h-11 px-4 rounded-full border text-xs font-semibold flex items-center gap-2 transition-colors ${
                    favorite
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                      : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
                  <span>{favorite ? 'Favorited' : 'Favorite'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="h-11 w-11 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Share story"
                  title="Share"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Main Tabbed Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveDetailTab('episodes')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'episodes'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Episodes</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full font-mono">{storyEpisodes.length}</span>
          </button>
          
          <button
            onClick={() => setActiveDetailTab('synopsis')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'synopsis'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            About & Synopsis
          </button>

          <button
            onClick={() => setActiveDetailTab('reviews')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Reviews</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full font-mono">{storyReviews.length}</span>
          </button>
        </div>

        {/* Tab 1: Episodes List */}
        {activeTab === 'episodes' && (
          <div className="space-y-3">
            {/* Download summary bar */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Download className="w-4 h-4 text-orange-400" />
                <span>Save for offline listening without internet</span>
              </div>
              <button
                onClick={async () => {
                  const freeEps = storyEpisodes.filter(e => !isDownloaded(e.id));
                  for (const ep of freeEps) {
                    await downloadEpisode(ep, story);
                  }
                  setDownloadSuccessToast(`Queued ${freeEps.length} episodes for offline listening.`);
                  setTimeout(() => setDownloadSuccessToast(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All Episodes</span>
              </button>
            </div>

            {downloadSuccessToast && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{downloadSuccessToast}</span>
              </div>
            )}

            {storyEpisodes.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm">No episodes published for this story yet.</p>
              </div>
            ) : (
              storyEpisodes.map((ep) => {
                const isThisPlaying = currentEpisode?.id === ep.id && isPlaying;
                const progress = getProgress(ep.id);
                const progressPercent = progress && progress.duration > 0
                  ? Math.min(100, Math.round((progress.current_position / progress.duration) * 100))
                  : 0;

                const downloaded = isDownloaded(ep.id);
                const downloading = isDownloading(ep.id);
                const downloadProgress = downloadingIds[ep.id] || 0;

                return (
                  <div
                    key={ep.id}
                    onClick={() => playEpisode(story, ep, progress?.current_position)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      currentEpisode?.id === ep.id
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      
                      {/* Play action circle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playEpisode(story, ep, progress?.current_position);
                        }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          currentEpisode?.id === ep.id
                            ? 'bg-orange-500 text-slate-950 font-bold shadow-lg shadow-orange-500/20'
                            : 'bg-slate-800 text-slate-200 group-hover:bg-orange-500 group-hover:text-slate-950'
                        }`}
                        aria-label={`Play episode ${ep.episode_number}`}
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-orange-400">
                            Episode {ep.episode_number}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-xs text-slate-400">
                            {formatDate(ep.release_date)}
                          </span>
                          {ep.access_type === 'premium' && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-semibold">
                              VIP
                            </span>
                          )}
                          {downloaded && (
                            <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Offline
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                          {ep.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {ep.description}
                        </p>

                        {/* Progress bar if listened */}
                        {progress && progress.current_position > 5 && (
                          <div className="mt-2 max-w-xs">
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-orange-500 h-full rounded-full"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              Listened {formatDuration(progress.current_position)} ({progressPercent}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Headphones className="w-3.5 h-3.5 text-slate-500" />
                        <span className="tabular-nums">{formatViewCount(ep.play_count)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="tabular-nums">{formatDuration(ep.duration)}</span>
                      </span>

                      {/* Download Button */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (downloaded) {
                            await removeDownload(ep.id);
                          } else {
                            await downloadEpisode(ep, story);
                          }
                        }}
                        disabled={downloading}
                        className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
                          downloaded
                            ? 'text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/80'
                            : downloading
                            ? 'text-orange-400 bg-orange-950/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                        title={downloaded ? 'Downloaded to IndexedDB (Click to remove)' : 'Save episode for offline listening'}
                        aria-label="Download episode"
                      >
                        {downloading ? (
                          <div className="flex items-center gap-1 font-mono text-[10px] text-orange-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{downloadProgress}%</span>
                          </div>
                        ) : downloaded ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Full Synopsis & Production Info */}
        {activeTab === 'synopsis' && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Story Synopsis</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {story.synopsis}
              </p>
            </div>

            <div className="border-t border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Created By</span>
                <span className="font-semibold text-slate-200">{story.author}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Voice Narrator</span>
                <span className="font-semibold text-slate-200">{story.narrator}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Original Language</span>
                <span className="font-semibold text-slate-200">{story.language}</span>
              </div>
              <div>
                <span className="text-slate-500 block">First Released</span>
                <span className="font-semibold text-slate-200">{formatDate(story.release_date)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Streaming Quality</span>
                <span className="font-semibold text-slate-200">Lossless 320kbps Audio</span>
              </div>
              <div>
                <span className="text-slate-500 block">Content Copyright</span>
                <span className="font-semibold text-slate-200">© DK Fm Originals & Studio Partners</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reviews & Ratings */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            
            {/* Write a review card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-2">Leave a Review & Rating</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Your Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`p-1 transition-colors ${
                          star <= reviewRating ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-400 ml-1">{reviewRating} Stars</span>
                </div>

                <div>
                  <textarea
                    rows={3}
                    placeholder="Share what you think of the story, voice acting, and plot twists..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="flex justify-between items-center">
                  {reviewSubmitted ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Review submitted successfully!
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-white text-xs font-bold transition-colors"
                  >
                    Post Review
                  </button>
                </div>
              </form>
            </div>

            {/* Existing reviews list */}
            <div className="space-y-3">
              {storyReviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No reviews yet. Be the first to review this audio story!
                </div>
              ) : (
                storyReviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.user_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + rev.user_name}
                          alt={rev.user_name}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{rev.user_name}</p>
                          <p className="text-[10px] text-slate-500">{formatDate(rev.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-9">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Related Stories Section */}
        {relatedStories.length > 0 && (
          <div className="mt-14 pt-8 border-t border-slate-800/80">
            <h3 className="text-base font-bold font-display text-white mb-4">
              More in {category?.name || 'Genre'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedStories.map((relStory) => (
                <StoryCard key={relStory.id} story={relStory} />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
