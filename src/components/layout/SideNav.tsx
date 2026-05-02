/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Compass, Heart, History, Search, LogOut, User, Tv, Flame, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useWatchlist } from '../../context/WatchlistContext';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Movies', path: '/browse' },
  { icon: Tv, label: 'TV Shows', path: '/tv-shows' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Heart, label: 'Watchlist', path: '/watchlist' },
  { icon: History, label: 'History', path: '/history' },
  { icon: BarChart3, label: 'Analytics', path: '/stats' },
];

export default function SideNav({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { user, signIn, logout } = useAuth();

  return (
    <nav className={cn(
      "fixed left-0 top-0 h-screen w-64 bg-nav-bg border-r border-white/5 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-in-out",
      "md:translate-x-0", // Always visible on desktop
      isOpen ? "translate-x-0" : "-translate-x-full" // Toggle on mobile
    )}>
      {/* Logo */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-white">
            Cine<span className="text-brand-primary">Pulse</span>
          </h1>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-brand-primary" />
                )}
                <item.icon className={cn('w-5 h-5 transition-transform group-hover:scale-110', isActive ? 'text-brand-primary' : '')} />
                <span className="font-medium text-sm">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* API Status */}
        <div className="px-4 py-4 rounded-2xl bg-white/3 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-bold text-green-500 uppercase tracking-wide">Live</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Real-time TMDB & VidSrc streams active.
          </p>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center ring-2 ring-brand-primary/30">
                <User className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-sm font-medium truncate text-white">{user.displayName || 'User'}</span>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="w-full bg-brand-primary hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg shadow-brand-primary/20"
          >
            <User className="w-5 h-5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
