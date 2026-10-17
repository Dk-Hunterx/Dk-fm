import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Pause, RotateCw, SkipForward, ChevronUp, AlertCircle, Mic } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export const MiniPlayer: React.FC = () => {
  const {
    currentStory,
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    skipForward,
    playNext,
    hasNextEpisode,
    setExpanded,
    isLoading,
    error,
    isSpeechMode,
  } = useAudio();

  if (!currentEpisode || !currentStory) return null;

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-30 px-3 md:px-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div 
          onClick={() => setExpanded(true)}
          className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 hover:border-slate-600 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center justify-between gap-3 cursor-pointer group transition-all"
        >
          {/* Progress bar line along top */}
          <div className="absolute -top-[1px] left-3 right-3 h-[2.5px] bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Left: Thumbnail & Episode info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-slate-700/60 shadow-md">
              <img
                src={currentEpisode.cover_image_url || currentStory.cover_image_url}
                alt={currentStory.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {/* Fallback pattern */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-950 to-slate-900 flex items-center justify-center">
                <span className="text-[10px] font-bold text-orange-400">DK</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-orange-400 truncate">
                  Ep {currentEpisode.episode_number}: {currentEpisode.title}
                </span>
                {isSpeechMode && (
                  <span className="text-[9px] bg-purple-950/80 text-purple-300 border border-purple-800 px-1 py-0.2 rounded font-medium flex items-center gap-0.5">
                    <Mic className="w-2.5 h-2.5" /> AI Voice
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 truncate font-medium">
                {currentStory.title}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="font-mono tabular-nums">{formatDuration(currentTime)}</span>
                <span aria-hidden="true">/</span>
                <span className="font-mono tabular-nums">{formatDuration(duration || currentEpisode.duration)}</span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div 
            className="flex items-center gap-1 sm:gap-2 shrink-0" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Skip 15s */}
            <button
              onClick={() => skipForward(15)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors hidden sm:flex items-center justify-center"
              title="Skip 15s"
              aria-label="Skip 15 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20 active:scale-95 transition-all"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Episode */}
            {hasNextEpisode && (
              <button
                onClick={playNext}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Next Episode"
                aria-label="Next episode"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Expand full modal trigger */}
            <button
              onClick={() => setExpanded(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors ml-1"
              aria-label="Expand player"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-1 px-3 py-1 bg-amber-950/80 border border-amber-800/80 rounded-xl text-[11px] text-amber-200 flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-1.5 truncate">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{error}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
