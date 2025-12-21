import React from 'react';
import { HistoryItem } from '../types';
import { IconTrendingUp, IconTrendingDown, IconNeutral, IconArrowRight } from './Icons';
import { Language, translations } from '../i18n';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  lang: Language;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, lang }) => {
  const t = translations[lang];

  if (history.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-institutional-border rounded-lg bg-institutional-card/30">
        <p className="text-sm text-institutional-muted font-mono">{t.no_history}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {history.map((item) => {
        const isBuy = item.data.market_bias.direction === 'BUY';
        const isSell = item.data.market_bias.direction === 'SELL';
        const BiasIcon = isBuy ? IconTrendingUp : isSell ? IconTrendingDown : IconNeutral;
        const accentColor = isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-amber-400';
        const date = new Date(item.timestamp).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex items-center justify-between p-4 bg-institutional-card border border-institutional-border hover:border-institutional-accent/50 rounded-lg cursor-pointer transition-all hover:bg-institutional-bg/80 group"
          >
            <div className="flex items-center space-x-4">
               <div className={`w-10 h-10 rounded flex items-center justify-center bg-institutional-bg border border-institutional-border ${accentColor}`}>
                   <BiasIcon size={20} />
               </div>
               <div>
                   <div className="flex items-center space-x-2">
                       <span className="font-bold text-white text-sm">{item.data.asset_class}</span>
                       <span className="text-[10px] bg-institutional-border px-1.5 rounded text-institutional-muted font-mono">{date}</span>
                   </div>
                   <div className="flex items-center space-x-2 mt-1">
                       <span className={`text-xs font-bold ${accentColor}`}>{item.data.market_bias.direction}</span>
                       <span className="text-xs text-institutional-muted"> {item.data.market_bias.confidence}% {t.confidence}</span>
                   </div>
               </div>
            </div>
            
            <button className="text-institutional-muted group-hover:text-institutional-accent transition-colors">
                <IconArrowRight size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryList;
