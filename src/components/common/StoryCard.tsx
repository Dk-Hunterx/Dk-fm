import React from 'react';
import { Story } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAudio } from '../../context/AudioContext';
import { Play, Star, Headphones } from 'lucide-react';
import { formatViewCount } from '../../utils/formatters';

interface StoryCardProps {
  story: Story;
  layout?: 'vertical' | 'horizontal' | 'compact';
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, layout = 'vertical' }) => {
  const { navigateToStory, categories, episodes } = useApp();
  const { playEpisode, currentStory, isPlaying } = useAudio();

  const category = categories.find((c) => c.id === story.category_id);
  const storyEpisodes = episodes
    .filter((e) => e.story_id === story.id && e.status === 'published')
    .sort((a, b) => a.episode_number - b.episode_number);

  const isCurrentStoryPlaying = currentStory?.id === story.id && isPlaying;

  const handleQuickPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (storyEpisodes.length > 0) {
      playEpisode(story, storyEpisodes[0]);
    } else {
      navigateToStory(story.id);
    }
  };

  if (layout === 'horizontal') {
    return (
      <div
        onClick={() => navigateToStory(story.id)}
        className="group flex items-center gap-3.5 p-2.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer"
      >
        <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-800 shadow-md">
          <img
            src={story.cover_image_url}
            alt={story.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 -z-10 bg-slate-800 flex items-center justify-center">
            <span className="text-xs font-bold text-orange-400">DK Fm</span>
          </div>

          {/* Quick play overlay */}
          <button
            onClick={handleQuickPlay}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            aria-label={`Play ${story.title}`}
          >
            <div className="w-9 h-9 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-orange-400 font-medium">{category?.name || 'Story'}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{story.language}</span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate mb-1">
            {story.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mb-2">
            {story.short_description}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{story.rating.toFixed(1)}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5 text-slate-500" />
              <span className="tabular-nums">{formatViewCount(story.total_views)}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{storyEpisodes.length} eps</span>
          </div>
        </div>
      </div>
    );
  }

  // Default Vertical Card
  return (
    <div
      onClick={() => navigateToStory(story.id)}
      className="group flex flex-col cursor-pointer select-none"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 group-hover:border-slate-700 shadow-md group-hover:shadow-xl group-hover:shadow-orange-950/20 transition-all duration-300">
        <img
          src={story.cover_image_url}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Fallback pattern */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 text-center">
          <Headphones className="w-8 h-8 text-orange-400/60 mb-2" />
          <span className="text-xs font-bold text-slate-300">{story.title}</span>
        </div>

        {/* Scrim overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges: Premium / Episode count */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md ${
            story.access_type === 'premium' 
              ? 'bg-amber-500/90 text-slate-950' 
              : 'bg-black/60 text-slate-200'
          }`}>
            {story.access_type === 'premium' ? 'VIP' : 'FREE'}
          </span>
          <span className="text-[10px] font-semibold text-slate-200 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded tabular-nums">
            {storyEpisodes.length} Eps
          </span>
        </div>

        {/* Hover / Active Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickPlay}
            className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-400 text-slate-950 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform active:scale-90"
            aria-label={`Play ${story.title}`}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>

        {/* Bottom Card Scrim Data */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-300 pointer-events-none">
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <Star className="w-3 h-3 fill-current" />
            <span className="tabular-nums">{story.rating.toFixed(1)}</span>
          </span>
          <span className="flex items-center gap-1 tabular-nums font-medium text-slate-200">
            <Headphones className="w-3 h-3 text-orange-400" />
            {formatViewCount(story.total_views)}
          </span>
        </div>
      </div>

      {/* Typography metadata below cover */}
      <div className="mt-2.5 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-orange-400 font-medium truncate">{category?.name || 'Drama'}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{story.author}</span>
        </div>
        <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 mt-0.5">
          {story.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
          {story.short_description}
        </p>
      </div>
    </div>
  );
};
