import React from 'react';
import { Layers, Bot, Route, Zap, ShieldCheck, Cpu } from 'lucide-react';
import CategoryBadge from '../components/CategoryBadge';

export default function AboutPage() {
  const categories = [
    {
      name: 'billing_issue',
      title: 'Billing Issue',
      dept: 'Billing Support',
      desc: 'Problems with credit cards, duplicate charges, subscription renewals, invoice requests, and refund inquiries.',
      example: '"My credit card was charged twice for invoice #4402 on the monthly Pro subscription."',
      cardBg: 'bg-[#fcedde]',
    },
    {
      name: 'account_problem',
      title: 'Account Problem',
      dept: 'Account Ops',
      desc: 'Login difficulties, password resets, two-factor authentication issues, email changes, and account merging.',
      example: '"Merge accounts and change email address for user from old domain to new corporate domain."',
      cardBg: 'bg-[#e2ebf4]',
    },
    {
      name: 'bug',
      title: 'Bug / Technical Defect',
      dept: 'Engineering Support',
      desc: 'Software errors, mobile app crashes, broken buttons, 500 error codes, and unintended app behavior.',
      example: '"The web app crashes with a blank screen whenever I click the save button on the user profile page."',
      cardBg: 'bg-[#fae5e5]',
    },
    {
      name: 'feature_request',
      title: 'Feature Idea',
      dept: 'Product Team',
      desc: 'Ideas for new capabilities, dark mode requests, export options, and general product improvements.',
      example: '"Can your team please consider adding a dark mode theme and custom color palettes in the next release?"',
      cardBg: 'bg-[#e3e2f7]',
    },
    {
      name: 'general_inquiry',
      title: 'General Inquiry',
      dept: 'Customer Care',
      desc: 'Questions about pricing plans, business hours, onboarding steps, and general platform questions.',
      example: '"What is the price for basic plan subscription, and what are the standard support response times?"',
      cardBg: 'bg-[#e5edd8]',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Title Header */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#e3e2f7] px-3.5 py-1 text-xs font-bold text-[#231212] uppercase tracking-wider">
          <Layers className="h-3.5 w-3.5" />
          <span>Architecture & Design</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#231212] leading-[0.95]">
          HOW TICKETPULSE <br />
          <span className="font-light italic tracking-normal">WORKS</span>
        </h1>
        <p className="text-sm sm:text-base text-[#231212]/70 max-w-2xl leading-relaxed pt-1">
          A clear, in-depth guide to how this project uses Natural Language Processing (NLP), Machine
          Learning, and Google Gemini AI to triage and route customer inquiries.
        </p>
      </section>

      {/* 3 Step Pipeline Bento Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Lavender #e3e2f7 */}
        <div className="rounded-[36px] bg-[#e3e2f7] p-8 space-y-4 border border-[#231212]/5 transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-white/80 border border-[#231212]/10 flex items-center justify-center font-bold font-mono text-sm text-[#231212]">
            01
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#231212]/50">
              Text to Features
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-[#231212]">
              TF-IDF Vectorization
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#231212]/75 leading-relaxed">
            Converts ticket vocabulary into 5,000 statistical features. Weighs distinctive keywords
            like <em>"invoice"</em>, <em>"crash"</em>, or <em>"password"</em> while filtering out
            common English stopwords.
          </p>
        </div>

        {/* Step 2: Crisp White */}
        <div className="rounded-[36px] bg-white p-8 space-y-4 border border-[#231212]/10 shadow-sm transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-[#f4f4f4] border border-[#231212]/10 flex items-center justify-center font-bold font-mono text-sm text-[#231212]">
            02
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#231212]/50">
              Probability Decision
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-[#231212]">
              Logistic Regression
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#231212]/75 leading-relaxed">
            A fast, convex multi-class model that computes calibrated probabilities across all 5
            categories in under 10ms. Runs 100% locally with zero GPU or cloud overhead.
          </p>
        </div>

        {/* Step 3: Pale Sage #e5edd8 */}
        <div className="rounded-[36px] bg-[#e5edd8] p-8 space-y-4 border border-[#231212]/5 transition-all hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-white/80 border border-[#231212]/10 flex items-center justify-center font-bold font-mono text-sm text-[#231212]">
            03
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#231212]/50">
              Team Routing & Brief
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-[#231212]">
              Gemini AI Augmentation
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#231212]/75 leading-relaxed">
            Determines the target support department instantly. In AI mode, Google Gemini provides a
            1-minute summary, linguistic rationale, and agent action steps without modifying the ML
            decision.
          </p>
        </div>
      </section>

      {/* 5 Categories & Where Tickets Go */}
      <section className="rounded-[40px] bg-white p-8 border border-[#231212]/10 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#231212] tracking-tight">
            The 5 Routing Categories
          </h2>
          <p className="text-xs text-[#231212]/60 mt-1">
            Each ticket is classified into one of these 5 categories and assigned to its tailored team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c) => (
            <div
              key={c.name}
              className={`rounded-3xl p-6 border border-[#231212]/10 space-y-3 transition-all hover:shadow-xs ${c.cardBg}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CategoryBadge category={c.name} size="md" />
                <span className="rounded-full bg-white/80 border border-[#231212]/10 px-3 py-1 text-xs font-bold uppercase text-[#231212]">
                  Target: {c.dept}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#231212]/80 leading-relaxed font-sans">{c.desc}</p>
              <div className="rounded-2xl bg-white/60 p-3 text-[11px] text-[#231212]/65 italic">
                {c.example}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="rounded-[40px] bg-white p-8 border border-[#231212]/10 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#231212] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#231212]/60 mt-1">
            Key architectural and operational decisions behind TicketPulse AI.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-[#f4f4f4] p-6 space-y-2 border border-[#231212]/5">
            <h3 className="text-sm font-bold uppercase text-[#231212]">
              Why Logistic Regression instead of a heavy Deep Learning transformer?
            </h3>
            <p className="text-xs sm:text-sm text-[#231212]/70 leading-relaxed">
              For structured, short-text customer support classification, TF-IDF paired with Logistic
              Regression is lightweight, runs in milliseconds, requires minimal memory, runs offline
              without costly GPU hardware, and achieves <strong>95.18% test accuracy</strong> on this
              corpus.
            </p>
          </div>

          <div className="rounded-3xl bg-[#f4f4f4] p-6 space-y-2 border border-[#231212]/5">
            <h3 className="text-sm font-bold uppercase text-[#231212]">
              Does the generative AI ever change or override the machine learning prediction?
            </h3>
            <p className="text-xs sm:text-sm text-[#231212]/70 leading-relaxed">
              No. The machine learning pipeline is the sole authority for classification, confidence
              scores, and departmental routing. The generative AI layer only summarizes the ticket and
              suggests resolution checklists for the human agent.
            </p>
          </div>

          <div className="rounded-3xl bg-[#f4f4f4] p-6 space-y-2 border border-[#231212]/5">
            <h3 className="text-sm font-bold uppercase text-[#231212]">
              How does the system ensure data privacy?
            </h3>
            <p className="text-xs sm:text-sm text-[#231212]/70 leading-relaxed">
              In Quick Classification mode, all text is processed 100% locally on the backend
              server—nothing is sent over the internet. In AI Explanation mode, only the ticket text is
              sent to the configured provider API (Google Gemini or OpenRouter). Users are reminded
              never to enter sensitive passwords or credit card numbers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
