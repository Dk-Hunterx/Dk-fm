import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Story,
  Episode,
  Category,
  Review,
  AppSettings,
  UserStoryRelation,
  ListeningProgress,
  NavTab
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STORIES,
  INITIAL_EPISODES,
  INITIAL_CATEGORIES,
  INITIAL_REVIEWS,
  INITIAL_PROGRESS,
  INITIAL_RELATIONS,
  INITIAL_SETTINGS
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  stories: Story[];
  episodes: Episode[];
  categories: Category[];
  reviews: Review[];
  progressList: ListeningProgress[];
  relations: UserStoryRelation[];
  settings: AppSettings;
  activeTab: NavTab;
  selectedStoryId: string | null;
  searchQuery: string;
  selectedCategoryId: string | null;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  exportModalOpen: boolean;
  
  // Navigation & UI
  setActiveTab: (tab: NavTab) => void;
  navigateToStory: (storyId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategoryId: (catId: string | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;
  setExportModalOpen: (open: boolean) => void;

  // Auth actions
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUserRole: (role: 'admin' | 'listener') => void;
  updateUserProfile: (data: Partial<User>) => void;
  toggleUserStatus: (userId: string) => void;
  setUserRole: (userId: string, role: 'admin' | 'listener') => void;

  // Story CRUD
  createStory: (story: Omit<Story, 'id' | 'created_at' | 'total_views' | 'rating' | 'review_count'>) => Story;
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => void;
  incrementStoryViews: (storyId: string) => void;

  // Episode CRUD
  createEpisode: (episode: Omit<Episode, 'id' | 'play_count'>) => Episode;
  updateEpisode: (id: string, updates: Partial<Episode>) => void;
  deleteEpisode: (id: string) => void;
  bulkAddEpisodes: (newEpisodes: Omit<Episode, 'id' | 'play_count'>[]) => void;
  incrementEpisodePlays: (episodeId: string) => void;

  // Category CRUD
  createCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Reviews
  addReview: (storyId: string, rating: number, comment: string) => void;

  // User Library Relations
  toggleFavorite: (storyId: string) => void;
  toggleFollow: (storyId: string) => void;
  isFavorite: (storyId: string) => boolean;
  isFollowed: (storyId: string) => boolean;

  // Listening Progress
  saveProgress: (storyId: string, episodeId: string, position: number, duration: number, completed?: boolean) => void;
  getProgress: (episodeId: string) => ListeningProgress | undefined;
  getStoryProgress: (storyId: string) => ListeningProgress | undefined;
  removeStoryFromLibrary: (storyId: string) => void;

  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'dkfm_current_user_v2',
  USERS: 'dkfm_users_v2',
  STORIES: 'dkfm_stories_v2',
  EPISODES: 'dkfm_episodes_v2',
  CATEGORIES: 'dkfm_categories_v2',
  REVIEWS: 'dkfm_reviews_v2',
  PROGRESS: 'dkfm_progress_v2',
  RELATIONS: 'dkfm_relations_v2',
  SETTINGS: 'dkfm_settings_v2',
};

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = getStoredItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (stored) return stored;
    // Default to admin user for convenient testing of both listener and admin sides
    return INITIAL_USERS[0];
  });
  const [stories, setStories] = useState<Story[]>(() => getStoredItem(STORAGE_KEYS.STORIES, INITIAL_STORIES));
  const [episodes, setEpisodes] = useState<Episode[]>(() => getStoredItem(STORAGE_KEYS.EPISODES, INITIAL_EPISODES));
  const [categories, setCategories] = useState<Category[]>(() => getStoredItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
  const [reviews, setReviews] = useState<Review[]>(() => getStoredItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS));
  const [progressList, setProgressList] = useState<ListeningProgress[]>(() => getStoredItem(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS));
  const [relations, setRelations] = useState<UserStoryRelation[]>(() => getStoredItem(STORAGE_KEYS.RELATIONS, INITIAL_RELATIONS));
  const [settings, setSettings] = useState<AppSettings>(() => getStoredItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EPISODES, JSON.stringify(episodes));
  }, [episodes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressList));
  }, [progressList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RELATIONS, JSON.stringify(relations));
  }, [relations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const navigateToStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    setActiveTab('story-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = async (email: string, _password?: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      return { success: false, message: 'Account not found. Please register or check email.' };
    }
    if (found.status === 'suspended') {
      return { success: false, message: 'Your account has been suspended by an administrator.' };
    }
    setCurrentUser(found);
    setAuthModalOpen(false);
    return { success: true };
  };

  const register = async (name: string, email: string, _password?: string) => {
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'listener',
      profile_image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=8b5cf6`,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setAuthModalOpen(false);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUserRole = (role: 'admin' | 'listener') => {
    if (role === 'admin') {
      const adminUser = users.find(u => u.role === 'admin') || INITIAL_USERS[0];
      setCurrentUser(adminUser);
    } else {
      const listenerUser = users.find(u => u.role === 'listener') || INITIAL_USERS[1];
      setCurrentUser(listenerUser);
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const setUserRole = (userId: string, role: 'admin' | 'listener') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role };
      }
      return u;
    }));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role } : null);
    }
  };

  const createStory = (storyData: Omit<Story, 'id' | 'created_at' | 'total_views' | 'rating' | 'review_count'>): Story => {
    const newStory: Story = {
      ...storyData,
      id: `story-${Date.now()}`,
      created_at: new Date().toISOString(),
      total_views: 0,
      rating: 5.0,
      review_count: 0
    };
    setStories(prev => [newStory, ...prev]);
    return newStory;
  };

  const updateStory = (id: string, updates: Partial<Story>) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStory = (id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
    setEpisodes(prev => prev.filter(e => e.story_id !== id));
    setReviews(prev => prev.filter(r => r.story_id !== id));
    setRelations(prev => prev.filter(rel => rel.story_id !== id));
    if (selectedStoryId === id) {
      setSelectedStoryId(null);
      setActiveTab('home');
    }
  };

  const incrementStoryViews = (storyId: string) => {
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, total_views: s.total_views + 1 } : s));
  };

  const createEpisode = (epData: Omit<Episode, 'id' | 'play_count'>): Episode => {
    const newEp: Episode = {
      ...epData,
      id: `ep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      play_count: 0
    };
    setEpisodes(prev => [...prev, newEp]);
    return newEp;
  };

  const updateEpisode = (id: string, updates: Partial<Episode>) => {
    setEpisodes(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEpisode = (id: string) => {
    setEpisodes(prev => prev.filter(e => e.id !== id));
    setProgressList(prev => prev.filter(p => p.episode_id !== id));
  };

  const bulkAddEpisodes = (newEpisodes: Omit<Episode, 'id' | 'play_count'>[]) => {
    const created: Episode[] = newEpisodes.map((ep, idx) => ({
      ...ep,
      id: `ep-bulk-${Date.now()}-${idx}`,
      play_count: 0
    }));
    setEpisodes(prev => [...prev, ...created]);
  };

  const incrementEpisodePlays = (episodeId: string) => {
    setEpisodes(prev => prev.map(e => e.id === episodeId ? { ...e, play_count: e.play_count + 1 } : e));
  };

  const createCategory = (catData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addReview = (storyId: string, rating: number, comment: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_avatar: currentUser.profile_image,
      story_id: storyId,
      rating,
      comment: comment.trim(),
      created_at: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);

    // Recalculate average rating
    const storyReviews = [...reviews.filter(r => r.story_id === storyId), newReview];
    const avg = storyReviews.reduce((sum, r) => sum + r.rating, 0) / storyReviews.length;
    updateStory(storyId, {
      rating: Math.round(avg * 10) / 10,
      review_count: storyReviews.length
    });
  };

  const toggleFavorite = (storyId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setRelations(prev => {
      const existing = prev.find(r => r.user_id === currentUser.id && r.story_id === storyId);
      if (existing) {
        return prev.map(r => r.id === existing.id ? { ...r, is_favorite: !r.is_favorite } : r);
      } else {
        const newRel: UserStoryRelation = {
          id: `rel-${Date.now()}`,
          user_id: currentUser.id,
          story_id: storyId,
          is_favorite: true,
          is_followed: false,
          created_at: new Date().toISOString()
        };
        return [...prev, newRel];
      }
    });
  };

  const toggleFollow = (storyId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setRelations(prev => {
      const existing = prev.find(r => r.user_id === currentUser.id && r.story_id === storyId);
      if (existing) {
        return prev.map(r => r.id === existing.id ? { ...r, is_followed: !r.is_followed } : r);
      } else {
        const newRel: UserStoryRelation = {
          id: `rel-${Date.now()}`,
          user_id: currentUser.id,
          story_id: storyId,
          is_favorite: false,
          is_followed: true,
          created_at: new Date().toISOString()
        };
        return [...prev, newRel];
      }
    });
  };

  const isFavorite = (storyId: string): boolean => {
    if (!currentUser) return false;
    const rel = relations.find(r => r.user_id === currentUser.id && r.story_id === storyId);
    return !!rel?.is_favorite;
  };

  const isFollowed = (storyId: string): boolean => {
    if (!currentUser) return false;
    const rel = relations.find(r => r.user_id === currentUser.id && r.story_id === storyId);
    return !!rel?.is_followed;
  };

  const saveProgress = (storyId: string, episodeId: string, position: number, duration: number, completed = false) => {
    if (!currentUser) return;
    setProgressList(prev => {
      const index = prev.findIndex(p => p.user_id === currentUser.id && p.episode_id === episodeId);
      const isDone = completed || (duration > 0 && position >= duration - 5);
      const item: ListeningProgress = {
        id: index >= 0 ? prev[index].id : `prog-${Date.now()}`,
        user_id: currentUser.id,
        story_id: storyId,
        episode_id: episodeId,
        current_position: Math.round(position),
        duration: Math.round(duration),
        completed: isDone,
        updated_at: new Date().toISOString()
      };
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = item;
        return copy;
      }
      return [item, ...prev];
    });
  };

  const getProgress = (episodeId: string): ListeningProgress | undefined => {
    if (!currentUser) return undefined;
    return progressList.find(p => p.user_id === currentUser.id && p.episode_id === episodeId);
  };

  const getStoryProgress = (storyId: string): ListeningProgress | undefined => {
    if (!currentUser) return undefined;
    const userStoryProgress = progressList
      .filter(p => p.user_id === currentUser.id && p.story_id === storyId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return userStoryProgress[0];
  };

  const removeStoryFromLibrary = (storyId: string) => {
    if (!currentUser) return;
    setRelations(prev => prev.filter(r => !(r.user_id === currentUser.id && r.story_id === storyId)));
    setProgressList(prev => prev.filter(p => !(p.user_id === currentUser.id && p.story_id === storyId)));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setStories(INITIAL_STORIES);
    setEpisodes(INITIAL_EPISODES);
    setCategories(INITIAL_CATEGORIES);
    setReviews(INITIAL_REVIEWS);
    setProgressList(INITIAL_PROGRESS);
    setRelations(INITIAL_RELATIONS);
    setSettings(INITIAL_SETTINGS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        stories,
        episodes,
        categories,
        reviews,
        progressList,
        relations,
        settings,
        activeTab,
        selectedStoryId,
        searchQuery,
        selectedCategoryId,
        authModalOpen,
        authModalMode,
        exportModalOpen,
        setExportModalOpen,
        setActiveTab,
        navigateToStory,
        setSearchQuery,
        setSelectedCategoryId,
        setAuthModalOpen,
        setAuthModalMode,
        login,
        register,
        logout,
        switchUserRole,
        updateUserProfile,
        toggleUserStatus,
        setUserRole,
        createStory,
        updateStory,
        deleteStory,
        incrementStoryViews,
        createEpisode,
        updateEpisode,
        deleteEpisode,
        bulkAddEpisodes,
        incrementEpisodePlays,
        createCategory,
        updateCategory,
        deleteCategory,
        addReview,
        toggleFavorite,
        toggleFollow,
        isFavorite,
        isFollowed,
        saveProgress,
        getProgress,
        getStoryProgress,
        removeStoryFromLibrary,
        updateSettings,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
