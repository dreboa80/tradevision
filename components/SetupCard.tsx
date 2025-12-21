import React from 'react';
import { Setup } from '../types';
import { IconTarget, IconShield, IconArrowRight } from './Icons';
import { Language, translations } from '../i18n';

interface SetupCardProps {
  title: string;
  setup: Setup;
  bias: 'BUY' | 'SELL' | 'NEUTRAL';
  lang: Language;
}

const SetupCard: React.FC<SetupCardProps> = ({ title, setup, bias, lang }) => {
  const t = translations[lang];
  const isBuy = bias === 'BUY';
  const accentColor = isBuy ? 'text-emerald-400' : 'text-rose-400';
  const borderColor = isBuy ? 'border-emerald-500/20' : 'border-rose-500/20';
  const bgGradient = isBuy ? 'from-emerald-950/20' : 'from-rose-950/20';

  return (
    <div className={`border ${borderColor} bg-gradient-to-b ${bgGradient} to-institutional-card rounded-lg p-5 flex flex-col h-full relative overflow-hidden group`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-mono text-institutional-muted uppercase tracking-wider mb-1">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-bold ${accentColor}`}>{setup.type.toUpperCase()}</span>
            <span className="text-xs bg-institutional-border px-1.5 py-0.5 rounded text-institutional-muted font-mono">
              {setup.reliability}% {t.prob}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 font-mono text-sm flex-grow">
        <div className="flex items-center justify-between p-2 bg-institutional-bg/50 rounded border border-institutional-border">
          <span className="text-institutional-muted">{t.entry}</span>
          <span className="font-bold text-white">{setup.entry}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-institutional-bg/30 rounded border border-institutional-border/50">
                 <span className="block text-[10px] text-institutional-muted mb-1">TP1</span>
                 <span className={`block font-bold ${accentColor}`}>{setup.tp1}</span>
            </div>
             <div className="p-2 bg-institutional-bg/30 rounded border border-institutional-border/50">
                 <span className="block text-[10px] text-institutional-muted mb-1">TP2</span>
                 <span className={`block font-bold ${accentColor}`}>{setup.tp2}</span>
            </div>
             <div className="p-2 bg-institutional-bg/30 rounded border border-institutional-border/50">
                 <span className="block text-[10px] text-institutional-muted mb-1">TP3</span>
                 <span className={`block font-bold ${accentColor}`}>{setup.tp3}</span>
            </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-rose-300">
          <IconShield size={14} />
          <span>SL: <span className="font-bold text-white">{setup.stop_loss}</span></span>
        </div>
        
        <div className="pt-3 border-t border-institutional-border/50">
          <p className="text-xs text-institutional-muted leading-relaxed font-sans">
            <span className="text-white font-mono mr-1">{'>'}</span>
            {setup.logic}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupCard;
