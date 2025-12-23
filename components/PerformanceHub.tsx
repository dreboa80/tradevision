
import React, { useMemo } from 'react';
import { HistoryItem, SetupResult } from '../types';
import { Language, translations } from '../i18n';
import { IconTrendingUp, IconAlert, IconCheck } from './Icons';

interface PerformanceHubProps {
  history: HistoryItem[];
  lang: Language;
}

interface MonthlyStats {
  monthYear: string; // "January 2024"
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

    // Process history
    history.forEach(item => {
      const date = new Date(item.timestamp);
      const monthYear = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });

      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { monthYear, win: 0, loss: 0, be: 0, total: 0 };
      }

      // Check Setup A and B
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

    const monthlyList = Object.values(monthlyMap).sort((a, b) => {
        // Simple sort by date (could be more robust)
        return new Date(b.monthYear).getTime() - new Date(a.monthYear).getTime();
    });

    const globalWinRate = globalTotal > 0 ? (globalWin / globalTotal) * 100 : 0;

    return { monthlyList, globalWin, globalLoss, globalBE, globalTotal, globalWinRate };
  }, [history, lang]);

  if (stats.globalTotal === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-institutional-card border border-institutional-border rounded-full flex items-center justify-center mx-auto text-institutional-muted">
            <IconAlert size={24} />
        </div>
        <h3 className="text-xl font-bold text-white">{t.no_data_analytics}</h3>
        <p className="text-sm text-institutional-muted font-mono">{t.analytics_desc}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{t.analytics_title}</h2>
            <p className="text-sm text-institutional-muted font-mono mt-2">{t.analytics_desc}</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-institutional-card border border-institutional-border rounded-xl p-4 min-w-[140px] shadow-lg">
                <div className="text-[10px] font-mono text-institutional-muted uppercase tracking-widest mb-1">{t.win_rate}</div>
                <div className="text-2xl font-bold text-institutional-accent font-mono">{stats.globalWinRate.toFixed(1)}%</div>
            </div>
            <div className="bg-institutional-card border border-institutional-border rounded-xl p-4 min-w-[140px] shadow-lg">
                <div className="text-[10px] font-mono text-institutional-muted uppercase tracking-widest mb-1">{t.total_trades}</div>
                <div className="text-2xl font-bold text-white font-mono">{stats.globalTotal}</div>
            </div>
        </div>
      </div>

      {/* Global Distribution */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
             <IconTrendingUp className="text-institutional-accent" size={16} />
             <h3 className="text-xs font-mono font-bold text-institutional-muted uppercase tracking-widest">{t.global_stats}</h3>
        </div>
        <div className="h-4 w-full bg-institutional-card border border-institutional-border rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(stats.globalWin / stats.globalTotal) * 100}%` }}></div>
            <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${(stats.globalLoss / stats.globalTotal) * 100}%` }}></div>
            <div className="bg-institutional-muted h-full transition-all duration-1000" style={{ width: `${(stats.globalBE / stats.globalTotal) * 100}%` }}></div>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> WIN: {stats.globalWin}</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> LOSS: {stats.globalLoss}</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-institutional-muted"></span> B.E: {stats.globalBE}</div>
        </div>
      </section>

      {/* Monthly Breakdown */}
      <section className="space-y-6">
         <div className="flex items-center gap-3">
             <IconCheck size={16} className="text-institutional-accent" />
             <h3 className="text-xs font-mono font-bold text-institutional-muted uppercase tracking-widest">{t.monthly_breakdown}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.monthlyList.map((m) => {
            const winPct = (m.win / m.total) * 100;
            const lossPct = (m.loss / m.total) * 100;
            const bePct = (m.be / m.total) * 100;
            
            return (
              <div key={m.monthYear} className="bg-institutional-card border border-institutional-border rounded-xl p-6 shadow-md hover:border-institutional-accent/30 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-bold text-white capitalize">{m.monthYear}</h4>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-institutional-muted block uppercase">{t.win_rate}</span>
                    <span className="text-xl font-bold text-institutional-accent font-mono">{winPct.toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-institutional-muted">
                        <span>Win ({m.win})</span>
                        <span>{winPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-institutional-bg rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full group-hover:shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all" style={{ width: `${winPct}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-institutional-muted">
                        <span>Loss ({m.loss})</span>
                        <span>{lossPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-institutional-bg rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full group-hover:shadow-[0_0_8px_rgba(244,63,94,0.4)] transition-all" style={{ width: `${lossPct}%` }}></div>
                    </div>
                  </div>

                   <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-institutional-muted">
                        <span>B.E ({m.be})</span>
                        <span>{bePct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-institutional-bg rounded-full overflow-hidden">
                        <div className="bg-institutional-muted h-full transition-all" style={{ width: `${bePct}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-institutional-border/50 text-center">
                    <span className="text-[10px] font-mono text-institutional-muted uppercase tracking-[0.2em]">Total trades: {m.total}</span>
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
