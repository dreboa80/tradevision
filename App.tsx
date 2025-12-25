
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import HistoryList from './components/HistoryList';
import PricingScreen from './components/PricingScreen';
import PerformanceHub from './components/PerformanceHub';
import { IconUpload, IconAlert, IconScan } from './components/Icons';
import { analyzeChart } from './services/geminiService';
import { AnalysisResponse, HistoryItem, SubscriptionStatus, PlanType, SetupResult } from './types';
import { getBrowserLanguage, translations } from './i18n';

const App: React.FC = () => {
  const [lang] = useState(getBrowserLanguage());
  const t = translations[lang];
  const [activeView, setActiveView] = useState<'vision' | 'analytics'>('vision');
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedSub = localStorage.getItem('subscription_status');
    if (storedSub) {
      try {
        const parsedSub: SubscriptionStatus = JSON.parse(storedSub);
        setSubscription(parsedSub);
        if (parsedSub.plan === 'silver') {
          const now = Date.now();
          if (now - parsedSub.startDate > 30 * 24 * 60 * 60 * 1000) {
              setIsExpired(true);
              setSubscription(null);
          }
        }
      } catch (e) {}
    }
    const savedHistory = localStorage.getItem('trade_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }
  }, []);

  const handleSelectPlan = (plan: PlanType) => {
    if (!plan) return;
    const newSub: SubscriptionStatus = { plan, startDate: Date.now(), expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000 };
    localStorage.setItem('subscription_status', JSON.stringify(newSub));
    setSubscription(newSub);
    setIsExpired(false);
  };

  const saveToHistory = (analysis: AnalysisResponse) => {
    const newItem: HistoryItem = { id: crypto.randomUUID(), timestamp: Date.now(), data: analysis };
    const updatedHistory = [newItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('trade_history', JSON.stringify(updatedHistory));
    return newItem.id;
  };

  const updateSetupResultInHistory = (setupKey: 'setup_A' | 'setup_B', newResult: SetupResult) => {
    if (!activeHistoryId || !result) return;
    const updatedData = { ...result, setups: { ...result.setups, [setupKey]: { ...result.setups[setupKey], user_result: newResult } } };
    setResult(updatedData);
    const updatedHistory = history.map(item => item.id === activeHistoryId ? { ...item, data: updatedData } : item);
    setHistory(updatedHistory);
    localStorage.setItem('trade_history', JSON.stringify(updatedHistory));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResult(item.data);
    setActiveHistoryId(item.id);
    setFile(null); 
    setPreviewUrl(null);
    setActiveView('vision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
      setActiveHistoryId(null);
    }
  };

  const triggerAnalysis = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null); 
    
    try {
      const data = await analyzeChart(file, lang);
      setResult(data);
      const id = saveToHistory(data);
      setActiveHistoryId(id);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Le moteur n'a pas pu répondre à temps.");
    } finally {
      // STOP loading dans tous les cas
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setActiveHistoryId(null);
    setError(null);
    setActiveView('vision');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-institutional-text font-sans selection:bg-institutional-accent selection:text-black">
      {!subscription || isExpired ? (
        <PricingScreen lang={lang} onSelectPlan={handleSelectPlan} isExpired={isExpired} />
      ) : (
        <>
          <Header lang={lang} activeView={activeView} onViewChange={setActiveView} />
          <main className="pt-24 pb-12 px-4">
            {activeView === 'vision' ? (
              <div className="max-w-7xl mx-auto space-y-8">
                {result && !isAnalyzing && (
                  <div className="flex justify-between items-center mb-2 px-2">
                    <button onClick={reset} className="group flex items-center gap-3 px-4 py-2 rounded-xl border border-institutional-border bg-institutional-card/50 hover:border-institutional-accent/50 hover:bg-institutional-accent/5 transition-all">
                      <div className="w-6 h-6 rounded-lg bg-institutional-bg flex items-center justify-center text-institutional-accent group-hover:scale-110 transition-transform">
                        <span>←</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-institutional-muted group-hover:text-white uppercase tracking-widest">{t.new_analysis}</span>
                    </button>
                  </div>
                )}

                {!result && !isAnalyzing && (
                  <div className="max-w-xl mx-auto pt-12">
                    <div className="border-2 border-dashed border-institutional-border rounded-3xl p-16 text-center hover:border-institutional-accent transition-all cursor-pointer group bg-institutional-card/20 shadow-2xl" onClick={() => fileInputRef.current?.click()}>
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                      <div className="w-20 h-20 bg-institutional-bg border border-institutional-border rounded-2xl flex items-center justify-center mx-auto mb-8 text-institutional-muted group-hover:text-institutional-accent group-hover:border-institutional-accent/50 group-hover:scale-110 transition-all">
                        <IconUpload size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">{t.upload_title}</h2>
                      <p className="text-institutional-muted text-sm font-mono max-w-xs mx-auto leading-relaxed">{t.upload_desc}</p>
                    </div>

                    {previewUrl && (
                      <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-top-6 duration-700">
                        <div className="relative rounded-2xl overflow-hidden border border-institutional-border aspect-video bg-black shadow-2xl">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                        </div>
                        <div className="flex gap-4">
                          <button onClick={triggerAnalysis} className="flex-1 py-5 rounded-2xl bg-institutional-accent text-black font-black text-xs tracking-[0.2em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_50px_rgba(0,220,130,0.3)]">
                            <IconScan size={20} /> {t.run_engine.toUpperCase()}
                          </button>
                          <button onClick={reset} className="px-8 py-5 rounded-2xl border border-institutional-border text-institutional-muted font-bold text-xs tracking-widest hover:text-white transition-all uppercase">{t.cancel}</button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-8 p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex items-center gap-4 text-rose-400 animate-in shake duration-500">
                        <IconAlert size={20} />
                        <p className="text-sm font-mono leading-relaxed">{error}</p>
                      </div>
                    )}
                  </div>
                )}

                {isAnalyzing && <LoadingScreen lang={lang} />}
                {result && !isAnalyzing && <Dashboard data={result} lang={lang} onUpdateSetupResult={updateSetupResultInHistory} />}

                {!isAnalyzing && history.length > 0 && (
                  <div className="max-w-4xl mx-auto pt-20 pb-12">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="p-2 bg-institutional-card border border-institutional-border rounded-lg"><IconScan className="text-institutional-accent" size={18} /></div>
                       <h3 className="text-xs font-mono font-bold text-white uppercase tracking-[0.4em]">{t.history_title}</h3>
                       <div className="h-px bg-institutional-border flex-grow"></div>
                    </div>
                    <HistoryList history={history} onSelect={loadHistoryItem} lang={lang} />
                  </div>
                )}
              </div>
            ) : (
              <PerformanceHub history={history} lang={lang} />
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
