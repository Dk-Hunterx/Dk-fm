import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StoryCard } from '../common/StoryCard';
import { Search, SlidersHorizontal, X, Compass, Sparkles } from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const { 
    stories, 
    categories, 
    searchQuery, 
    setSearchQuery, 
    selectedCategoryId, 
    setSelectedCategoryId 
  } = useApp();

  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedAccess, setSelectedAccess] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  const languages = useMemo(() => {
    const set = new Set<string>();
    stories.forEach((s) => set.add(s.language));
    return ['all', ...Array.from(set)];
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Must be published
      if (story.status !== 'published') return false;

      // Category filter
      if (selectedCategoryId && story.category_id !== selectedCategoryId) {
        return false;
      }

      // Language filter
      if (selectedLanguage !== 'all' && story.language !== selectedLanguage) {
        return false;
      }

      // Access filter
      if (selectedAccess !== 'all' && story.access_type !== selectedAccess) {
        return false;
      }

      // Search query filter (title, author, narrator, short description, category name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cat = categories.find((c) => c.id === story.category_id);
        const matchesTitle = story.title.toLowerCase().includes(q);
        const matchesAuthor = story.author.toLowerCase().includes(q);
        const matchesNarrator = story.narrator.toLowerCase().includes(q);
        const matchesDesc = story.short_description.toLowerCase().includes(q);
        const matchesCat = cat?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesNarrator && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.total_views - a.total_views;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });
  }, [stories, selectedCategoryId, selectedLanguage, selectedAccess, searchQuery, categories, sortBy]);

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen pb-28 md:pb-20 text-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 mb-1">
          <Compass className="w-4 h-4" />
          <span>EXPLORE CATALOG</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Discover Stories & Dramas
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Browse top audiobooks, pocket audio series, and voice adventures.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by story title, author name, narrator, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Scroller */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategoryId === null
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All Categories ({stories.filter((s) => s.status === 'published').length})
          </button>
          {categories.map((cat) => {
            const count = stories.filter((s) => s.category_id === cat.id && s.status === 'published').length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl mb-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="text-slate-400 flex items-center gap-1 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
          </span>

          {/* Language filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Languages</option>
            {languages.filter((l) => l !== 'all').map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          {/* Access filter */}
          <select
            value={selectedAccess}
            onChange={(e) => setSelectedAccess(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Access</option>
            <option value="free">Free Only</option>
            <option value="premium">VIP Premium</option>
          </select>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400 font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            <option value="popular">Most Listened</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
        <span>
          Showing <strong className="text-white tabular-nums">{filteredStories.length}</strong> {filteredStories.length === 1 ? 'story' : 'stories'}
          {activeCategory && <span> in <strong className="text-orange-400">{activeCategory.name}</strong></span>}
          {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
        </span>
        {(selectedCategoryId || selectedLanguage !== 'all' || selectedAccess !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setSelectedLanguage('all');
              setSelectedAccess('all');
              setSearchQuery('');
            }}
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/80 p-8">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No matching stories found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search terms or clearing your filters to explore other genres and voice casts.
          </p>
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setSelectedLanguage('all');
              setSelectedAccess('all');
              setSearchQuery('');
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white text-xs font-semibold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}

    </div>
  );
};
