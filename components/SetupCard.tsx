
import React from 'react';
import { Setup } from '../types';
import { IconTarget, IconShield, IconArrowRight, IconAlert } from './Icons';
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
  const isAggressive = setup.risk_profile === 'aggressive';
  
  const accentColor = isBuy ? 'text-emerald-400' : 'text-rose-400';
  const borderColor = isBuy ? 'border-emerald-500/20' : 'border-rose-500/20';
  const bgGradient = isBuy ? 'from-emerald-950/20' : 'from-rose-950/20';

  return (
    <div className={`border ${borderColor} bg-gradient-to-b ${bgGradient} to-institutional-card rounded-lg p-5 flex flex-col h-full relative overflow-hidden group shadow-xl`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[10px] font-mono text-institutional-muted uppercase tracking-wider">{title}</h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${
                isAggressive 
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' 
                : 'border-blue-500/30 bg-blue-500/10 text-blue-500'
            }`}>
                {isAggressive ? t.risk_aggressive : t.risk_conservative}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-bold ${accentColor}`}>{setup.type.toUpperCase()}</span>
            <span className="text-xs bg-institutional-border px-1.5 py-0.5 rounded text-institutional-muted font-mono">
              {setup.reliability}% {t.prob}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 font-mono text-sm flex-grow">
        <div className="flex items-center justify-between p-2 bg-institutional-bg/50 rounded border border-institutional-border group-hover:border-institutional-accent/30 transition-colors">
          <span className="text-institutional-muted">{t.entry}</span>
          <span className="font-bold text-white tracking-tight">{setup.entry}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-institutional-bg/30 rounded border border-institutional-border/50 text-center">
                 <span className="block text-[9px] text-institutional-muted mb-1 uppercase tracking-tighter">Target 1</span>
                 <span className={`block font-bold ${accentColor}`}>{setup.tp1}</span>
            </div>
             <div className="p-2 bg-institutional-bg/30 rounded border border-institutional-border/50 text-center">
                 <span className="block text-[9px] text-institutional-muted mb-1 uppercase tracking-tighter">Target 2</span>
                 <span className={`block font-bold ${accentColor}`}>{setup.tp2}</span>
            </div>
             <div className="p-2 bg-institutional-bg/30 rounded border border-institutional-border/50 text-center">
                 <span className="block text-[9px] text-institutional-muted mb-1 uppercase tracking-tighter">Target 3</span>
                 <span className={`block font-bold ${accentColor}`}>{setup.tp3}</span>
            </div>
        </div>

        <div className="flex items-center justify-between text-xs p-2 bg-rose-500/5 border border-rose-500/10 rounded">
          <div className="flex items-center space-x-2 text-rose-400">
             <IconShield size={14} />
             <span className="font-bold">STOP LOSS</span>
          </div>
          <span className="font-bold text-white">{setup.stop_loss}</span>
        </div>
        
        <div className="pt-3 border-t border-institutional-border/50">
          <p className="text-[11px] text-institutional-muted leading-relaxed font-sans italic">
            <span className="text-institutional-accent font-mono font-bold mr-1">{'>'}</span>
            {setup.logic}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupCard;
