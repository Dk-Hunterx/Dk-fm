import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import { Home, Compass, Bookmark, User, ShieldCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  interface TabItem {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
  }

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'discover', label: 'Discover', icon: <Compass className="w-5 h-5" /> },
    { id: 'library', label: 'Library', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    ...(isAdmin ? [{ id: 'admin' as NavTab, label: 'Admin', icon: <ShieldCheck className="w-5 h-5" /> }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0f1d]/95 backdrop-blur-lg border-t border-slate-800/80 pb-safe">
      <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} items-center h-16`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center min-h-[48px] w-full transition-colors select-none ${
                isActive 
                  ? tab.id === 'admin' ? 'text-purple-400' : 'text-orange-500' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`relative p-1 rounded-full ${isActive ? 'scale-110' : ''} transition-transform`}>
                {tab.icon}
                {isActive && (
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${tab.id === 'admin' ? 'bg-purple-500' : 'bg-orange-500'}`} />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
