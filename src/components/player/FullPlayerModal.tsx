import React, { useState } from 'react';
import { useAudio, PlaybackRate, SleepTimerOption } from '../../context/AudioContext';
import { useApp } from '../../context/AppContext';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Clock, 
  Heart, 
  Bookmark, 
  Share2, 
  Mic, 
  Music, 
  ListMusic,
  Check,
  Download,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { useDownload } from '../../context/DownloadContext';

export const FullPlayerModal: React.FC = () => {
  const {
    currentStory,
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    isExpanded,
    isLoading,
    sleepTimer,
    sleepRemainingSeconds,
    isSpeechMode,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setRate,
    setVol,
    toggleMute,
    playNext,
    playPrevious,
    setExpanded,
    setSleep,
    toggleSpeechMode,
    hasNextEpisode,
    hasPreviousEpisode,
    playEpisode
  } = useAudio();

  const { episodes, toggleFavorite, toggleFollow, isFavorite, isFollowed, navigateToStory } = useApp();
  const { isDownloaded, isDownloading, downloadingIds, downloadEpisode, removeDownload } = useDownload();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isExpanded || !currentStory || !currentEpisode) return null;

  const storyEpisodes = episodes
    .filter((e) => e.story_id === currentStory.id && e.status === 'published')
    .sort((a, b) => a.episode_number - b.episode_number);

  const favorite = isFavorite(currentStory.id);
  const followed = isFollowed(currentStory.id);

  const speedOptions: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const sleepOptions: { label: string; value: SleepTimerOption }[] = [
    { label: 'Off', value: 0 },
    { label: '5 Minutes', value: 5 },
    { label: '15 Minutes', value: 15 },
    { label: '30 Minutes', value: 30 },
    { label: '45 Minutes', value: 45 },
    { label: '60 Minutes', value: 60 },
    { label: 'End of Episode', value: -1 },
  ];

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${currentEpisode.title} - ${currentStory.title}`,
        text: `Listen to ${currentEpisode.title} on DK Fm!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070a12]/98 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      
      {/* Background ambient lighting blur */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none blur-[120px] bg-cover bg-center"
        style={{ backgroundImage: `url(${currentEpisode.cover_image_url || currentStory.cover_image_url})` }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 max-w-2xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setExpanded(false)}
          className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition-colors"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center min-w-0 px-4">
          <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider">
            Now Playing
          </p>
          <button 
            onClick={() => {
              navigateToStory(currentStory.id);
              setExpanded(false);
            }}
            className="text-sm font-bold text-white hover:text-orange-400 transition-colors truncate block max-w-[240px] sm:max-w-md mx-auto"
          >
            {currentStory.title}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
            className={`p-2 rounded-full transition-colors ${showEpisodeDrawer ? 'text-orange-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'}`}
            title="Episode List"
            aria-label="Episode list"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-md w-full mx-auto px-6 py-2 flex flex-col items-center justify-center flex-1">
        
        {/* Cover Art */}
        <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-6">
          <img
            src={currentEpisode.cover_image_url || currentStory.cover_image_url}
            alt={currentStory.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Subtle audio waves on cover when playing */}
          {isPlaying && (
            <div className="absolute bottom-3 right-3 flex items-end gap-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg">
              <span className="w-1 bg-orange-400 rounded-full animate-pulse h-4" />
              <span className="w-1 bg-orange-400 rounded-full animate-pulse delay-75 h-6" />
              <span className="w-1 bg-orange-400 rounded-full animate-pulse delay-150 h-3" />
              <span className="w-1 bg-orange-400 rounded-full animate-pulse delay-100 h-5" />
            </div>
          )}

          {/* Premium / Free badge */}
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
              currentEpisode.access_type === 'premium' 
                ? 'bg-amber-500/90 text-slate-950 shadow-md' 
                : 'bg-black/60 text-slate-200 border border-white/10'
            }`}>
              {currentEpisode.access_type === 'premium' ? 'VIP Premium' : 'Free Episode'}
            </span>
          </div>
        </div>

        {/* Title, Episode & Author */}
        <div className="w-full text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-orange-400">
              Episode {currentEpisode.episode_number}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 truncate max-w-[180px]">
              {currentStory.author}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight line-clamp-1 mb-1">
            {currentEpisode.title}
          </h2>
          <p className="text-xs text-slate-400 line-clamp-2 max-w-sm mx-auto">
            {currentEpisode.description}
          </p>
        </div>

        {/* Action icons row (Favorite, Follow, Share, Speech/Voice switch) */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={() => toggleFavorite(currentStory.id)}
            className={`p-2 rounded-full transition-colors ${
              favorite ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Add to Favorites"
            aria-label="Add to Favorites"
          >
            <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => toggleFollow(currentStory.id)}
            className={`p-2 rounded-full transition-colors ${
              followed ? 'text-orange-400 bg-orange-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Follow Story"
            aria-label="Follow Story"
          >
            <Bookmark className={`w-5 h-5 ${followed ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={toggleSpeechMode}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSpeechMode 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Toggle between regular audio file and AI narrator voice synthesis"
          >
            {isSpeechMode ? <Mic className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
            <span>{isSpeechMode ? 'AI Voice Narrator' : 'Studio Audio'}</span>
          </button>

          <button
            onClick={() => {
              if (isDownloaded(currentEpisode.id)) {
                removeDownload(currentEpisode.id);
              } else {
                downloadEpisode(currentEpisode, currentStory);
              }
            }}
            disabled={isDownloading(currentEpisode.id)}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              isDownloaded(currentEpisode.id)
                ? 'text-emerald-400 bg-emerald-500/10'
                : isDownloading(currentEpisode.id)
                ? 'text-orange-400 bg-orange-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
            title={isDownloaded(currentEpisode.id) ? 'Downloaded offline (Click to delete)' : 'Download for offline listening'}
            aria-label="Download episode"
          >
            {isDownloading(currentEpisode.id) ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isDownloaded(currentEpisode.id) ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-white rounded-full transition-colors relative"
            title="Share Episode"
            aria-label="Share"
          >
            {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Scrubber Seek Bar */}
        <div className="w-full mb-4">
          <input
            type="range"
            min={0}
            max={duration || currentEpisode.duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:h-2 transition-all"
            aria-label="Seek time"
          />
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono tabular-nums mt-1.5 px-0.5">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration || currentEpisode.duration)}</span>
          </div>
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 w-full mb-6">
          {/* Previous episode */}
          <button
            onClick={playPrevious}
            disabled={!hasPreviousEpisode}
            className="p-3 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            title="Previous Episode"
            aria-label="Previous episode"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Rewind 15s */}
          <button
            onClick={() => skipBackward(15)}
            className="p-3 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors flex items-center justify-center"
            title="Rewind 15 seconds"
            aria-label="Rewind 15 seconds"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          {/* Big Play / Pause button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 hover:scale-105 active:scale-95 text-slate-950 font-bold flex items-center justify-center shadow-xl shadow-orange-500/25 transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Forward 15s */}
          <button
            onClick={() => skipForward(15)}
            className="p-3 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors flex items-center justify-center"
            title="Forward 15 seconds"
            aria-label="Forward 15 seconds"
          >
            <RotateCw className="w-6 h-6" />
          </button>

          {/* Next episode */}
          <button
            onClick={playNext}
            disabled={!hasNextEpisode}
            className="p-3 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            title="Next Episode"
            aria-label="Next episode"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary controls footer: Speed, Volume, Sleep Timer */}
        <div className="flex items-center justify-between w-full max-w-sm px-2 text-xs text-slate-400">
          
          {/* Playback speed selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowSleepMenu(false);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-mono font-medium transition-colors"
            >
              {playbackRate}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-24 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50">
                {speedOptions.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-mono transition-colors flex items-center justify-between ${
                      playbackRate === rate ? 'text-orange-400 bg-orange-500/10 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2 flex-1 max-w-[130px] mx-3">
            <button
              onClick={toggleMute}
              className="p-1 hover:text-white transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVol(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-orange-500"
              aria-label="Volume"
            />
          </div>

          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSleepMenu(!showSleepMenu);
                setShowSpeedMenu(false);
              }}
              className={`p-1.5 rounded-md flex items-center gap-1 transition-colors ${
                sleepTimer !== 0 ? 'text-orange-400 bg-orange-500/10 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Sleep Timer"
            >
              <Clock className="w-4 h-4" />
              {sleepRemainingSeconds !== null && sleepTimer !== 0 && (
                <span className="font-mono text-[10px]">
                  {Math.ceil(sleepRemainingSeconds / 60)}m
                </span>
              )}
            </button>

            {showSleepMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50">
                <p className="px-3 py-1 text-[11px] font-semibold text-slate-500 border-b border-slate-800">
                  Sleep Timer
                </p>
                {sleepOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSleep(opt.value);
                      setShowSleepMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center justify-between ${
                      sleepTimer === opt.value ? 'text-orange-400 bg-orange-500/10 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sleepTimer === opt.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Episode Drawer overlay */}
      {showEpisodeDrawer && (
        <div className="fixed inset-x-0 bottom-0 max-h-[60vh] bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 sm:p-6 shadow-2xl z-50 overflow-y-auto">
          <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Episodes ({storyEpisodes.length})</h3>
            <button
              onClick={() => setShowEpisodeDrawer(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            {storyEpisodes.map((ep) => {
              const isCurrent = ep.id === currentEpisode.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => {
                    playEpisode(currentStory, ep);
                    setShowEpisodeDrawer(false);
                  }}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isCurrent ? 'bg-orange-500/15 border border-orange-500/30' : 'bg-slate-800/40 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-mono font-bold w-6 ${isCurrent ? 'text-orange-400' : 'text-slate-500'}`}>
                      {ep.episode_number < 10 ? `0${ep.episode_number}` : ep.episode_number}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-orange-400' : 'text-white'}`}>
                        {ep.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {formatDuration(ep.duration)} · {ep.access_type === 'premium' ? 'VIP' : 'Free'}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isCurrent && isPlaying ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block animate-pulse" />
                    ) : (
                      <Play className="w-4 h-4 text-slate-400 hover:text-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safe bottom spacer */}
      <div className="h-6 pb-safe" />
    </div>
  );
};
