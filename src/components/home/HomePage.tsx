import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAudio } from '../../context/AudioContext';
import { StoryCard } from '../common/StoryCard';
import { 
  Play, 
  TrendingUp, 
  Sparkles, 
  Flame, 
  Clock, 
  ChevronRight, 
  Bookmark, 
  Star, 
  Headphones, 
  Heart,
  RotateCcw
} from 'lucide-react';
import { formatDuration, formatViewCount } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const { 
    stories, 
    categories, 
    episodes, 
    progressList, 
    currentUser, 
    navigateToStory, 
    setSelectedCategoryId, 
    setActiveTab,
    toggleFavorite,
    isFavorite
  } = useApp();

  const { playEpisode } = useAudio();

  // Featured banner rotation
  const featuredStories = stories.filter((s) => s.is_featured && s.status === 'published');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (featuredStories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % featuredStories.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredStories.length]);

  const activeBannerStory = featuredStories[currentBannerIndex] || stories[0];

  // Continue listening items
  const userProgress = currentUser
    ? progressList
        .filter((p) => p.user_id === currentUser.id && !p.completed)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 4)
    : [];

  // Categorized stories
  const trendingStories = stories.filter((s) => s.status === 'published' && (s.is_trending || s.total_views > 100000));
  const popularStories = [...stories]
    .filter((s) => s.status === 'published')
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 8);
  const latestReleases = [...stories]
    .filter((s) => s.status === 'published')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
  const recommendedStories = [...stories]
    .filter((s) => s.status === 'published' && s.rating >= 4.6)
    .slice(0, 8);

  const bannerEpisodes = activeBannerStory
    ? episodes.filter((e) => e.story_id === activeBannerStory.id && e.status === 'published').sort((a, b) => a.episode_number - b.episode_number)
    : [];

  const handleBannerPlay = () => {
    if (!activeBannerStory) return;
    if (bannerEpisodes.length > 0) {
      playEpisode(activeBannerStory, bannerEpisodes[0]);
    } else {
      navigateToStory(activeBannerStory.id);
    }
  };

  const bannerCategory = categories.find((c) => c.id === activeBannerStory?.category_id);

  return (
    <div className="min-h-screen pb-24 md:pb-16 text-slate-100">
      
      {/* 1. Hero Featured Banner Carousel */}
      {activeBannerStory && (
        <section className="relative w-full overflow-hidden border-b border-slate-800/80 bg-slate-950">
          
          {/* Ambient background blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-110 pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url(${activeBannerStory.cover_image_url})` }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Banner Left: Text & CTAs */}
              <div className="md:col-span-7 lg:col-span-8 flex flex-col items-start z-10 order-2 md:order-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 mb-2">
                  <span className="bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded text-[11px] font-bold">
                    FEATURED AUDIO SERIES
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{bannerCategory?.name || 'Romance'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeBannerStory.language}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white mb-3 max-w-2xl text-wrap-balance">
                  {activeBannerStory.title}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 line-clamp-3 mb-6 max-w-xl font-normal leading-relaxed">
                  {activeBannerStory.synopsis}
                </p>

                {/* Metadata strip */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{activeBannerStory.rating.toFixed(1)}</span>
                    <span className="text-slate-500 font-normal">({activeBannerStory.review_count} reviews)</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-700">|</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Headphones className="w-4 h-4 text-orange-400" />
                    <span className="tabular-nums">{formatViewCount(activeBannerStory.total_views)} listeners</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-700">|</span>
                  <span className="tabular-nums text-slate-300">{bannerEpisodes.length} Episodes</span>
                </div>

                {/* Primary CTAs */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleBannerPlay}
                    className="h-11 px-6 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 hover:from-orange-500 hover:to-amber-300 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Episode 1</span>
                  </button>

                  <button
                    onClick={() => navigateToStory(activeBannerStory.id)}
                    className="h-11 px-5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    <span>View Episodes</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleFavorite(activeBannerStory.id)}
                    className={`h-11 w-11 rounded-full border border-slate-700 flex items-center justify-center transition-colors ${
                      isFavorite(activeBannerStory.id) 
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                        : 'bg-slate-900/80 text-slate-400 hover:text-white'
                    }`}
                    aria-label="Favorite story"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(activeBannerStory.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Carousel dots indicators */}
                {featuredStories.length > 1 && (
                  <div className="flex items-center gap-2 mt-6">
                    {featuredStories.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentBannerIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentBannerIndex ? 'w-6 bg-orange-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Banner Right: Large Cinematic Cover */}
              <div className="md:col-span-5 lg:col-span-4 flex justify-center order-1 md:order-2 z-10">
                <div 
                  onClick={() => navigateToStory(activeBannerStory.id)}
                  className="relative w-56 sm:w-64 md:w-72 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
                >
                  <img
                    src={activeBannerStory.cover_image_url}
                    alt={activeBannerStory.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider block">
                      Narrated by {activeBannerStory.narrator}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 2. Category Selector Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-slate-900">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setActiveTab('discover');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 bg-orange-600 text-white shadow-md shadow-orange-600/20 hover:bg-orange-500 transition-colors"
          >
            All Genres
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setActiveTab('discover');
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Continue Listening Shelf (If user has progress) */}
      {userProgress.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Continue Listening
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              <span>View Library</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {userProgress.map((item) => {
              const story = stories.find((s) => s.id === item.story_id);
              const episode = episodes.find((e) => e.id === item.episode_id);
              if (!story || !episode) return null;

              const percent = Math.min(100, Math.round((item.current_position / (item.duration || episode.duration)) * 100));

              return (
                <div
                  key={item.id}
                  onClick={() => playEpisode(story, episode, item.current_position)}
                  className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center gap-3.5 cursor-pointer group transition-all"
                >
                  <div className="relative w-14 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-800">
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
                    <h3 className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      Ep {episode.episode_number}: {episode.title}
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
                        <span>{percent}% played</span>
                        <span>{formatDuration(item.current_position)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Trending Stories Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Trending on DK Fm
              </h2>
              <p className="text-xs text-slate-400">Most listened stories this week</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('discover')}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* 5. Popular Stories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Popular Audio Dramas
              </h2>
              <p className="text-xs text-slate-400">Top ranked shows by listener ratings</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularStories.slice(0, 6).map((story) => (
            <StoryCard key={story.id} story={story} layout="horizontal" />
          ))}
        </div>
      </section>

      {/* 6. Recommended For You */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Recommended For You
              </h2>
              <p className="text-xs text-slate-400">Hand-curated voice performances & thrilling scripts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {recommendedStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

    </div>
  );
};
