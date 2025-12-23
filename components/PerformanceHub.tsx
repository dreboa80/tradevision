
import React, { useMemo } from 'react';
import { HistoryItem } from '../types';
import { Language, translations } from '../i18n';
import { IconTrendingUp, IconAlert, IconCheck, IconTarget } from './Icons';

interface PerformanceHubProps {
  history: HistoryItem[];
  lang: Language;
}

interface MonthlyStats {
  monthYear: string;
  win: number;
  loss: number;
  be: number;
  total: number;
}

const PerformanceHub: React.FC<PerformanceHubProps> = ({ history, lang }) => {
  const t = translations[lang];

  const stats = useMemo(() => {
    const monthlyMap: Record<string, MonthlyStats> = {};
    let globalWin = 0;
    let globalLoss = 0;
    let globalBE = 0;
    let globalTotal = 0;

    history.forEach(item => {
      const date = new Date(item.timestamp);
      const monthYear = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });

      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { monthYear, win: 0, loss: 0, be: 0, total: 0 };
      }

      ['setup_A', 'setup_B'].forEach(key => {
        const setup = item.data.setups[key as 'setup_A' | 'setup_B'];
        const result = setup.user_result;

        if (result && result !== 'PENDING') {
          monthlyMap[monthYear].total++;
          globalTotal++;
          if (result === 'WIN') { monthlyMap[monthYear].win++; globalWin++; }
          if (result === 'LOSS') { monthlyMap[monthYear].loss++; globalLoss++; }
          if (result === 'BE') { monthlyMap[monthYear].be++; globalBE++; }
        }
      });
    });

    const monthlyList = Object.values(monthlyMap).sort((a, b) => 
        new Date(b.monthYear).getTime() - new Date(a.monthYear).getTime()
    );

    const globalWinRate = globalTotal > 0 ? (globalWin / globalTotal) * 100 : 0;

    return { monthlyList, globalWin, globalLoss, globalBE, globalTotal, globalWinRate };
  }, [history, lang]);

  if (stats.globalTotal === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-institutional-card border border-institutional-border rounded-2xl flex items-center justify-center mx-auto text-institutional-muted/50 shadow-inner">
            <IconTarget size={32} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-2">{t.no_data_analytics}</h3>
            <p className="text-sm text-institutional-muted font-mono max-w-xs mx-auto leading-relaxed">{t.analytics_desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Analytics Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-institutional-border pb-10">
        <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white tracking-tighter">{t.analytics_title}</h2>
            <div className="flex items-center gap-3 text-xs font-mono text-institutional-muted uppercase tracking-[0.2em]">
                <span className="w-2 h-2 rounded-full bg-institutional-accent"></span>
                {t.analytics_desc}
            </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-institutional-card border border-institutional-border rounded-xl p-5 shadow-2xl relative overflow-hidden group hover:border-institutional-accent/40 transition-colors">
                <div className="text-[10px] font-mono text-institutional-muted uppercase tracking-widest mb-1">{t.win_rate}</div>
                <div className="text-3xl font-bold text-institutional-accent font-mono">{stats.globalWinRate.toFixed(1)}%</div>
                <div className="absolute -right-2 -bottom-2 opacity-5 text-institutional-accent group-hover:opacity-10 transition-opacity">
                    <IconTrendingUp size={64} />
                </div>
            </div>
            <div className="bg-institutional-card border border-institutional-border rounded-xl p-5 shadow-2xl">
                <div className="text-[10px] font-mono text-institutional-muted uppercase tracking-widest mb-1">{t.total_trades}</div>
                <div className="text-3xl font-bold text-white font-mono">{stats.globalTotal}</div>
            </div>
            <div className="hidden sm:block bg-institutional-card border border-institutional-border rounded-xl p-5 shadow-2xl">
                <div className="text-[10px] font-mono text-institutional-muted uppercase tracking-widest mb-1">Success Ratio</div>
                <div className="text-3xl font-bold text-white font-mono">{stats.globalWin}:{stats.globalLoss}</div>
            </div>
        </div>
      </div>

      {/* Probability Distribution */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <IconTrendingUp className="text-institutional-accent" size={18} />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-[0.3em]">{t.global_stats}</h3>
             </div>
        </div>
        
        <div className="p-6 bg-institutional-card/30 border border-institutional-border rounded-2xl">
            <div className="h-5 w-full bg-institutional-bg border border-institutional-border rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ width: `${(stats.globalWin / stats.globalTotal) * 100}%` }}></div>
                <div className="bg-rose-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.3)]" style={{ width: `${(stats.globalLoss / stats.globalTotal) * 100}%` }}></div>
                <div className="bg-institutional-muted h-full transition-all duration-1000" style={{ width: `${(stats.globalBE / stats.globalTotal) * 100}%` }}></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                    <span className="block text-[9px] font-mono text-emerald-400 uppercase tracking-widest mb-1">Wins</span>
                    <span className="text-xl font-bold text-white font-mono">{stats.globalWin}</span>
                </div>
                <div className="text-center p-3 rounded-lg border border-rose-500/10 bg-rose-500/5">
                    <span className="block text-[9px] font-mono text-rose-400 uppercase tracking-widest mb-1">Losses</span>
                    <span className="text-xl font-bold text-white font-mono">{stats.globalLoss}</span>
                </div>
                <div className="text-center p-3 rounded-lg border border-institutional-border bg-institutional-bg">
                    <span className="block text-[9px] font-mono text-institutional-muted uppercase tracking-widest mb-1">B.E</span>
                    <span className="text-xl font-bold text-white font-mono">{stats.globalBE}</span>
                </div>
            </div>
        </div>
      </section>

      {/* Monthly Stats Grid */}
      <section className="space-y-8">
         <div className="flex items-center gap-3">
             <IconCheck size={18} className="text-institutional-accent" />
             <h3 className="text-xs font-mono font-bold text-white uppercase tracking-[0.3em]">{t.monthly_breakdown}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.monthlyList.map((m) => {
            const winPct = (m.win / m.total) * 100;
            const lossPct = (m.loss / m.total) * 100;
            const bePct = (m.be / m.total) * 100;
            
            return (
              <div key={m.monthYear} className="bg-institutional-card border border-institutional-border rounded-2xl p-8 shadow-xl hover:border-institutional-accent/20 transition-all duration-300 group relative">
                <div className="flex justify-between items-start mb-8">
                  <h4 className="text-xl font-bold text-white capitalize tracking-tight">{m.monthYear}</h4>
                  <div className="bg-institutional-bg border border-institutional-border px-3 py-2 rounded-xl text-right">
                    <span className="text-[9px] font-mono text-institutional-muted block uppercase tracking-tighter mb-1">Monthly WR</span>
                    <span className="text-2xl font-bold text-institutional-accent font-mono">{winPct.toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-institutional-muted tracking-widest">
                        <span>Success Rate</span>
                        <span>{m.win} WIN / {m.total} TRADES</span>
                    </div>
                    <div className="h-2 w-full bg-institutional-bg rounded-full overflow-hidden border border-institutional-border/50">
                        <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${winPct}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-institutional-muted tracking-widest">
                        <span>Failure Rate</span>
                        <span>{m.loss} LOSS</span>
                    </div>
                    <div className="h-2 w-full bg-institutional-bg rounded-full overflow-hidden border border-institutional-border/50">
                        <div className="bg-rose-500 h-full transition-all duration-700" style={{ width: `${lossPct}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-institutional-border/30 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-institutional-bg border border-institutional-border rounded-full">
                         <IconCheck size={12} className="text-institutional-accent" />
                         <span className="text-[10px] font-mono text-institutional-text uppercase tracking-widest">Performance Verified</span>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PerformanceHub;
