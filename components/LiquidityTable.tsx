import React from 'react';
import { LiquidityZone } from '../types';
import { Language, translations } from '../i18n';

interface LiquidityTableProps {
  zones: LiquidityZone[];
  lang: Language;
}

const LiquidityTable: React.FC<LiquidityTableProps> = ({ zones, lang }) => {
  const t = translations[lang];
  return (
    <div className="overflow-hidden rounded-lg border border-institutional-border bg-institutional-card">
      <table className="w-full text-left text-sm font-mono">
        <thead className="bg-institutional-bg text-institutional-muted uppercase text-xs">
          <tr>
            <th className="px-4 py-3 font-medium tracking-wider">{t.table_type}</th>
            <th className="px-4 py-3 font-medium tracking-wider text-right">{t.table_price}</th>
            <th className="px-4 py-3 font-medium tracking-wider text-center">{t.table_str}</th>
            <th className="px-4 py-3 font-medium tracking-wider hidden sm:table-cell">{t.table_reason}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-institutional-border">
          {zones.map((zone, idx) => (
            <tr key={idx} className="group hover:bg-institutional-bg/50 transition-colors">
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                  zone.type === 'BUYSIDE' 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                    : 'bg-rose-950 text-rose-400 border border-rose-900'
                }`}>
                  {zone.type}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-medium text-white">
                {zone.price_approx}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-0.5">
                  <div className={`w-1 h-3 rounded-sm ${['low', 'medium', 'high'].includes(zone.strength) ? 'bg-institutional-accent' : 'bg-institutional-border'}`}></div>
                  <div className={`w-1 h-3 rounded-sm ${['medium', 'high'].includes(zone.strength) ? 'bg-institutional-accent' : 'bg-institutional-border'}`}></div>
                  <div className={`w-1 h-3 rounded-sm ${zone.strength === 'high' ? 'bg-institutional-accent' : 'bg-institutional-border'}`}></div>
                </div>
              </td>
              <td className="px-4 py-3 text-institutional-muted hidden sm:table-cell text-xs max-w-xs truncate group-hover:whitespace-normal group-hover:break-words">
                {zone.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LiquidityTable;
