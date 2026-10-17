import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAudio } from '../../context/AudioContext';
import { 
  Story, 
  Episode, 
  Category, 
  User, 
  StoryStatus, 
  AccessType, 
  EpisodeStatus 
} from '../../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  ListMusic, 
  Users, 
  Layers, 
  Settings, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  AlertTriangle, 
  Play, 
  Upload, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Headphones, 
  Star, 
  Save, 
  RotateCcw,
  Download,
  FolderArchive
} from 'lucide-react';
import { formatDuration, formatDate, formatViewCount } from '../../utils/formatters';

type AdminTab = 'dashboard' | 'stories' | 'episodes' | 'users' | 'categories' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    users, 
    stories, 
    episodes, 
    categories, 
    settings, 
    createStory, 
    updateStory, 
    deleteStory, 
    createEpisode, 
    updateEpisode, 
    deleteEpisode, 
    bulkAddEpisodes,
    createCategory, 
    updateCategory, 
    deleteCategory, 
    toggleUserStatus, 
    setUserRole, 
    updateSettings, 
    resetAllData,
    navigateToStory,
    switchUserRole,
    setExportModalOpen
  } = useApp();

  const { playEpisode } = useAudio();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Story modals & states
  const [storySearch, setStorySearch] = useState('');
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

  // Form fields for Story
  const [storyForm, setStoryForm] = useState({
    title: '',
    short_description: '',
    synopsis: '',
    cover_image_url: '',
    author: '',
    narrator: '',
    category_id: categories[0]?.id || 'cat-romance',
    language: 'English',
    status: 'published' as StoryStatus,
    access_type: 'free' as AccessType,
    release_date: new Date().toISOString().split('T')[0],
    is_featured: false,
    is_trending: false,
  });

  // Episode state
  const [selectedStoryForEpisodes, setSelectedStoryForEpisodes] = useState<string>(stories[0]?.id || '');
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null);

  // Form fields for Episode
  const [episodeForm, setEpisodeForm] = useState({
    episode_number: 1,
    title: '',
    description: '',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 360,
    status: 'published' as EpisodeStatus,
    access_type: 'free' as AccessType,
    release_date: new Date().toISOString(),
    narration_text: '',
  });

  // Bulk episodes count
  const [bulkCount, setBulkCount] = useState<number>(3);

  // User search & state
  const [userSearch, setUserSearch] = useState('');

  // Category state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    display_order: 1,
  });

  // App Settings Form
  const [settingsForm, setSettingsForm] = useState({
    app_name: settings.app_name,
    tagline: settings.tagline,
    audio_upload_limit_mb: settings.audio_upload_limit_mb,
    maintenance_mode: settings.maintenance_mode,
    terms_of_service: settings.terms_of_service,
    privacy_policy: settings.privacy_policy,
  });

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Restrict access to administrators
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Restricted Admin Access</h2>
        <p className="text-xs text-slate-400 mb-6">
          This portal is reserved strictly for authorized administrators to manage audio stories, episodes, and app configurations.
        </p>
        <button
          onClick={() => switchUserRole('admin')}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-xs font-bold transition-colors shadow-lg shadow-purple-600/30"
        >
          Switch to Administrator Account (Reviewer Demo)
        </button>
      </div>
    );
  }

  // Story Form Handlers
  const handleOpenAddStory = () => {
    setEditingStory(null);
    setStoryForm({
      title: '',
      short_description: '',
      synopsis: '',
      cover_image_url: '/src/assets/images/story_billionaire_secret_1792061350911.jpg',
      author: '',
      narrator: '',
      category_id: categories[0]?.id || 'cat-romance',
      language: 'English',
      status: 'published',
      access_type: 'free',
      release_date: new Date().toISOString().split('T')[0],
      is_featured: false,
      is_trending: false,
    });
    setIsStoryModalOpen(true);
  };

  const handleOpenEditStory = (story: Story) => {
    setEditingStory(story);
    setStoryForm({
      title: story.title,
      short_description: story.short_description,
      synopsis: story.synopsis,
      cover_image_url: story.cover_image_url,
      author: story.author,
      narrator: story.narrator,
      category_id: story.category_id,
      language: story.language,
      status: story.status,
      access_type: story.access_type,
      release_date: story.release_date,
      is_featured: !!story.is_featured,
      is_trending: !!story.is_trending,
    });
    setIsStoryModalOpen(true);
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.title.trim()) {
      notify('Story title is required', 'error');
      return;
    }

    if (editingStory) {
      updateStory(editingStory.id, storyForm);
      notify(`Updated story "${storyForm.title}"`);
    } else {
      createStory(storyForm);
      notify(`Created new story "${storyForm.title}"`);
    }
    setIsStoryModalOpen(false);
  };

  const handleConfirmDeleteStory = () => {
    if (storyToDelete) {
      deleteStory(storyToDelete.id);
      notify(`Deleted story "${storyToDelete.title}" and its episodes`);
      setStoryToDelete(null);
    }
  };

  // Episode Form Handlers
  const currentStoryEpisodes = episodes
    .filter((e) => e.story_id === selectedStoryForEpisodes)
    .sort((a, b) => a.episode_number - b.episode_number);

  const handleOpenAddEpisode = () => {
    setEditingEpisode(null);
    const nextNumber = currentStoryEpisodes.length > 0 
      ? Math.max(...currentStoryEpisodes.map((e) => e.episode_number)) + 1 
      : 1;

    setEpisodeForm({
      episode_number: nextNumber,
      title: `Chapter ${nextNumber}: The Turning Point`,
      description: 'An unexpected encounter shifts the balance of power.',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 360,
      status: 'published',
      access_type: 'free',
      release_date: new Date().toISOString(),
      narration_text: `Chapter ${nextNumber}. The room fell silent as the clock struck midnight.`,
    });
    setIsEpisodeModalOpen(true);
  };

  const handleOpenEditEpisode = (ep: Episode) => {
    setEditingEpisode(ep);
    setEpisodeForm({
      episode_number: ep.episode_number,
      title: ep.title,
      description: ep.description,
      audio_url: ep.audio_url,
      duration: ep.duration,
      status: ep.status,
      access_type: ep.access_type,
      release_date: ep.release_date,
      narration_text: ep.narration_text || '',
    });
    setIsEpisodeModalOpen(true);
  };

  const handleSaveEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!episodeForm.title.trim()) {
      notify('Episode title is required', 'error');
      return;
    }

    if (editingEpisode) {
      updateEpisode(editingEpisode.id, episodeForm);
      notify(`Updated Episode ${episodeForm.episode_number}`);
    } else {
      createEpisode({
        ...episodeForm,
        story_id: selectedStoryForEpisodes,
      });
      notify(`Added Episode ${episodeForm.episode_number} to story`);
    }
    setIsEpisodeModalOpen(false);
  };

  const handleConfirmDeleteEpisode = () => {
    if (episodeToDelete) {
      deleteEpisode(episodeToDelete.id);
      notify(`Deleted episode "${episodeToDelete.title}"`);
      setEpisodeToDelete(null);
    }
  };

  const handleBulkAdd = () => {
    const parentStory = stories.find((s) => s.id === selectedStoryForEpisodes);
    if (!parentStory) return;

    const startNum = currentStoryEpisodes.length > 0
      ? Math.max(...currentStoryEpisodes.map((e) => e.episode_number)) + 1
      : 1;

    const newBatch: Omit<Episode, 'id' | 'play_count'>[] = [];
    for (let i = 0; i < bulkCount; i++) {
      const num = startNum + i;
      newBatch.push({
        story_id: selectedStoryForEpisodes,
        episode_number: num,
        title: `Episode ${num} — Revelations Part ${i + 1}`,
        description: `Crucial chapter in ${parentStory.title} unveiling deep mysteries.`,
        audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${((num % 10) + 1)}.mp3`,
        duration: 300 + (i * 30),
        status: 'published',
        access_type: num > 3 ? 'premium' : 'free',
        release_date: new Date().toISOString(),
        narration_text: `Episode ${num}. The plot deepens as our protagonists face their greatest ordeal yet.`,
      });
    }

    bulkAddEpisodes(newBatch);
    notify(`Successfully generated and uploaded ${bulkCount} episodes!`);
    setIsBulkModalOpen(false);
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      display_order: categories.length + 1,
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description,
      display_order: cat.display_order,
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
      notify(`Updated category "${categoryForm.name}"`);
    } else {
      createCategory(categoryForm);
      notify(`Created category "${categoryForm.name}"`);
    }
    setCategoryModalOpen(false);
  };

  // App Settings save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    notify('App settings saved successfully');
  };

  // Filtered lists
  const filteredStories = stories.filter((s) => {
    if (!storySearch.trim()) return true;
    const q = storySearch.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q);
  });

  const filteredEpisodes = currentStoryEpisodes.filter((e) => {
    if (!episodeSearch.trim()) return true;
    const q = episodeSearch.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.episode_number.toString().includes(q);
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
  });

  // Calculate statistics
  const totalPlays = episodes.reduce((sum, e) => sum + e.play_count, 0) + stories.reduce((sum, s) => sum + s.total_views, 0);
  const publishedStoriesCount = stories.filter((s) => s.status === 'published').length;
  const unpublishedStoriesCount = stories.filter((s) => s.status !== 'published').length;

  return (
    <div className="min-h-screen pb-28 md:pb-20 text-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ADMINISTRATOR CONTROL CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Content & Audio Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage audio series, upload episodes, monitor audience listening, and administer accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => switchUserRole('listener')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Switch to Listener View
          </button>
          <button
            onClick={resetAllData}
            className="px-3 py-2 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className={`mb-6 p-3 rounded-xl text-xs font-medium flex items-center justify-between ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/80 border border-rose-800 text-rose-300'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 mb-8 scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('dashboard')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeAdminTab === 'dashboard'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('stories')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeAdminTab === 'stories'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Story Management ({stories.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('episodes')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeAdminTab === 'episodes'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Episode Management ({episodes.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeAdminTab === 'users'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('categories')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeAdminTab === 'categories'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeAdminTab === 'settings'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>App Settings</span>
        </button>
      </div>

      {/* 1. Dashboard Tab */}
      {activeAdminTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Total Registered Users</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                {users.length}
              </p>
              <span className="text-[10px] text-emerald-400 font-medium mt-1 block">Active listeners</span>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Total Audio Stories</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                {stories.length}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                <span className="text-emerald-400">{publishedStoriesCount} Published</span>
                <span>·</span>
                <span className="text-slate-500">{unpublishedStoriesCount} Draft</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Total Episodes</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                {episodes.length}
              </p>
              <span className="text-[10px] text-purple-400 font-medium mt-1 block">Audio tracks live</span>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Audio Listening Plays</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-orange-400 font-mono tabular-nums mt-1">
                {formatViewCount(totalPlays)}
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Total streams</span>
            </div>
          </div>

          {/* Recent Registrations & Episodes Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recently registered users */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Recently Registered Users</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-xs p-2.5 bg-slate-950/60 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <img src={u.profile_image} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                      <div>
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded capitalize ${
                        u.role === 'admin' ? 'bg-purple-950 text-purple-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatDate(u.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently uploaded episodes */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Recently Uploaded Episodes</h3>
              <div className="space-y-3">
                {episodes.slice(0, 5).map((ep) => {
                  const s = stories.find((st) => st.id === ep.story_id);
                  return (
                    <div key={ep.id} className="flex items-center justify-between text-xs p-2.5 bg-slate-950/60 rounded-xl">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-semibold text-white truncate">Ep {ep.episode_number}: {ep.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{s?.title || 'Story'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-orange-400 font-semibold">{formatDuration(ep.duration)}</span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatDate(ep.release_date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. Story Management Tab */}
      {activeAdminTab === 'stories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stories by title or author..."
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleOpenAddStory}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Story</span>
            </button>
          </div>

          {/* Stories Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Story</th>
                    <th className="py-3 px-4">Genre / Language</th>
                    <th className="py-3 px-4">Author & Voice</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Access</th>
                    <th className="py-3 px-4">Plays</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStories.map((story) => {
                    const cat = categories.find((c) => c.id === story.category_id);
                    return (
                      <tr key={story.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={story.cover_image_url} alt={story.title} className="w-9 h-12 rounded object-cover shrink-0" />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-white truncate">{story.title}</p>
                              <p className="text-[11px] text-slate-500 truncate">{story.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-orange-400 font-medium">{cat?.name || 'Genre'}</span>
                          <span className="text-slate-500 block text-[11px]">{story.language}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-slate-200">{story.author}</span>
                          <span className="text-slate-500 block text-[11px]">{story.narrator}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            story.status === 'published' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {story.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            story.access_type === 'premium' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {story.access_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                          {formatViewCount(story.total_views)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => navigateToStory(story.id)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                              title="Preview as user"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditStory(story)}
                              className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg"
                              title="Edit Story"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setStoryToDelete(story)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg"
                              title="Delete Story"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Episode Management Tab */}
      {activeAdminTab === 'episodes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            
            {/* Story Picker Dropdown */}
            <div className="flex-1 max-w-md">
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Select Audio Story to Manage Episodes:
              </label>
              <select
                value={selectedStoryForEpisodes}
                onChange={(e) => setSelectedStoryForEpisodes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
              >
                {stories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({episodes.filter((e) => e.story_id === s.id).length} eps)
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Bulk Generate</span>
              </button>

              <button
                onClick={handleOpenAddEpisode}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Episode</span>
              </button>
            </div>

          </div>

          {/* Episodes List Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Episode Title</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Access</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Plays</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {currentStoryEpisodes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        No episodes added to this story yet. Click "Add Episode" above.
                      </td>
                    </tr>
                  ) : (
                    currentStoryEpisodes.map((ep) => {
                      const parent = stories.find((s) => s.id === ep.story_id);
                      return (
                        <tr key={ep.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-orange-400">
                            {ep.episode_number}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-white truncate max-w-xs">{ep.title}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-sm">{ep.description}</p>
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                            {formatDuration(ep.duration)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              ep.access_type === 'premium' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {ep.access_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              ep.status === 'published' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {ep.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                            {formatViewCount(ep.play_count)}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {parent && (
                                <button
                                  onClick={() => playEpisode(parent, ep)}
                                  className="p-1.5 text-orange-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                  title="Test Play Audio"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEditEpisode(ep)}
                                className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg"
                                title="Edit Episode"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEpisodeToDelete(ep)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg"
                                title="Delete Episode"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. User Accounts Tab */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users by name, email, or user ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={u.profile_image} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        u.role === 'admin' ? 'bg-purple-950 text-purple-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        u.status === 'active' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newRole = u.role === 'admin' ? 'listener' : 'admin';
                            setUserRole(u.id, newRole);
                            notify(`Set ${u.name}'s role to ${newRole}`);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold"
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => {
                            toggleUserStatus(u.id);
                            notify(`Toggled account status for ${u.name}`);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                            u.status === 'active' 
                              ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300' 
                              : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Categories Tab */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Genre & Category Structure</h3>
            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Order: #{cat.display_order}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{cat.description}</p>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1.5 text-purple-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      deleteCategory(cat.id);
                      notify(`Deleted category ${cat.name}`);
                    }}
                    className="p-1.5 text-rose-400 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. App Settings Tab */}
      {activeAdminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 max-w-2xl space-y-5">
          <h3 className="text-base font-bold text-white mb-4">Application & Streaming Settings</h3>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Application Name</label>
            <input
              type="text"
              value={settingsForm.app_name}
              onChange={(e) => setSettingsForm({ ...settingsForm, app_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Brand Tagline</label>
            <input
              type="text"
              value={settingsForm.tagline}
              onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Max Audio Upload Size (MB)</label>
            <input
              type="number"
              value={settingsForm.audio_upload_limit_mb}
              onChange={(e) => setSettingsForm({ ...settingsForm, audio_upload_limit_mb: parseInt(e.target.value) || 50 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="maint"
              checked={settingsForm.maintenance_mode}
              onChange={(e) => setSettingsForm({ ...settingsForm, maintenance_mode: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-700"
            />
            <label htmlFor="maint" className="text-xs text-slate-300 cursor-pointer">
              Enable Maintenance Mode (Restricts new listener streaming)
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Terms of Service</label>
            <textarea
              rows={3}
              value={settingsForm.terms_of_service}
              onChange={(e) => setSettingsForm({ ...settingsForm, terms_of_service: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Privacy Policy</label>
            <textarea
              rows={3}
              value={settingsForm.privacy_policy}
              onChange={(e) => setSettingsForm({ ...settingsForm, privacy_policy: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save App Settings</span>
          </button>

          {/* Source Code Export Card */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Full App Source Code Export (.ZIP)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Download the complete codebase with all components, media assets, and local run instructions.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  View Setup Guide
                </button>
                <a
                  href="/dk-fm-audio-app-source.zip"
                  download="dk-fm-audio-app-source.zip"
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download ZIP</span>
                </a>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Story Create / Edit Modal */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full my-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingStory ? 'Edit Story Details' : 'Create New Audio Story'}
              </h3>
              <button onClick={() => setIsStoryModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Story Title</label>
                <input
                  type="text"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  placeholder="e.g. Chronicles of the Void Blade"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Short Description</label>
                <input
                  type="text"
                  value={storyForm.short_description}
                  onChange={(e) => setStoryForm({ ...storyForm, short_description: e.target.value })}
                  placeholder="One sentence hook for listings..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Full Story Synopsis</label>
                <textarea
                  rows={3}
                  value={storyForm.synopsis}
                  onChange={(e) => setStoryForm({ ...storyForm, synopsis: e.target.value })}
                  placeholder="Comprehensive narrative overview..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Author Name</label>
                  <input
                    type="text"
                    value={storyForm.author}
                    onChange={(e) => setStoryForm({ ...storyForm, author: e.target.value })}
                    placeholder="Author name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Narrator Name</label>
                  <input
                    type="text"
                    value={storyForm.narrator}
                    onChange={(e) => setStoryForm({ ...storyForm, narrator: e.target.value })}
                    placeholder="Voice artist"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Genre / Category</label>
                  <select
                    value={storyForm.category_id}
                    onChange={(e) => setStoryForm({ ...storyForm, category_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Language</label>
                  <select
                    value={storyForm.language}
                    onChange={(e) => setStoryForm({ ...storyForm, language: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Access Type</label>
                  <select
                    value={storyForm.access_type}
                    onChange={(e) => setStoryForm({ ...storyForm, access_type: e.target.value as AccessType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="free">Free</option>
                    <option value="premium">VIP Premium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Cover Image Source (Path / URL)</label>
                <input
                  type="text"
                  value={storyForm.cover_image_url}
                  onChange={(e) => setStoryForm({ ...storyForm, cover_image_url: e.target.value })}
                  placeholder="/src/assets/images/... or https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
                {/* Preset image suggestions */}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setStoryForm({ ...storyForm, cover_image_url: '/src/assets/images/story_billionaire_secret_1792061350911.jpg' })}
                    className="text-[10px] text-purple-400 bg-slate-800 px-2 py-0.5 rounded hover:text-white"
                  >
                    Romance Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryForm({ ...storyForm, cover_image_url: '/src/assets/images/story_shadow_monarch_1792061351672.jpg' })}
                    className="text-[10px] text-purple-400 bg-slate-800 px-2 py-0.5 rounded hover:text-white"
                  >
                    Fantasy Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryForm({ ...storyForm, cover_image_url: '/src/assets/images/story_midnight_detective_1792061351083.jpg' })}
                    className="text-[10px] text-purple-400 bg-slate-800 px-2 py-0.5 rounded hover:text-white"
                  >
                    Noir Mystery Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryForm({ ...storyForm, cover_image_url: '/src/assets/images/story_whispers_in_hollow_1792061351596.jpg' })}
                    className="text-[10px] text-purple-400 bg-slate-800 px-2 py-0.5 rounded hover:text-white"
                  >
                    Horror Preset
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storyForm.is_featured}
                    onChange={(e) => setStoryForm({ ...storyForm, is_featured: e.target.checked })}
                    className="rounded text-purple-600 bg-slate-950"
                  />
                  <span>Feature on Hero Banner</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storyForm.is_trending}
                    onChange={(e) => setStoryForm({ ...storyForm, is_trending: e.target.checked })}
                    className="rounded text-purple-600 bg-slate-950"
                  />
                  <span>Mark as Trending</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
                >
                  {editingStory ? 'Save Changes' : 'Create Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Episode Create / Edit Modal */}
      {isEpisodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full my-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingEpisode ? `Edit Episode ${episodeForm.episode_number}` : 'Upload & Add New Episode'}
              </h3>
              <button onClick={() => setIsEpisodeModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEpisode} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="font-semibold text-slate-300 block mb-1">Ep Number</label>
                  <input
                    type="number"
                    min={1}
                    value={episodeForm.episode_number}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="font-semibold text-slate-300 block mb-1">Episode Title</label>
                  <input
                    type="text"
                    value={episodeForm.title}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                    placeholder="e.g. The King's Messenger"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  value={episodeForm.description}
                  onChange={(e) => setEpisodeForm({ ...episodeForm, description: e.target.value })}
                  placeholder="Summary of events in this episode..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Audio Streaming Source URL / MP3</label>
                <input
                  type="text"
                  value={episodeForm.audio_url}
                  onChange={(e) => setEpisodeForm({ ...episodeForm, audio_url: e.target.value })}
                  placeholder="https://... audio file link"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Duration (Seconds)</label>
                  <input
                    type="number"
                    value={episodeForm.duration}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, duration: parseInt(e.target.value) || 300 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Access Level</label>
                  <select
                    value={episodeForm.access_type}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, access_type: e.target.value as AccessType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="free">Free</option>
                    <option value="premium">VIP Premium</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Publish Status</label>
                  <select
                    value={episodeForm.status}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, status: e.target.value as EpisodeStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Narration Script (For Voice Synthesizer & Accessibility)
                </label>
                <textarea
                  rows={3}
                  value={episodeForm.narration_text}
                  onChange={(e) => setEpisodeForm({ ...episodeForm, narration_text: e.target.value })}
                  placeholder="Dialogue and narration read by the audio engine..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEpisodeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
                >
                  {editingEpisode ? 'Save Episode' : 'Upload Episode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Episodes Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Bulk Generate & Upload Episodes</h3>
            <p className="text-xs text-slate-400">
              Automatically create multiple sequential episodes with populated audio streams and narrative text for testing.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Number of Episodes</label>
              <select
                value={bulkCount}
                onChange={(e) => setBulkCount(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value={3}>3 Episodes</option>
                <option value={5}>5 Episodes</option>
                <option value={10}>10 Episodes</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAdd}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
              >
                Generate & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Story Confirmation Modal */}
      {storyToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Delete "{storyToDelete.title}"?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This action cannot be undone. All associated episodes, reviews, and listening progress for this story will be permanently removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStoryToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStory}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Delete Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Episode Confirmation Modal */}
      {episodeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Delete Episode {episodeToDelete.episode_number}?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove "{episodeToDelete.title}"?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEpisodeToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteEpisode}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Delete Episode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Sci-Fi & Cyberpunk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Category description..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Display Order</label>
                <input
                  type="number"
                  value={categoryForm.display_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
