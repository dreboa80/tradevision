import React from 'react';
import { Language, translations } from '../i18n';

interface LoadingScreenProps {
  lang: Language;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ lang }) => {
  const t = translations[lang];
  return (
    <div className="flex flex-col items-center justify-center h-96 w-full space-y-8 animate-in fade-in duration-500">
      <div className="relative w-24 h-24">
        {/* Spinning Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-institutional-border"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-institutional-accent animate-spin duration-1000"></div>
        <div className="absolute inset-2 rounded-full border-2 border-institutional-border"></div>
        <div className="absolute inset-2 rounded-full border-b-2 border-institutional-accent animate-spin duration-[2s] direction-reverse"></div>
        
        {/* Center Pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-institutional-accent rounded-full animate-ping"></div>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-mono font-medium text-white tracking-widest">{t.analyzing_title}</h3>
        <div className="flex flex-col space-y-1">
             <p className="text-xs font-mono text-institutional-accent/80">
            {t.analyzing_scan}
            </p>
             <p className="text-xs font-mono text-institutional-muted">
            {t.analyzing_pools}
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
