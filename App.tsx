
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
      try {
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
      } catch (e) {
        console.error("Migration: Failed to parse sub status", e);
      }
    }

    // 2. History
    const savedHistory = localStorage.getItem('trade_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Migration: Failed to parse history", e);
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
    const updatedHistory = [newItem, ...history].slice(0, 20);
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

  // Render the main app interface
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-institutional-text font-sans selection:bg-institutional-accent selection:text-black">
      {!subscription || isExpired ? (
        <PricingScreen 
          lang={lang} 
          onSelectPlan={handleSelectPlan} 
          isExpired={isExpired} 
        />
      ) : (
        <>
          <Header 
            lang={lang} 
            activeView={activeView} 
            onViewChange={setActiveView} 
          />
          
          <main className="pt-24 pb-12 px-4">
            {activeView === 'vision' ? (
              <div className="max-w-7xl mx-auto space-y-8">
                {!result && !isAnalyzing && (
                  <div className="max-w-xl mx-auto">
                    <div 
                      className="border-2 border-dashed border-institutional-border rounded-2xl p-12 text-center hover:border-institutional-accent transition-colors cursor-pointer group bg-institutional-card/30"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <div className="w-16 h-16 bg-institutional-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-institutional-accent group-hover:scale-110 transition-transform">
                        <IconUpload size={32} />
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2">{t.upload_title}</h2>
                      <p className="text-institutional-muted text-sm">{t.upload_desc}</p>
                      <p className="text-[10px] text-institutional-muted/50 mt-4 uppercase tracking-widest">{t.supports}</p>
                    </div>

                    {previewUrl && (
                      <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="relative rounded-xl overflow-hidden border border-institutional-border aspect-video bg-black">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={triggerAnalysis}
                            className="flex-1 py-4 rounded-xl bg-institutional-accent text-black font-bold text-sm tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,220,130,0.2)]"
                          >
                            <IconScan size={20} />
                            {t.run_engine}
                          </button>
                          <button 
                            onClick={reset}
                            className="px-6 py-4 rounded-xl border border-institutional-border text-institutional-muted font-bold text-sm hover:text-white hover:bg-institutional-border/50 transition-all"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-6 p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-center gap-4 text-rose-400">
                        <IconAlert size={20} />
                        <p className="text-sm font-mono">{error}</p>
                      </div>
                    )}
                  </div>
                )}

                {isAnalyzing && <LoadingScreen lang={lang} />}

                {result && !isAnalyzing && (
                  <Dashboard 
                    data={result} 
                    lang={lang} 
                    onUpdateSetupResult={updateSetupResultInHistory}
                  />
                )}

                {/* History Section */}
                {!isAnalyzing && (
                  <div className="max-w-4xl mx-auto pt-12 border-t border-institutional-border/30">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xs font-mono font-bold text-institutional-muted uppercase tracking-[0.3em]">{t.history_title}</h3>
                       {result && (
                         <button onClick={reset} className="text-[10px] font-mono text-institutional-accent hover:underline uppercase tracking-widest">
                           + {t.new_analysis}
                         </button>
                       )}
                    </div>
                    <HistoryList 
                      history={history} 
                      onSelect={loadHistoryItem} 
                      lang={lang} 
                    />
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
