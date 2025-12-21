import React from 'react';
import { AnalysisResponse } from '../types';
import SetupCard from './SetupCard';
import LiquidityTable from './LiquidityTable';
import { IconTrendingUp, IconTrendingDown, IconNeutral, IconBrain, IconAlert } from './Icons';
import { Language, translations } from '../i18n';

interface DashboardProps {
  data: AnalysisResponse;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ data, lang }) => {
  const t = translations[lang];
  const isBuy = data.market_bias.direction === 'BUY';
  const isSell = data.market_bias.direction === 'SELL';
  
  const biasColor = isBuy 
    ? 'text-emerald-400' 
    : isSell 
      ? 'text-rose-400' 
      : 'text-amber-400';

  const BiasIcon = isBuy ? IconTrendingUp : isSell ? IconTrendingDown : IconNeutral;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Bar: Asset & Bias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-institutional-card border border-institutional-border rounded-lg p-6 flex flex-col justify-center">
          <div className="text-xs font-mono text-institutional-muted uppercase tracking-wider mb-2">{t.asset_class}</div>
          <div className="text-3xl font-bold text-white tracking-tight">{data.asset_class}</div>
        </div>

        <div className="bg-institutional-card border border-institutional-border rounded-lg p-6 flex items-center justify-between">
            <div>
                 <div className="text-xs font-mono text-institutional-muted uppercase tracking-wider mb-2">{t.market_bias}</div>
                 <div className={`text-3xl font-bold ${biasColor} flex items-center gap-3`}>
                    <BiasIcon size={32} />
                    {data.market_bias.direction}
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs font-mono text-institutional-muted uppercase tracking-wider mb-1">{t.confidence}</div>
                <div className="text-2xl font-mono font-bold text-white">{data.market_bias.confidence}%</div>
            </div>
        </div>
      </div>

      {/* Main Grid: Liquidity & Institutional Reading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Liquidity Zones */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-bold text-white tracking-tight">{t.liquidity_map}</h2>
            <div className="h-px bg-institutional-border flex-grow"></div>
          </div>
          <LiquidityTable zones={data.liquidity_zones} lang={lang} />
          
           {/* Institutional Logic Box */}
            <div className="mt-8">
                 <div className="flex items-center space-x-2 mb-4 mt-8">
                    <IconBrain className="text-institutional-accent" size={20} />
                    <h2 className="text-lg font-bold text-white tracking-tight">{t.institutional_reading}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-institutional-bg border border-institutional-border p-4 rounded-lg">
                        <h4 className="text-xs font-mono text-institutional-muted uppercase mb-2">{t.market_intent}</h4>
                        <p className="text-sm text-institutional-text leading-relaxed">{data.institutional_reading.market_intent}</p>
                    </div>
                    <div className="bg-institutional-bg border border-institutional-border p-4 rounded-lg">
                        <h4 className="text-xs font-mono text-institutional-muted uppercase mb-2">{t.retail_traps}</h4>
                        <p className="text-sm text-institutional-text leading-relaxed">{data.institutional_reading.retail_traps}</p>
                    </div>
                     <div className="bg-institutional-bg border border-institutional-border p-4 rounded-lg">
                        <h4 className="text-xs font-mono text-institutional-muted uppercase mb-2">{t.objective}</h4>
                        <p className="text-sm text-institutional-text leading-relaxed">{data.institutional_reading.liquidity_objective}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Invalidation & Limitations */}
        <div className="space-y-6">
           <div className="bg-rose-950/10 border border-rose-900/30 rounded-lg p-5">
                <div className="flex items-center space-x-2 mb-3 text-rose-400">
                    <IconAlert size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">{t.invalidation_rules}</h3>
                </div>
                <div className="space-y-4 text-sm font-mono">
                    <div>
                        <span className="text-rose-300 block mb-1 text-xs">{t.bias_invalidation}</span>
                        <p className="text-institutional-text/80">{data.invalidation_rules.bias_invalidation}</p>
                    </div>
                     <div>
                        <span className="text-rose-300 block mb-1 text-xs">{t.setup_invalidation}</span>
                        <p className="text-institutional-text/80">{data.invalidation_rules.setup_invalidation}</p>
                    </div>
                </div>
           </div>

           {data.limitations && data.limitations.length > 0 && (
               <div className="border border-institutional-border bg-institutional-bg p-4 rounded-lg">
                    <h4 className="text-xs font-mono text-institutional-muted uppercase mb-2">{t.limitations}</h4>
                    <ul className="list-disc list-inside text-xs text-institutional-muted space-y-1">
                        {data.limitations.map((limit, i) => (
                            <li key={i}>{limit}</li>
                        ))}
                    </ul>
               </div>
           )}
        </div>
      </div>

      {/* Bottom Section: Setups */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">{t.execution_setups}</h2>
            <div className="h-px bg-institutional-border flex-grow"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SetupCard 
                title={t.setup_primary} 
                setup={data.setups.setup_A} 
                bias={data.market_bias.direction} 
                lang={lang}
            />
            <SetupCard 
                title={t.setup_confirmation} 
                setup={data.setups.setup_B} 
                bias={data.market_bias.direction}
                lang={lang} 
            />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
