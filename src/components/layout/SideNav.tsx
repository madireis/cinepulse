import { Home, Compass, Heart, History, Search, Tv, BarChart3, Flame, Github } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useWatchlist } from '../../context/WatchlistContext';

const navItems = [
  { icon: Home,     label: 'Home',      path: '/' },
  { icon: Compass,  label: 'Movies',    path: '/browse' },
  { icon: Tv,       label: 'TV Shows',  path: '/tv-shows' },
  { icon: Search,   label: 'Search',    path: '/search' },
  { icon: Heart,    label: 'Watchlist', path: '/watchlist' },
  { icon: History,  label: 'History',   path: '/history' },
  { icon: BarChart3,label: 'Analytics', path: '/stats' },
];

export default function SideNav({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { watchlist } = useWatchlist();

  return (
    <nav className={cn(
      "fixed left-0 top-0 h-screen w-64 bg-nav-bg border-r border-white/5 flex flex-col z-50 shadow-[4px_0_32px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out",
      "md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/40 ring-1 ring-brand-primary/30">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-white">
            Cine<span className="text-brand-primary">Pulse</span>
          </h1>
        </div>
        <p className="text-[11px] text-gray-600 mt-2 pl-0.5 font-medium tracking-wide">Your cinematic universe</p>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-brand-primary/12 text-white'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-brand-primary shadow-[0_0_8px_rgba(229,9,20,0.8)]" />
                )}
                <item.icon className={cn(
                  'w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-brand-primary' : ''
                )} />
                <span className="font-medium text-sm">{item.label}</span>
                {/* Watchlist badge */}
                {item.path === '/watchlist' && watchlist.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/20">
                    {watchlist.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom section */}
      <div className="p-4 space-y-3 border-t border-white/5">
        {/* Live status */}
        <div className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-60" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-green-400 uppercase tracking-widest">Live</p>
            <p className="text-[11px] text-gray-600 leading-tight">TMDB · VidSrc streams</p>
          </div>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/madireis/cinepulse"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all group"
        >
          <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">View on GitHub</span>
        </a>

        {/* Version */}
        <p className="text-center text-[10px] text-gray-700 font-mono pb-1">
          CinePulse v1.0 · Educational
        </p>
      </div>
    </nav>
  );
}
