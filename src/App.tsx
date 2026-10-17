import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AudioProvider } from './context/AudioContext';
import { DownloadProvider } from './context/DownloadContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { HomePage } from './components/home/HomePage';
import { DiscoverPage } from './components/discover/DiscoverPage';
import { StoryDetailPage } from './components/story/StoryDetailPage';
import { LibraryPage } from './components/library/LibraryPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullPlayerModal } from './components/player/FullPlayerModal';
import { AuthModal } from './components/auth/AuthModal';
import { ExportModal } from './components/common/ExportModal';
import { Headphones, Shield, Heart, Download } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, settings, exportModalOpen, setExportModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'discover' && <DiscoverPage />}
        {activeTab === 'story-detail' && <StoryDetailPage />}
        {activeTab === 'library' && <LibraryPage />}
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Audio Players */}
      <MiniPlayer />
      <FullPlayerModal />

      {/* Auth Modal */}
      <AuthModal />

      {/* Export Source Code Modal */}
      <ExportModal 
        isOpen={exportModalOpen} 
        onClose={() => setExportModalOpen(false)} 
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 bg-[#05080e] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-5 h-5 rounded-md bg-orange-600/30 flex items-center justify-center text-orange-400">
              <Headphones className="w-3 h-3" />
            </div>
            <span className="font-display font-bold text-white tracking-tight">{settings.app_name}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.tagline}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button 
              onClick={() => setActiveTab('home')}
              className="hover:text-slate-300 transition-colors"
            >
              Browse
            </button>
            <button 
              onClick={() => setActiveTab('discover')}
              className="hover:text-slate-300 transition-colors"
            >
              Genres
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className="hover:text-slate-300 transition-colors"
            >
              My Library
            </button>
            <button 
              onClick={() => setExportModalOpen(true)}
              className="text-orange-400 hover:text-orange-300 transition-colors font-medium flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Export Code (.ZIP)</span>
            </button>
            <span aria-hidden="true" className="text-slate-800">|</span>
            <span>© {new Date().getFullYear()} DK Fm Audio. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DownloadProvider>
        <AudioProvider>
          <MainAppContent />
        </AudioProvider>
      </DownloadProvider>
    </AppProvider>
  );
}
