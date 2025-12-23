
import React from 'react';
import { IconScan } from './Icons';
import { Language, translations } from '../i18n';

interface HeaderProps {
  lang: Language;
  activeView: 'vision' | 'analytics';
  onViewChange: (view: 'vision' | 'analytics') => void;
}

const Header: React.FC<HeaderProps> = ({ lang, activeView, onViewChange }) => {
  const t = translations[lang];
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-institutional-border bg-[#0a0a0c]/95 backdrop-blur-md z-[100] flex items-center shadow-lg">
      <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 bg-institutional-accent/10 rounded-lg border border-institutional-accent/20 flex items-center justify-center text-institutional-accent">
            <IconScan size={20} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[13px] sm:text-sm font-mono font-black tracking-tighter text-white leading-none">TRADEVISION</span>
            <span className="hidden sm:block text-[8px] text-institutional-muted uppercase tracking-[0.2em] font-mono mt-0.5">
              {t.header_subtitle}
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Ensuring they are always visible and clickable */}
        <nav className="flex items-center h-16 border-x border-institutional-border/30 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => onViewChange('vision')}
            className={`h-16 px-4 sm:px-8 text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.1em] sm:tracking-[0.15em] transition-all border-b-2 flex items-center shrink-0 ${
              activeView === 'vision' 
                ? 'text-institutional-accent border-institutional-accent bg-institutional-accent/5' 
                : 'text-institutional-muted border-transparent hover:text-white'
            }`}
          >
            {t.nav_vision}
          </button>
          <button 
            onClick={() => onViewChange('analytics')}
            className={`h-16 px-4 sm:px-8 text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.1em] sm:tracking-[0.15em] transition-all border-b-2 flex items-center shrink-0 ${
              activeView === 'analytics' 
                ? 'text-institutional-accent border-institutional-accent bg-institutional-accent/5' 
                : 'text-institutional-muted border-transparent hover:text-white'
            }`}
          >
            {t.nav_analytics}
          </button>
        </nav>

        {/* System Info & Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center text-[9px] font-mono text-institutional-muted uppercase tracking-widest bg-institutional-card/50 px-2 py-1 rounded border border-institutional-border">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            {t.system_online}
          </div>
          <div className="px-1.5 sm:px-2 py-1 rounded bg-institutional-card border border-institutional-border text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-tighter">
            {lang}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
