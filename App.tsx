
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import HistoryList from './components/HistoryList';
import PricingScreen from './components/PricingScreen';
import { IconUpload, IconAlert, IconScan } from './components/Icons';
import { analyzeChart } from './services/geminiService';
import { AnalysisResponse, HistoryItem, SubscriptionStatus, PlanType, SetupResult } from './types';
import { getBrowserLanguage, translations } from './i18n';

const App: React.FC = () => {
  const [lang] = useState(getBrowserLanguage());
  const t = translations[lang];
  
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

  // Check Subscription on Mount
  useEffect(() => {
    const storedSub = localStorage.getItem('subscription_status');
    if (storedSub) {
      const parsedSub: SubscriptionStatus = JSON.parse(storedSub);
      setSubscription(parsedSub);

      // Check Expiry for Silver
      if (parsedSub.plan === 'silver') {
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (now - parsedSub.startDate > thirtyDaysMs) {
            setIsExpired(true);
            setSubscription(null);
        }
      }
    }
  }, []);

  // Load History
  useEffect(() => {
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

    if (plan === 'silver') {
        const newSub: SubscriptionStatus = {
            plan: 'silver',
            startDate: Date.now()
        };
        localStorage.setItem('subscription_status', JSON.stringify(newSub));
        setSubscription(newSub);
    } else if (plan === 'gold') {
        const newSub: SubscriptionStatus = {
            plan: 'gold',
            startDate: Date.now(),
            expiryDate: Date.now() + (30 * 24 * 60 * 60 * 1000)
        };
        localStorage.setItem('subscription_status', JSON.stringify(newSub));
        setSubscription(newSub);
        setIsExpired(false);
    }
  };

  const saveToHistory = (analysis: AnalysisResponse) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      data: analysis
    };
    
    const updatedHistory = [newItem, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('trade_history', JSON.stringify(updatedHistory));
    return newItem.id;
  };

  const updateSetupResultInHistory = (setupKey: 'setup_A' | 'setup_B', newResult: SetupResult) => {
    if (!activeHistoryId || !result) return;

    // 1. Update Current View State
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

    // 2. Update Persistence
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
    window.scrollTo(0, 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
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
  };

  return (
    <div className="min-h-screen bg-institutional-bg text-institutional-text font-sans selection:bg-institutional-accent selection:text-black">
      <Header lang={lang} />

      <main className="container mx-auto pb-12">
        
        {(!subscription || isExpired) ? (
            <PricingScreen 
                onSelectPlan={handleSelectPlan} 
                lang={lang} 
                isExpired={isExpired} 
            />
        ) : (
            <>
                {!file && !result && (
                  <div className="flex flex-col items-center min-h-[calc(100vh-100px)] px-4 py-12">
                    <div className="mb-8 flex items-center gap-3">
                         <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${subscription.plan === 'gold' ? 'border-institutional-accent text-institutional-accent bg-institutional-accent/10' : 'border-institutional-muted text-institutional-muted'}`}>
                             PLAN: {subscription.plan?.toUpperCase()}
                         </span>
                         {subscription.plan === 'silver' && (
                             <span className="text-[10px] text-institutional-muted font-mono">
                                 Days left: {Math.max(0, 30 - Math.floor((Date.now() - subscription.startDate) / (1000 * 60 * 60 * 24)))}
                             </span>
                         )}
                    </div>

                    <div 
                        className="w-full max-w-xl border-2 border-dashed border-institutional-border bg-institutional-card/50 rounded-2xl p-12 text-center transition-all hover:border-institutional-accent/50 hover:bg-institutional-card cursor-pointer group mb-16"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-institutional-bg rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-institutional-border group-hover:border-institutional-accent">
                            <IconUpload className="text-institutional-muted group-hover:text-institutional-accent" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{t.upload_title}</h2>
                        <p className="text-institutional-muted font-mono text-sm mb-8">{t.upload_desc}</p>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>

                    <div className="w-full max-w-xl">
                      <div className="flex items-center space-x-2 mb-4">
                         <IconScan className="text-institutional-muted" size={16} />
                         <h3 className="text-xs font-mono text-institutional-muted uppercase tracking-wider">{t.history_title}</h3>
                      </div>
                      <HistoryList history={history} onSelect={loadHistoryItem} lang={lang} />
                    </div>
                  </div>
                )}

                {file && !result && (
                    <div className="max-w-4xl mx-auto mt-12 px-6">
                        <div className="bg-institutional-card border border-institutional-border rounded-xl overflow-hidden shadow-2xl">
                            <div className="relative aspect-video bg-black/50 flex items-center justify-center group">
                                {previewUrl && (
                                    <img src={previewUrl} alt="Chart Preview" className="max-h-full max-w-full object-contain" />
                                )}
                                <button onClick={reset} className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3 py-1 rounded-md text-xs font-mono backdrop-blur border border-white/10">
                                    {t.cancel}
                                </button>
                            </div>
                            <div className="p-8 border-t border-institutional-border">
                                {!isAnalyzing ? (
                                    <div className="flex flex-col items-center space-y-6">
                                        <button onClick={triggerAnalysis} className="bg-institutional-accent hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,220,130,0.3)] flex items-center gap-2">
                                            <IconUpload size={20} />
                                            {t.run_engine}
                                        </button>
                                    </div>
                                ) : (
                                    <LoadingScreen lang={lang} />
                                )}
                                {error && (
                                    <div className="mt-6 p-4 bg-rose-950/20 border border-rose-900/50 rounded-lg flex items-start gap-3">
                                        <IconAlert className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <h4 className="text-sm font-bold text-rose-400">{t.analysis_failed}</h4>
                                            <p className="text-xs text-rose-300/80 mt-1">{error}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="space-y-6">
                         <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-between items-center">
                            <button onClick={reset} className="text-xs font-mono text-institutional-muted hover:text-white flex items-center gap-2">
                                ← {t.new_analysis}
                            </button>
                         </div>
                        <Dashboard 
                            data={result} 
                            lang={lang} 
                            onUpdateSetupResult={updateSetupResultInHistory} 
                        />
                    </div>
                )}
            </>
        )}
      </main>
    </div>
  );
};

export default App;
