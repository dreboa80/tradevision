
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
  
  // View state
  const [activeView, setActiveView] = useState<'vision' | 'analytics'>('vision');

  // Subscription State
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // App State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persistence on Mount
  useEffect(() => {
    // 1. Subscription
    const storedSub = localStorage.getItem('subscription_status');
    if (storedSub) {
      const parsedSub: SubscriptionStatus = JSON.parse(storedSub);
      setSubscription(parsedSub);

      if (parsedSub.plan === 'silver') {
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (now - parsedSub.startDate > thirtyDaysMs) {
            setIsExpired(true);
            setSubscription(null);
        }
      }
    }

    // 2. History
    const savedHistory = localStorage.getItem('trade_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleSelectPlan = (plan: PlanType) => {
    if (!plan) return;
    const duration = 30 * 24 * 60 * 60 * 1000;
    const newSub: SubscriptionStatus = {
        plan,
        startDate: Date.now(),
        expiryDate: Date.now() + duration
    };
    localStorage.setItem('subscription_status', JSON.stringify(newSub));
    setSubscription(newSub);
    setIsExpired(false);
  };

  const saveToHistory = (analysis: AnalysisResponse) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      data: analysis
    };
    const updatedHistory = [newItem, ...history].slice(0, 20); // Historique augmenté à 20 items
    setHistory(updatedHistory);
    localStorage.setItem('trade_history', JSON.stringify(updatedHistory));
    return newItem.id;
  };

  const updateSetupResultInHistory = (setupKey: 'setup_A' | 'setup_B', newResult: SetupResult) => {
    if (!activeHistoryId || !result) return;

    const updatedData = {
        ...result,
        setups: {
            ...result.setups,
            [setupKey]: {
                ...result.setups[setupKey],
                user_result: newResult
            }
        }
    };
    setResult(updatedData);

    const updatedHistory = history.map(item => {
        if (item.id === activeHistoryId) {
            return { ...item, data: updatedData };
        }
        return item;
    });
    setHistory(updatedHistory);
    localStorage.setItem('trade_history', JSON.stringify(updatedHistory));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResult(item.data);
    setActiveHistoryId(item.id);
    setFile(null); 
    setPreviewUrl(null);
    setActiveView('vision');
    window.scrollTo(0, 0);
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
    try {
      const data = await analyzeChart(file, lang);
      setResult(data);
      const id = saveToHistory(data);
      setActiveHistoryId(id);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
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
    <div className="min-h-screen bg-institutional-bg text-institutional-text font-sans selection:bg-institutional-accent selection:text-black">
      <Header lang={lang} activeView={activeView} onViewChange={setActiveView} />

      <main className="container mx-auto pb-12">
        
        {(!subscription || isExpired) ? (
            <PricingScreen onSelectPlan={handleSelectPlan} lang={lang} isExpired={isExpired} />
        ) : (
            <>
                {activeView === 'analytics' ? (
                    <PerformanceHub history={history} lang={lang} />
                ) : (
                    <>
                        {!file && !result && (
                          <div className="flex flex-col items-center min-h-[calc(100vh-100px)] px-4 py-12">
                            <div className="mb-12 flex items-center gap-4">
                                 <div className="bg-institutional-card border border-institutional-border px-4 py-2 rounded-full flex items-center gap-3">
                                     <span className="w-2 h-2 rounded-full bg-institutional-accent animate-pulse"></span>
                                     <span className="text-[10px] uppercase font-bold text-white tracking-widest font-mono">
                                         {subscription.plan?.toUpperCase()} ACCESS GRANTED
                                     </span>
                                 </div>
                            </div>

                            <div 
                                className="w-full max-w-2xl border-2 border-dashed border-institutional-border bg-institutional-card/30 rounded-3xl p-16 text-center transition-all hover:border-institutional-accent/40 hover:bg-institutional-card/50 cursor-pointer group mb-20 shadow-2xl"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-20 h-20 bg-institutional-bg rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 border border-institutional-border group-hover:border-institutional-accent/50 group-hover:shadow-[0_0_30px_rgba(0,220,130,0.2)]">
                                    <IconUpload className="text-institutional-muted group-hover:text-institutional-accent" size={32} />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{t.upload_title}</h2>
                                <p className="text-institutional-muted font-mono text-sm mb-10 max-w-xs mx-auto leading-relaxed">{t.upload_desc}</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                
                                <div className="inline-flex items-center px-4 py-2 bg-institutional-bg/50 border border-institutional-border rounded-lg text-[10px] text-institutional-muted font-mono uppercase tracking-[0.2em]">
                                    {t.supports}
                                </div>
                            </div>

                            <div className="w-full max-w-2xl">
                              <div className="flex items-center justify-between mb-6">
                                 <div className="flex items-center space-x-3">
                                     <IconScan className="text-institutional-accent" size={18} />
                                     <h3 className="text-xs font-mono font-bold text-white uppercase tracking-[0.2em]">{t.history_title}</h3>
                                 </div>
                                 <span className="text-[10px] font-mono text-institutional-muted">{history.length} / 20</span>
                              </div>
                              <HistoryList history={history} onSelect={loadHistoryItem} lang={lang} />
                            </div>
                          </div>
                        )}

                        {file && !result && (
                            <div className="max-w-5xl mx-auto mt-12 px-6 animate-in zoom-in-95 duration-500">
                                <div className="bg-institutional-card border border-institutional-border rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                                    <div className="relative aspect-video bg-black/40 flex items-center justify-center group border-b border-institutional-border">
                                        {previewUrl && (
                                            <img src={previewUrl} alt="Chart Preview" className="max-h-full max-w-full object-contain p-4" />
                                        )}
                                        <button onClick={reset} className="absolute top-6 right-6 bg-black/80 hover:bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold font-mono tracking-widest backdrop-blur border border-white/10 transition-all">
                                            {t.cancel}
                                        </button>
                                    </div>
                                    <div className="p-12">
                                        {!isAnalyzing ? (
                                            <div className="flex flex-col items-center">
                                                <button onClick={triggerAnalysis} className="bg-institutional-accent hover:bg-emerald-400 text-black font-bold py-4 px-12 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,220,130,0.4)] flex items-center gap-3 text-lg tracking-tight">
                                                    <IconScan size={24} />
                                                    {t.run_engine}
                                                </button>
                                            </div>
                                        ) : (
                                            <LoadingScreen lang={lang} />
                                        )}
                                        {error && (
                                            <div className="mt-8 p-5 bg-rose-950/20 border border-rose-900/50 rounded-2xl flex items-start gap-4">
                                                <IconAlert className="text-rose-500 shrink-0 mt-1" size={20} />
                                                <div>
                                                    <h4 className="text-sm font-bold text-rose-400">{t.analysis_failed}</h4>
                                                    <p className="text-xs text-rose-300/80 mt-1 font-mono leading-relaxed">{error}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-6">
                                 <div className="max-w-7xl mx-auto px-6 pt-8 flex justify-between items-center">
                                    <button onClick={reset} className="px-4 py-2 rounded-xl border border-institutional-border text-[10px] font-mono font-bold text-institutional-muted hover:text-white hover:border-institutional-muted transition-all flex items-center gap-3 uppercase tracking-widest">
                                        <span className="text-institutional-accent text-lg">←</span>
                                        {t.new_analysis}
                                    </button>
                                 </div>
                                <Dashboard data={result} lang={lang} onUpdateSetupResult={updateSetupResultInHistory} />
                            </div>
                        )}
                    </>
                )}
            </>
        )}
      </main>
    </div>
  );
};

export default App;
