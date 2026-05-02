import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SideNav from './SideNav';
import { Menu, Flame, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-brand-bg">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-nav-bg border-b border-white/5 flex items-center justify-between px-4 z-40 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight text-white">
            Cine<span className="text-brand-primary">Pulse</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white bg-white/5 rounded-lg border border-white/10"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <SideNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 md:ml-64 pt-20 pb-8 px-4 md:pt-8 md:px-8 overflow-x-hidden relative">
        {children}
      </main>
    </div>
  );
}
