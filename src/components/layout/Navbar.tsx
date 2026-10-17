import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import { 
  Headphones, 
  Search, 
  Sparkles, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  Compass, 
  Bookmark, 
  Home, 
  X,
  UserCheck,
  Download
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery, 
    setAuthModalOpen, 
    setAuthModalMode, 
    logout,
    switchUserRole,
    setExportModalOpen
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setShowUserDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-orange-400 transition-colors whitespace-nowrap">
                DK <span className="text-orange-500">Fm</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) & Search Bar */}
        <div className="flex items-center gap-6 flex-1 max-w-2xl justify-center">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'home' ? 'text-orange-400 font-semibold border-b-2 border-orange-500' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleNavClick('discover')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'discover' ? 'text-orange-400 font-semibold border-b-2 border-orange-500' : ''
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </button>
            <button
              onClick={() => handleNavClick('library')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'library' ? 'text-orange-400 font-semibold border-b-2 border-orange-500' : ''
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>My Library</span>
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 text-purple-400 ${
                  activeTab === 'admin' ? 'text-purple-300 font-semibold border-b-2 border-purple-500' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Quick search input */}
          <div className="relative flex-1 hidden lg:block max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stories, authors, narrators..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'discover') setActiveTab('discover');
              }}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Primary Action & Profile Area */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => {
              setShowSearchInput(!showSearchInput);
              if (activeTab !== 'discover') setActiveTab('discover');
            }}
            className="p-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-800"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Export Code ZIP Button */}
          <button
            onClick={() => setExportModalOpen(true)}
            title="Download complete app source code as ZIP"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700/80 hover:border-orange-500/80 text-orange-400 hover:text-orange-300 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ZIP</span>
          </button>

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-700 focus:outline-none transition-all"
              >
                <img
                  src={currentUser.profile_image}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <span className="hidden sm:inline-block text-xs font-medium text-slate-200 max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="hidden sm:inline-flex text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800/60 px-1.5 py-0.5 rounded font-medium">
                    Admin
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Role:</span>
                      <span className={`font-semibold capitalize ${currentUser.role === 'admin' ? 'text-purple-400' : 'text-orange-400'}`}>
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Settings</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('library')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5"
                    >
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span>My Audio Library</span>
                    </button>
                    {currentUser.role === 'admin' ? (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2 text-xs text-purple-300 hover:bg-purple-950/40 flex items-center gap-2.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>Admin Dashboard</span>
                      </button>
                    ) : null}
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setExportModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-orange-300 hover:bg-orange-950/30 flex items-center gap-2.5"
                    >
                      <Download className="w-4 h-4 text-orange-400" />
                      <span>Export Source Code (.ZIP)</span>
                    </button>
                  </div>

                  {/* Switch user role demo toggle */}
                  <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/50">
                    <p className="text-[11px] text-slate-400 mb-1.5">Quick Demo Account Switch:</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => switchUserRole('admin')}
                        className={`flex-1 py-1 px-2 rounded text-[11px] font-medium transition-colors ${
                          currentUser.role === 'admin'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => switchUserRole('listener')}
                        className={`flex-1 py-1 px-2 rounded text-[11px] font-medium transition-colors ${
                          currentUser.role === 'listener'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Listener
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('register');
                  setAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-full hover:from-orange-500 hover:to-orange-400 shadow-md shadow-orange-500/20 transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar dropdown */}
      {showSearchInput && (
        <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 lg:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stories, authors, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
