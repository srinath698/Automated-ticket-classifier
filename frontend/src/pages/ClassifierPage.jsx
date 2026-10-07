import React, { useState } from 'react';
import {
  ArrowRight,
  RotateCcw,
  Zap,
  Sparkles,
  AlertCircle,
  CornerDownRight,
  ShieldCheck,
  Copy,
  Check,
  Bot,
} from 'lucide-react';
import ContextualChat from '../components/ContextualChat';
import ProbabilityBar from '../components/ProbabilityBar';
import CategoryBadge from '../components/CategoryBadge';
import { predictTicket, explainTicket } from '../api/client';

const BENCHMARKS = [
  {
    code: '01',
    label: 'Billing: Double Charge',
    icon: '💳',
    category: 'billing_issue',
    text: 'My credit card was charged twice for invoice #4402 on the monthly Pro subscription. Please reverse the duplicate charge.',
  },
  {
    code: '02',
    label: 'Bug: Web App Crash',
    icon: '⚡',
    category: 'bug',
    text: 'The web app crashes with a blank screen whenever I click the save button on the user profile page. Error code 500 in console.',
  },
  {
    code: '03',
    label: 'Feature: Dark Mode',
    icon: '✨',
    category: 'feature_request',
    text: 'Can your team please consider adding a dark mode theme and custom color palettes in the next dashboard release?',
  },
  {
    code: '04',
    label: 'Account: Email Merge',
    icon: '🔐',
    category: 'account_problem',
    text: 'Merge accounts and change email address for user from old domain to new corporate domain.',
  },
  {
    code: '05',
    label: 'General: Pricing Plans',
    icon: '💬',
    category: 'general_inquiry',
    text: 'What is the price for basic plan subscription, and what are the standard support response times?',
  },
];

export default function ClassifierPage({ onNavigateTab }) {
  const [ticketText, setTicketText] = useState(BENCHMARKS[0].text);
  const [mode, setMode] = useState('quick'); // 'quick' | 'enhanced'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);

  const charCount = ticketText.length;
  const isInputValid = charCount >= 3 && charCount <= 5000;

  const handleClassify = async (e) => {
    e?.preventDefault();
    if (!isInputValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'quick') {
        const res = await predictTicket(ticketText.trim());
        setPrediction(res);
        setExplanation(null);
      } else {
        const res = await explainTicket(ticketText.trim());
        setPrediction(res.prediction);
        setExplanation({
          ticket_summary: res.ticket_summary,
          explanation: res.explanation,
          suggested_next_steps: res.suggested_next_steps,
          llm_status: res.llm_status,
          llm_error: res.llm_error,
        });
      }
    } catch (err) {
      setError(err.message || 'Unable to classify ticket. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleClick = async (sample) => {
    setTicketText(sample.text);
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'quick') {
        const res = await predictTicket(sample.text);
        setPrediction(res);
        setExplanation(null);
      } else {
        const res = await explainTicket(sample.text);
        setPrediction(res.prediction);
        setExplanation({
          ticket_summary: res.ticket_summary,
          explanation: res.explanation,
          suggested_next_steps: res.suggested_next_steps,
          llm_status: res.llm_status,
          llm_error: res.llm_error,
        });
      }
    } catch (err) {
      setError(err.message || 'Unable to classify sample.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRouting = () => {
    if (!prediction) return;
    const payload = JSON.stringify(
      {
        ticket: ticketText,
        category: prediction.predicted_category,
        confidence: `${prediction.confidence_percentage}%`,
        department: prediction.recommended_routing.department,
        action: 'Routed via TicketTriage',
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setTicketText('');
    setPrediction(null);
    setExplanation(null);
    setError(null);
  };

  return (
    <div className="space-y-16">
      {/* ─────────────────────────────────────────────────────────────
          1. STATS BANNER (Top-right style from reference screenshots)
      ────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pt-2 pb-6 border-b border-[#231212]/10">
        <div>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#231212] tracking-tight">
            95.2%
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#231212]/60">
            TEST ACCURACY
          </div>
          <p className="mt-0.5 text-[11px] text-[#231212]/40">158 of 166 correct</p>
        </div>

        <div>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#231212] tracking-tight">
            166
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#231212]/60">
            TEST TICKETS
          </div>
          <p className="mt-0.5 text-[11px] text-[#231212]/40">Zero train-test leakage</p>
        </div>

        <div>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#231212] tracking-tight">
            5
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#231212]/60">
            SUPPORT TEAMS
          </div>
          <p className="mt-0.5 text-[11px] text-[#231212]/40">Billing, Tech, Accounts, etc.</p>
        </div>

        <div>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#231212] tracking-tight">
            &lt;10MS
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#231212]/60">
            INFERENCE SPEED
          </div>
          <p className="mt-0.5 text-[11px] text-[#231212]/40">100% Offline ML model</p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION & TICKET WORKSPACE
      ────────────────────────────────────────────────────────────── */}
      <section className="relative max-w-[900px] mx-auto w-full space-y-8">
        {/* Decorative Fluid Wavy Ribbon SVG in Background */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-35">
          <svg
            viewBox="0 0 1000 600"
            fill="none"
            className="w-full h-full text-[#e3e2f7]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-50 350 C 200 200, 350 480, 580 320 C 780 180, 950 450, 1100 280"
              stroke="#e3e2f7"
              strokeWidth="28"
              strokeLinecap="round"
              className="wavy-accent"
            />
            <path
              d="M-50 380 C 220 230, 370 510, 600 350 C 800 210, 970 480, 1120 310"
              stroke="#231212"
              strokeWidth="1.5"
              strokeOpacity="0.12"
              fill="none"
            />
          </svg>
        </div>

        {/* Centered Hero Heading & Description */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#231212] leading-[0.92]">
            SORT SUPPORT TICKETS <br />
            <span className="font-light italic tracking-normal text-[#231212]">IN SECONDS</span>
          </h1>
          <p className="text-sm sm:text-base text-[#231212]/70 max-w-2xl mx-auto leading-relaxed pt-1">
            Paste a customer message and get its category, a confidence score, and the
            right department to send it to. Optionally add an AI explanation and chat
            about the ticket.
          </p>
        </div>

        {/* Quick Preset Chips */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#231212]/50">
            <span>Try a sample ticket:</span>
            <span className="text-[11px] font-normal normal-case text-[#231212]/40">
              Click any to classify instantly
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {BENCHMARKS.map((sample) => (
              <button
                key={sample.code}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#231212]/15 bg-white px-3.5 py-1.5 text-xs font-medium text-[#231212] hover:bg-[#231212] hover:text-white hover:border-[#231212] transition-all shadow-xs"
              >
                <span>{sample.icon}</span>
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Input Card */}
        <div className="rounded-[32px] bg-[#f4f4f4] p-5 sm:p-6 border border-[#231212]/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#231212]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#231212]">
                Ticket Message
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#231212]/50">
              <span>{charCount} / 5,000</span>
              {ticketText && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="hover:text-[#231212] flex items-center gap-1 font-semibold transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={5}
            value={ticketText}
            onChange={(e) => setTicketText(e.target.value)}
            placeholder="Paste or type a customer support ticket here (e.g. 'I was charged twice on my credit card...')"
            className="w-full resize-none rounded-2xl bg-white p-4 text-sm sm:text-base leading-relaxed text-[#231212] placeholder:text-[#231212]/35 border border-[#231212]/10 focus:border-[#231212] focus:outline-none transition-all shadow-xs"
          />

          {/* Mode Selector & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {/* Mode Pills */}
            <div className="flex items-center gap-2 bg-white/70 p-1 rounded-full border border-[#231212]/10 w-fit">
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  mode === 'quick'
                    ? 'bg-[#231212] text-white shadow-xs'
                    : 'text-[#231212]/60 hover:text-[#231212]'
                }`}
                title="Local TF-IDF + Logistic Regression (Sub-10ms, 100% offline)"
              >
                Quick ML
              </button>
              <button
                type="button"
                onClick={() => setMode('enhanced')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  mode === 'enhanced'
                    ? 'bg-[#e3e2f7] text-[#231212] font-bold shadow-xs'
                    : 'text-[#231212]/60 hover:text-[#231212]'
                }`}
                title="Classification plus Gemini AI summary & next steps"
              >
                + AI Explanation
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleClassify}
              disabled={!isInputValid || isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#231212] px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-[#231212]/90 disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Classifying...</span>
                </>
              ) : (
                <>
                  <span>Classify & Route</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {mode === 'enhanced' && (
            <div className="rounded-2xl bg-[#e3e2f7]/50 border border-[#e3e2f7] px-4 py-2.5 text-[11px] text-[#231212]/80 flex items-center gap-2">
              <span className="font-bold text-[#231212] uppercase">[Notice]</span>
              <span>
                AI Explanation mode generates contextual summaries and step checklists. Quick ML
                runs 100% offline.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. FULL CLASSIFICATION RESULTS (Shown when analyzed)
      ────────────────────────────────────────────────────────────── */}
      {prediction && (
        <section className="space-y-6 pt-4 border-t border-[#231212]/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#231212]/50">
                Classification Complete
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#231212] tracking-tight mt-0.5">
                Routing Destination & Breakdown
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRouting}
                className="rounded-full border border-[#231212] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#231212] hover:bg-[#231212] hover:text-white transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Dispatch'}</span>
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Primary Result Card */}
            <div className="rounded-[36px] bg-white p-6 sm:p-8 border border-[#231212]/10 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#231212]/10 pb-5">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#231212]/50">
                    Predicted Class
                  </div>
                  <div className="text-3xl sm:text-4xl font-black uppercase text-[#231212] tracking-tight">
                    {prediction.predicted_category.replace('_', ' ')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#231212]/50">
                    Confidence
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-[#231212]">
                    {prediction.confidence_percentage}%
                  </div>
                </div>
              </div>

              {/* Department Proposal */}
              <div className="rounded-3xl bg-[#f4f4f4] p-5 space-y-2 border border-[#231212]/5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#231212]/50">
                  <span>Assigned Support Department</span>
                  <span>Deterministic Rule</span>
                </div>
                <div className="text-lg font-bold text-[#231212] flex items-center gap-2">
                  <CornerDownRight className="h-5 w-5 shrink-0 text-[#231212]" />
                  <span>ROUTE TO: {prediction.recommended_routing.department.toUpperCase()}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#231212]/70 leading-relaxed font-sans">
                  {prediction.recommended_routing.description}
                </p>
              </div>

              {/* Probability Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#231212]/50">
                  <span>Full Class Probabilities</span>
                  <span>5 Classes</span>
                </div>
                <ProbabilityBar
                  probabilities={prediction.probabilities}
                  predictedCategory={prediction.predicted_category}
                />
              </div>
            </div>

            {/* AI Explanation / Contextual Brief */}
            <div className="space-y-6">
              {explanation ? (
                <div className="rounded-[36px] bg-[#e3e2f7]/40 p-6 sm:p-8 border border-[#e3e2f7] shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#231212]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#231212]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#231212]">
                        AI Explanation Brief
                      </h3>
                    </div>
                    <span className="rounded-full bg-[#231212] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      Google Studio
                    </span>
                  </div>

                  {explanation.ticket_summary && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#231212]/50">
                        01 // 1-Minute Summary
                      </div>
                      <p className="rounded-2xl bg-white p-3 text-xs leading-relaxed text-[#231212]/80 border border-[#231212]/5">
                        {explanation.ticket_summary}
                      </p>
                    </div>
                  )}

                  {explanation.explanation && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#231212]/50">
                        02 // Model Rationale
                      </div>
                      <p className="rounded-2xl bg-white p-3 text-xs leading-relaxed text-[#231212]/80 border border-[#231212]/5">
                        {explanation.explanation}
                      </p>
                    </div>
                  )}

                  {explanation.suggested_next_steps?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#231212]/50">
                        03 // Agent Action Steps
                      </div>
                      <ul className="space-y-1.5">
                        {explanation.suggested_next_steps.map((step, idx) => (
                          <li
                            key={idx}
                            className="rounded-2xl bg-white p-2.5 text-xs text-[#231212]/80 flex items-start gap-2 border border-[#231212]/5 font-medium"
                          >
                            <span className="rounded-full bg-[#231212] text-white w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[36px] bg-[#f4f4f4] p-6 sm:p-8 border border-[#231212]/10 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#231212]">
                    Quick ML Mode Active
                  </div>
                  <p className="text-xs text-[#231212]/70 leading-relaxed">
                    This prediction ran entirely locally in under 10ms using Scikit-Learn TF-IDF +
                    Logistic Regression.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('enhanced');
                      handleClassify();
                    }}
                    className="rounded-full bg-[#231212] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#231212]/90 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Run AI Explanation</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contextual Interactive Chat Assistant */}
          <ContextualChat
            key={prediction.ticket_text}
            ticketText={prediction.ticket_text}
            predictedCategory={prediction.predicted_category}
            recommendedDepartment={prediction.recommended_routing.department}
            confidencePercentage={prediction.confidence_percentage}
          />
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. "WHY TEAMS CHOOSE US" BENTO CARDS (Direct from reference UI)
      ────────────────────────────────────────────────────────────── */}
      <section className="space-y-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#231212] tracking-tight">
              WHY SUPPORT TEAMS CHOOSE US
            </h2>
            <p className="text-xs sm:text-sm text-[#231212]/60 mt-1 max-w-xl">
              High-speed local machine learning paired with intelligent agent co-pilots.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#231212]/40">
              SCIKIT-LEARN · FASTAPI · REACT
            </span>
          </div>
        </div>

        {/* 3 Pastel Cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Lavender #e3e2f7 */}
          <div className="rounded-[36px] bg-[#e3e2f7] p-8 space-y-6 border border-[#231212]/5 relative overflow-hidden transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-white/80 border border-[#231212]/10 flex items-center justify-center text-[#231212]">
              <Zap className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#231212]">
                100% Offline ML Model
              </h3>
              <p className="text-xs sm:text-sm text-[#231212]/75 leading-relaxed">
                Zero network latency and total data privacy. Scikit-learn TF-IDF + Logistic
                Regression classifies tickets in under 10ms directly on your server without mandatory
                cloud dependencies.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold uppercase tracking-wider text-[#231212]">
              &lt; 10ms Response Time
            </div>
          </div>

          {/* Card 2: Pure White with Wavy SVG Doodle Ribbon */}
          <div className="rounded-[36px] bg-white p-8 space-y-6 border border-[#231212]/10 relative overflow-hidden transition-all hover:-translate-y-1 shadow-sm">
            {/* Soft background line doodle */}
            <svg
              className="absolute right-0 bottom-0 w-44 h-44 text-[#e3e2f7] -z-0 opacity-40 pointer-events-none"
              viewBox="0 0 200 200"
              fill="none"
            >
              <path
                d="M10 150 Q 80 50, 160 120 T 210 30"
                stroke="currentColor"
                strokeWidth="18"
                strokeLinecap="round"
              />
            </svg>

            <div className="w-14 h-14 rounded-full bg-[#f4f4f4] border border-[#231212]/10 flex items-center justify-center text-[#231212] relative z-10">
              <CornerDownRight className="h-6 w-6" />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#231212]">
                Deterministic Routing
              </h3>
              <p className="text-xs sm:text-sm text-[#231212]/75 leading-relaxed">
                Automated assignment maps categorized issues directly to Billing, Technical
                Support, Account Ops, Product, or Customer Care with zero guesswork.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold uppercase tracking-wider text-[#231212] relative z-10">
              5 Tailored Departments
            </div>
          </div>

          {/* Card 3: Pale Sage #e5edd8 */}
          <div className="rounded-[36px] bg-[#e5edd8] p-8 space-y-6 border border-[#231212]/5 relative overflow-hidden transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-white/80 border border-[#231212]/10 flex items-center justify-center text-[#231212]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#231212]">
                Google Gemini AI
              </h3>
              <p className="text-xs sm:text-sm text-[#231212]/75 leading-relaxed">
                Contextual plain-English summaries, linguistic rationale, and agent action
                checklists powered by Google AI Studio without ever overriding the ML classification.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold uppercase tracking-wider text-[#231212]">
              Grounded AI Explanations
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. COMMUNITY / TRAINED TICKETS BANNER (Bottom-left from reference)
      ────────────────────────────────────────────────────────────── */}
      <section className="rounded-[40px] bg-[#231212] text-white p-8 sm:p-12 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e3e2f7]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#e3e2f7]">
              <ShieldCheck className="h-4 w-4" />
              <span>Zero-Leakage Training Split</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
              JOIN 2,000+ TRAINED TICKETS
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Trained on a curated corpus of customer inquiries, deduplicated to remove 1,174
              repetitive templates. The classifier achieves 95.18% accuracy on unseen requests.
            </p>

            {/* Overlapping Avatar Bubbles */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {['#e59866', '#6ba4e8', '#e06666', '#82b882'].map((color, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-full border-2 border-[#231212] flex items-center justify-center text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: color }}
                  >
                    {['B', 'A', 'T', 'C'][idx]}
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#231212] bg-white text-[#231212] flex items-center justify-center text-[11px] font-black">
                  +2K
                </div>
              </div>
              <span className="text-xs font-medium text-white/60">
                166 Held-Out Evaluation Tickets
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('performance')}
                className="rounded-full bg-white text-[#231212] px-8 py-4 font-bold text-xs uppercase tracking-wider hover:bg-[#e3e2f7] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Inspect Model Quality</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
