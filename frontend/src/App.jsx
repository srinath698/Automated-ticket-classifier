import React, { useEffect, useState } from 'react';
import {
  Bot,
  Activity,
  ChartNoAxesCombined,
  BrainCircuit,
  CircleAlert,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import ClassifierPage from './pages/ClassifierPage';
import PerformancePage from './pages/PerformancePage';
import AboutPage from './pages/AboutPage';
import { checkHealth } from './api/client';

const NAV_ITEMS = [
  { id: 'classifier', label: 'Triage Workspace' },
  { id: 'performance', label: 'Model Quality' },
  { id: 'about', label: 'Architecture & FAQ' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('classifier');
  const [health, setHealth] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadHealth() {
      try {
        const data = await checkHealth();
        if (isMounted) setHealth(data);
      } catch {
        if (isMounted) {
          setHealth({ status: 'offline', model_loaded: false, openrouter_configured: false });
        }
      }
    }
    loadHealth();
    const interval = setInterval(loadHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const modelReady = health?.model_loaded ?? false;
  const aiReady = health?.openrouter_configured ?? false;

  const switchTab = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'performance':
        return <PerformancePage />;
      case 'about':
        return <AboutPage />;
      case 'classifier':
      default:
        return <ClassifierPage onNavigateTab={switchTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#cbd7e2] text-[#231212] py-3 sm:py-6 px-2 sm:px-6 lg:px-10 flex flex-col justify-between selection:bg-[#e3e2f7] selection:text-[#231212]">
      {/* ─────────────────────────────────────────────────────────────
          MAIN FLOATING APPLICATION CANVAS (Ronas IT Design Frame)
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[32px] sm:rounded-[48px] shadow-2xl p-6 sm:p-10 lg:p-14 border border-white/60 mx-auto max-w-[1440px] w-full relative overflow-hidden flex-1 flex flex-col justify-between">
        {/* Subtle Decorative Floating Accent in Canvas Header */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#e3e2f7]/25 rounded-full blur-3xl pointer-events-none" />

        {/* ─────────────────────────────────────────────────────────────
            HEADER & NAVIGATION
        ────────────────────────────────────────────────────────────── */}
        <header className="relative z-20 pb-8 sm:pb-12 border-b border-[#231212]/10">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <button
              type="button"
              onClick={() => switchTab('classifier')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-[#231212] text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
                <span className="text-sm tracking-tighter">TT</span>
              </div>
              <div>
                <span className="block text-base sm:text-lg font-black tracking-tight uppercase text-[#231212]">
                  TicketTriage
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-[#231212]/50">
                  Automated Triage
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#f4f4f4] p-1.5 rounded-full border border-[#231212]/5 shadow-xs">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchTab(item.id)}
                    className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-[#231212] text-white shadow-xs'
                        : 'text-[#231212]/70 hover:text-[#231212] hover:bg-white/80'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Status / Action Pill */}
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-full border border-[#231212]/15 bg-[#f4f4f4] px-4 py-2 text-xs font-bold text-[#231212]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    modelReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="uppercase tracking-wider">
                  {modelReady ? 'Model 95.2% Online' : 'Model Standby'}
                </span>
              </div>

              {aiReady && (
                <div className="flex items-center gap-1.5 rounded-full bg-[#e3e2f7] px-3.5 py-2 text-xs font-bold text-[#231212]">
                  <Sparkles className="h-3 w-3 text-[#231212]" />
                  <span>AI Active</span>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-[#f4f4f4] border border-[#231212]/10 flex items-center justify-center text-[#231212]"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Drawer */}
          {menuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-[#231212]/10 space-y-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchTab(item.id)}
                  className={`w-full text-left rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === item.id
                      ? 'bg-[#231212] text-white'
                      : 'bg-[#f4f4f4] text-[#231212]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Offline Warning banner if backend not reached */}
        {!modelReady && health && (
          <div className="my-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900 flex items-center gap-2">
            <CircleAlert className="h-4 w-4 shrink-0 text-amber-700" />
            <span>
              Backend API is connecting on port 8000. Quick Classification and AI features will be
              available once the local server completes initialization.
            </span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ACTIVE PAGE BODY
        ────────────────────────────────────────────────────────────── */}
        <main className="py-8 sm:py-12 flex-1">{renderContent()}</main>

        {/* ─────────────────────────────────────────────────────────────
            FOOTER
        ────────────────────────────────────────────────────────────── */}
        <footer className="pt-8 sm:pt-12 border-t border-[#231212]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#231212]/50">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[#231212]">TicketTriage</span>
            <span>·</span>
            <span>TF-IDF + Logistic Regression (scikit-learn)</span>
            <span>·</span>
            <span>Google Gemini 2.0 Flash</span>
          </div>

          <div>
            <span>100% Deterministic ML prediction · Grounded AI explanations</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
