import React from 'react';
import { IconScan } from './Icons';
import { Language, translations } from '../i18n';

interface HeaderProps {
  lang: Language;
}

const Header: React.FC<HeaderProps> = ({ lang }) => {
  const t = translations[lang];
  return (
    <header className="border-b border-institutional-border bg-institutional-bg/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-institutional-accent/10 rounded border border-institutional-accent/20 flex items-center justify-center text-institutional-accent">
            <IconScan size={18} />
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold tracking-tight text-white">TradeVision</h1>
            <p className="text-[10px] text-institutional-muted uppercase tracking-wider font-mono">{t.header_subtitle}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-xs font-mono text-institutional-muted">
          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>{t.system_online}</span>
          <span className="uppercase">{lang} DETECTED</span>
        </div>
      </div>
    </header>
  );
};

export default Header;