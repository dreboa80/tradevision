import React, { useState } from 'react';
import { IconCheck, IconCreditCard, IconClock, IconScan, IconAlert } from './Icons';
import { Language, translations } from '../i18n';

interface PricingScreenProps {
  onSelectPlan: (plan: 'silver' | 'gold') => void;
  lang: Language;
  isExpired?: boolean;
}

const PricingScreen: React.FC<PricingScreenProps> = ({ onSelectPlan, lang, isExpired }) => {
  const t = translations[lang];
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoldClick = (e: React.MouseEvent) => {
    // Let the link open in new tab naturally
    // Then switch UI to verification mode
    setTimeout(() => {
        setIsVerifyingPayment(true);
    }, 500);
  };

  const handleActivate = () => {
    // Normalize input
    const code = activationCode.trim().toUpperCase();
    
    // 1. FORMAT VALIDATION
    // Allow any code starting with 'GOLD-' and having enough length (e.g. GOLD-X-123)
    // This allows you to generate unique codes for each user without changing the app code.
    const isValidFormat = code.startsWith('GOLD-') && code.length >= 8;

    if (!isValidFormat) {
        setError(t.verify_error);
        return;
    }

    // 2. CHECK IF CODE IS BURNED (USED)
    const burnedCodes = JSON.parse(localStorage.getItem('burned_codes') || '[]');
    if (burnedCodes.includes(code)) {
        setError(t.verify_code_used);
        return;
    }

    // 3. SUCCESS: ACTIVATE & BURN CODE
    // Save this code as used so it cannot be used again on this device
    localStorage.setItem('burned_codes', JSON.stringify([...burnedCodes, code]));
    
    setError(null);
    onSelectPlan('gold');
  };

  const cancelVerification = () => {
    setIsVerifyingPayment(false);
    setActivationCode('');
    setError(null);
  };

  if (isVerifyingPayment) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 py-12 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-institutional-card border border-institutional-accent/50 rounded-xl p-8 text-center shadow-[0_0_50px_rgba(0,220,130,0.1)]">
                <div className="w-16 h-16 bg-institutional-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-institutional-accent animate-pulse">
                    <IconCreditCard size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 tracking-wide">{t.verify_title}</h2>
                <p className="text-institutional-muted text-xs mb-6 leading-relaxed">
                    {t.verify_desc}
                </p>

                <div className="bg-institutional-bg border border-institutional-border rounded-lg p-4 mb-6 text-left space-y-3">
                    <div>
                        <p className="text-xs text-institutional-muted mb-1">{t.verify_step_1}</p>
                        <p className="text-sm font-bold text-white font-mono select-all bg-black/30 p-2 rounded border border-institutional-border/50 text-center">
                            {t.verify_email}
                        </p>
                    </div>
                     <div>
                        <p className="text-xs text-institutional-muted">{t.verify_step_2}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            value={activationCode}
                            onChange={(e) => {
                                setActivationCode(e.target.value);
                                setError(null);
                            }}
                            placeholder={t.verify_input_placeholder}
                            className="w-full bg-institutional-bg border border-institutional-border rounded-lg px-4 py-3 text-white placeholder-institutional-muted/50 focus:outline-none focus:border-institutional-accent text-center font-mono tracking-wider uppercase"
                        />
                         {error && (
                            <p className="text-rose-400 text-xs mt-2 font-mono flex items-center justify-center gap-1 animate-in fade-in slide-in-from-top-1">
                                <IconAlert size={12} />
                                {error}
                            </p>
                        )}
                    </div>

                    <button 
                        onClick={handleActivate}
                        className="w-full py-3 rounded-lg bg-institutional-accent text-black font-bold text-sm tracking-wide hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                    >
                        <IconCheck size={18} />
                        {t.verify_btn_activate}
                    </button>
                    
                    <button 
                        onClick={cancelVerification}
                        className="w-full py-3 rounded-lg border border-institutional-border text-institutional-muted font-bold text-sm tracking-wide hover:text-white hover:bg-institutional-border/50 transition-all"
                    >
                        {t.verify_btn_cancel}
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-institutional-border">
                    <p className="text-[10px] text-institutional-muted flex items-center justify-center gap-2">
                        <IconClock size={12} />
                        {t.verify_note}
                    </p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 py-12 animate-in fade-in duration-700">
      
      {isExpired && (
        <div className="mb-8 p-4 bg-rose-950/30 border border-rose-900/50 rounded-lg text-center max-w-md w-full">
            <h3 className="text-rose-400 font-bold mb-1">{t.plan_expired}</h3>
            <p className="text-rose-300/70 text-sm">{t.plan_expired_desc}</p>
        </div>
      )}

      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-institutional-accent/10 rounded-full border border-institutional-accent/20 mb-4 text-institutional-accent">
            <IconScan size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-widest uppercase">{t.pricing_title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        
        {/* SILVER PLAN */}
        <div className={`bg-institutional-card border ${isExpired ? 'border-institutional-border opacity-50' : 'border-institutional-border'} rounded-xl p-8 flex flex-col relative group hover:border-institutional-muted/50 transition-colors`}>
          <div className="mb-6">
            <h3 className="text-lg font-mono text-institutional-muted uppercase tracking-wider mb-2">{t.plan_silver}</h3>
            <div className="text-4xl font-bold text-white mb-2">{t.silver_price}</div>
            <div className="flex items-center text-institutional-accent text-sm font-mono bg-institutional-accent/10 w-fit px-2 py-1 rounded">
                <IconClock size={14} className="mr-2" />
                {t.silver_duration}
            </div>
          </div>

          <ul className="space-y-4 mb-8 flex-grow">
            <li className="flex items-center text-sm text-institutional-text">
                <IconCheck size={16} className="text-institutional-muted mr-3" />
                {t.features_analysis}
            </li>
            <li className="flex items-center text-sm text-institutional-text">
                <IconCheck size={16} className="text-institutional-muted mr-3" />
                {t.features_setups}
            </li>
             <li className="flex items-center text-sm text-institutional-muted/50">
                <IconCheck size={16} className="text-institutional-border mr-3" />
                {t.features_history}
            </li>
          </ul>

          <button 
            onClick={() => !isExpired && onSelectPlan('silver')}
            disabled={isExpired}
            className={`w-full py-3 rounded-lg border border-institutional-border font-bold text-sm tracking-wide transition-all ${isExpired ? 'cursor-not-allowed text-institutional-border' : 'bg-transparent text-white hover:bg-white hover:text-black'}`}
          >
            {t.btn_start_free}
          </button>
        </div>

        {/* GOLD PLAN */}
        <div className="bg-institutional-card border border-institutional-accent/30 rounded-xl p-8 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(0,220,130,0.05)]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-institutional-accent/10 rounded-bl-full -mr-10 -mt-10"></div>
          
          <div className="mb-6 relative">
            <h3 className="text-lg font-mono text-institutional-accent uppercase tracking-wider mb-2">{t.plan_gold}</h3>
            <div className="text-4xl font-bold text-white mb-2">
                {t.gold_price} <span className="text-lg text-institutional-muted font-normal">{t.gold_period}</span>
            </div>
            <div className="flex items-center text-institutional-accent text-sm font-mono">
                Institutional Grade
            </div>
          </div>

          <ul className="space-y-4 mb-8 flex-grow relative">
            <li className="flex items-center text-sm text-white">
                <IconCheck size={16} className="text-institutional-accent mr-3" />
                {t.features_analysis}
            </li>
             <li className="flex items-center text-sm text-white">
                <IconCheck size={16} className="text-institutional-accent mr-3" />
                {t.features_setups}
            </li>
            <li className="flex items-center text-sm text-white">
                <IconCheck size={16} className="text-institutional-accent mr-3" />
                {t.features_history}
            </li>
             <li className="flex items-center text-sm text-white">
                <IconCheck size={16} className="text-institutional-accent mr-3" />
                {t.features_support}
            </li>
          </ul>

          <a 
            href="https://www.paypal.com/ncp/payment/WP36L5Q5FK9J4"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleGoldClick}
            className="w-full py-3 rounded-lg bg-[#0070BA] hover:bg-[#003087] text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer text-center no-underline"
          >
            <IconCreditCard size={16} />
            {t.btn_pay_paypal}
          </a>
          
          <p className="text-[10px] text-center text-institutional-muted mt-3">
            Secure payment processed by PayPal
          </p>
        </div>

      </div>
    </div>
  );
};

export default PricingScreen;
