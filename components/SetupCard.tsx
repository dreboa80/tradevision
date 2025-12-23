
import React, { useState } from 'react';
import { Setup } from '../types';
import { IconTarget, IconShield, IconArrowRight, IconAlert, IconCheck } from './Icons';
import { Language, translations } from '../i18n';

interface SetupCardProps {
  title: string;
  setup: Setup;
  bias: 'BUY' | 'SELL' | 'NEUTRAL';
  lang: Language;
}

const SetupCard: React.FC<SetupCardProps> = ({ title, setup, bias, lang }) => {
  const t = translations[lang];
  const [isRevealed, setIsRevealed] = useState(setup.reliability >= 65);
  
  const isBuy = bias === 'BUY';
  const isAggressive = setup.risk_profile === 'aggressive';
  const isLowReliability = setup.reliability < 65;
  
  const accentColor = isLowReliability && !isRevealed ? 'text-amber-400' : (isBuy ? 'text-emerald-400' : 'text-rose-400');
  const borderColor = isLowReliability && !isRevealed ? 'border-amber-500/20' : (isBuy ? 'border-emerald-500/20' : 'border-rose-500/20');
  const bgGradient = isLowReliability && !isRevealed ? 'from-amber-950/10' : (isBuy ? 'from-emerald-950/20' : 'from-rose-950/20');

  return (
    <div className={`border ${borderColor} bg-gradient-to-b ${bgGradient} to-institutional-card rounded-lg p-5 flex flex-col h-full relative overflow-hidden group shadow-xl transition-all`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${isLowReliability ? 'bg-amber-500' : (isBuy ? 'bg-emerald-500' : 'bg-rose-500')}`}></div>
      
      {/* Header Info */}
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
            {isLowReliability && (
                 <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold border border-amber-500/50 bg-amber-500 text-black">
                    {t.low_prob_badge}
                 </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-bold ${accentColor}`}>{setup.type.toUpperCase()}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isLowReliability ? 'bg-amber-500/20 text-amber-400' : 'bg-institutional-border text-institutional-muted'}`}>
              {setup.reliability}% {t.prob}
            </span>
            <span className="text-[10px] font-mono bg-institutional-bg px-2 py-0.5 rounded border border-institutional-border text-institutional-muted">
                RR {setup.risk_reward}
            </span>
          </div>
        </div>
      </div>

      {/* Blurred Content for low reliability */}
      <div className={`space-y-4 font-mono text-sm flex-grow transition-all duration-500 ${isLowReliability && !isRevealed ? 'blur-md pointer-events-none select-none opacity-40' : 'blur-0 opacity-100'}`}>
        <div className="flex items-center justify-between p-2 bg-institutional-bg/50 rounded border border-institutional-border group-hover:border-institutional-accent/30 transition-colors">
          <span className="text-institutional-muted">{t.entry}</span>
          <span className="font-bold text-white tracking-tight">{setup.entry}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
            {['tp1', 'tp2', 'tp3'].map((tp, i) => (
                <div key={tp} className="p-2 bg-institutional-bg/30 rounded border border-institutional-border/50 text-center">
                    <span className="block text-[9px] text-institutional-muted mb-1 uppercase tracking-tighter">Target {i+1}</span>
                    <span className={`block font-bold ${accentColor}`}>{setup[tp as keyof Setup]}</span>
                </div>
            ))}
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

      {/* Reveal Overlay */}
      {isLowReliability && !isRevealed && (
          <div className="absolute inset-x-5 bottom-8 top-16 flex flex-col items-center justify-center text-center space-y-4 z-20">
              <div className="p-3 bg-amber-500/20 rounded-full text-amber-500">
                  <IconAlert size={24} />
              </div>
              <div>
                  <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">{t.reveal_anyway_title}</p>
                  <p className="text-[9px] text-institutional-muted max-w-[200px] mt-1">{t.reveal_anyway_desc}</p>
              </div>
              <button 
                onClick={() => setIsRevealed(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded text-[10px] font-bold tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-xl border border-black"
              >
                  {t.btn_reveal_setup}
              </button>
          </div>
      )}
    </div>
  );
};

export default SetupCard;
