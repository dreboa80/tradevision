
import React from 'react';
import { AnalysisResponse, SetupResult } from '../types';
import SetupCard from './SetupCard';
import LiquidityTable from './LiquidityTable';
import { IconTrendingUp, IconTrendingDown, IconNeutral, IconBrain, IconAlert, IconTarget, IconScan } from './Icons';
import { Language, translations } from '../i18n';

interface DashboardProps {
  data: AnalysisResponse;
  lang: Language;
  onUpdateSetupResult?: (setupKey: 'setup_A' | 'setup_B', result: SetupResult) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, lang, onUpdateSetupResult }) => {
  const t = translations[lang];
  const isBuy = data.market_bias.direction === 'BUY';
  const isSell = data.market_bias.direction === 'SELL';
  const isLowConfidence = data.market_bias.confidence < 65;
  
  const biasColor = isLowConfidence 
    ? 'text-amber-400'
    : isBuy 
      ? 'text-emerald-400' 
      : isSell 
        ? 'text-rose-400' 
        : 'text-amber-400';

  const BiasIcon = isBuy ? IconTrendingUp : isSell ? IconTrendingDown : IconNeutral;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* Safety Warning for Low Confidence */}
      {isLowConfidence && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <div className="p-2 bg-amber-500/20 rounded text-amber-500">
                  <IconAlert size={24} />
              </div>
              <div>
                  <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">{t.low_confidence_title}</h4>
                  <p className="text-xs text-amber-200/70">{t.low_confidence_desc}</p>
              </div>
          </div>
      )}

      {/* Top Bar: Asset & Bias & Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-institutional-card border border-institutional-border rounded-xl p-6 flex flex-col justify-center shadow-lg">
          <div className="text-[10px] font-mono text-institutional-muted uppercase tracking-[0.2em] mb-2">{t.asset_class}</div>
          <div className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="w-2 h-8 bg-institutional-accent rounded-full"></div>
            {data.asset_class}
          </div>
        </div>

        <div className="bg-institutional-card border border-institutional-border rounded-xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
            <BiasIcon className={`absolute -right-4 -bottom-4 opacity-5 ${biasColor}`} size={120} />
            <div className="relative z-10">
                 <div className="text-[10px] font-mono text-institutional-muted uppercase tracking-[0.2em] mb-2">{t.market_bias}</div>
                 <div className={`text-3xl font-bold ${biasColor} flex items-center gap-3`}>
                    <BiasIcon size={32} />
                    {data.market_bias.direction}
                </div>
            </div>
        </div>

        <div className="bg-institutional-card border border-institutional-border rounded-xl p-6 flex flex-col justify-center shadow-lg relative overflow-hidden">
            <div className="text-[10px] font-mono text-institutional-muted uppercase tracking-[0.2em] mb-2">{t.confidence}</div>
            <div className="flex items-end gap-2">
                <div className={`text-4xl font-mono font-bold leading-none ${isLowConfidence ? 'text-amber-400' : 'text-white'}`}>{data.market_bias.confidence}%</div>
                <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-1.5 h-4 rounded-full ${i * 20 <= data.market_bias.confidence ? (isLowConfidence ? 'bg-amber-500' : 'bg-institutional-accent') : 'bg-institutional-border'}`}></div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-2 bg-institutional-accent/10 rounded border border-institutional-accent/20">
                <IconTarget className="text-institutional-accent" size={18} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t.liquidity_map}</h2>
            <div className="h-px bg-institutional-border flex-grow"></div>
          </div>
          
          <LiquidityTable zones={data.liquidity_zones} lang={lang} />
          
            <div className="pt-4">
                 <div className="flex items-center space-x-4 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                        <IconBrain className="text-purple-400" size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{t.institutional_reading}</h2>
                    <div className="h-px bg-institutional-border flex-grow"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-institutional-card border border-institutional-border p-5 rounded-xl hover:border-institutional-accent/30 transition-colors">
                        <h4 className="text-[10px] font-mono text-institutional-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                            {t.market_intent}
                        </h4>
                        <p className="text-sm text-institutional-text leading-relaxed font-sans">{data.institutional_reading.market_intent}</p>
                    </div>
                    <div className="bg-institutional-card border border-institutional-border p-5 rounded-xl hover:border-institutional-accent/30 transition-colors">
                        <h4 className="text-[10px] font-mono text-institutional-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            {t.retail_traps}
                        </h4>
                        <p className="text-sm text-institutional-text leading-relaxed font-sans">{data.institutional_reading.retail_traps}</p>
                    </div>
                     <div className="bg-institutional-card border border-institutional-border p-5 rounded-xl hover:border-institutional-accent/30 transition-colors">
                        <h4 className="text-[10px] font-mono text-institutional-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {t.objective}
                        </h4>
                        <p className="text-sm text-institutional-text leading-relaxed font-sans">{data.institutional_reading.liquidity_objective}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6">
           <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-5 text-rose-400">
                    <IconAlert size={20} />
                    <h3 className="font-bold text-sm uppercase tracking-[0.15em]">{t.invalidation_rules}</h3>
                </div>
                <div className="space-y-6 text-sm font-mono">
                    <div className="relative pl-4 border-l border-rose-900/50">
                        <span className="text-rose-400/70 block mb-2 text-[10px] uppercase tracking-widest">{t.bias_invalidation}</span>
                        <p className="text-institutional-text/90 leading-relaxed italic">"{data.invalidation_rules.bias_invalidation}"</p>
                    </div>
                     <div className="relative pl-4 border-l border-rose-900/50">
                        <span className="text-rose-400/70 block mb-2 text-[10px] uppercase tracking-widest">{t.setup_invalidation}</span>
                        <p className="text-institutional-text/90 leading-relaxed italic">"{data.invalidation_rules.setup_invalidation}"</p>
                    </div>
                </div>
           </div>

           {data.limitations && data.limitations.length > 0 && (
               <div className="border border-institutional-border bg-institutional-bg/50 p-5 rounded-xl">
                    <h4 className="text-[10px] font-mono text-institutional-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                        <IconScan size={14} />
                        {t.limitations}
                    </h4>
                    <ul className="space-y-2">
                        {data.limitations.map((limit, i) => (
                            <li key={i} className="text-[11px] text-institutional-muted flex items-start gap-2">
                                <span className="text-institutional-accent mt-0.5">•</span>
                                {limit}
                            </li>
                        ))}
                    </ul>
               </div>
           )}
        </div>
      </div>

      <div className="space-y-6 pt-8">
        <div className="flex items-center space-x-4 mb-6">
            <div className="p-2 bg-institutional-accent/10 rounded border border-institutional-accent/20">
                <IconScan className="text-institutional-accent" size={18} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t.execution_setups}</h2>
            <div className="h-px bg-institutional-border flex-grow"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SetupCard 
                title={t.setup_primary} 
                setup={data.setups.setup_A} 
                bias={data.market_bias.direction} 
                lang={lang}
                onUpdateResult={(res) => onUpdateSetupResult?.('setup_A', res)}
            />
            <SetupCard 
                title={t.setup_confirmation} 
                setup={data.setups.setup_B} 
                bias={data.market_bias.direction}
                lang={lang} 
                onUpdateResult={(res) => onUpdateSetupResult?.('setup_B', res)}
            />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
