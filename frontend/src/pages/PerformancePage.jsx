import React, { useEffect, useState } from 'react';
import { Activity, CircleAlert, Database, Loader2, ShieldCheck, Target, BarChart2 } from 'lucide-react';
import { getMetrics } from '../api/client';
import CategoryBadge from '../components/CategoryBadge';

export default function PerformancePage() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadMetrics() {
      try {
        const data = await getMetrics();
        if (active) setMetrics(data);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Unable to load model metrics.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadMetrics();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-[36px] bg-white border border-[#231212]/10 p-12">
        <div className="flex items-center gap-3 text-sm font-medium text-[#231212]/70">
          <Loader2 className="h-5 w-5 animate-spin text-[#231212]" />
          <span>Computing held-out model evaluation metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <section className="rounded-[36px] border border-amber-200 bg-amber-50 p-8 text-amber-950">
        <div className="flex items-center gap-2 font-bold text-base">
          <CircleAlert className="h-5 w-5" />
          <span>Metrics Service Offline</span>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-amber-800 leading-relaxed">{error}</p>
      </section>
    );
  }

  const headlineMetrics = [
    {
      label: 'Test Accuracy',
      value: `${(metrics.accuracy * 100).toFixed(2)}%`,
      note: '158 of 166 correct on unseen tickets',
      cardBg: 'bg-[#e3e2f7]',
      icon: Target,
    },
    {
      label: 'Macro F1-Score',
      value: metrics.macro_f1.toFixed(4),
      note: 'Balanced quality across all 5 classes',
      cardBg: 'bg-white',
      icon: Activity,
    },
    {
      label: 'Macro ROC-AUC',
      value: metrics.roc_auc_macro.toFixed(4),
      note: 'Separation margin between classes',
      cardBg: 'bg-[#e5edd8]',
      icon: ShieldCheck,
    },
    {
      label: 'Held-Out Test Set',
      value: `${metrics.test_size}`,
      note: '20% stratified test split',
      cardBg: 'bg-[#f4f4f4]',
      icon: Database,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Page Heading */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#e3e2f7] px-3.5 py-1 text-xs font-bold text-[#231212] uppercase tracking-wider">
          <BarChart2 className="h-3.5 w-3.5" />
          <span>Empirical Evaluation</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#231212] leading-[0.95]">
          MODEL QUALITY & <br />
          <span className="font-light italic tracking-normal">BENCHMARKS</span>
        </h1>
        <p className="text-sm sm:text-base text-[#231212]/70 max-w-2xl leading-relaxed pt-1">
          Honest evaluation results calculated on an unseen 20% stratified test split (166 tickets).
          Deduplicated to remove 1,174 repeated templates, preventing artificial test inflation.
        </p>
      </section>

      {/* Headline Metric Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {headlineMetrics.map(({ label, value, note, cardBg, icon: Icon }) => (
          <article
            key={label}
            className={`rounded-[32px] p-6 border border-[#231212]/5 shadow-xs space-y-3 ${cardBg} transition-all hover:-translate-y-1`}
          >
            <div className="w-10 h-10 rounded-full bg-white/80 border border-[#231212]/10 flex items-center justify-center text-[#231212]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-[#231212] tracking-tight">
                {value}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#231212]/60">
                {label}
              </div>
              <p className="mt-1 text-[11px] text-[#231212]/50 leading-relaxed">{note}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Dataset Splitting & Per-Category Breakdown */}
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Dark Card: Split Methodology */}
        <article className="rounded-[40px] bg-[#231212] p-8 text-white space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e3e2f7] uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Honest Evaluation Protocol</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Duplicates Removed Before Train/Test Split
          </h2>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Many ticket benchmarks suffer from data contamination because repetitive templates appear
            in both training and test sets. By performing full text deduplication first, our 95.18%
            accuracy reflects genuine generalization on new customer phrasing.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3e2f7]">
                Raw Records
              </div>
              <div className="mt-1 text-2xl font-black font-mono text-white">
                {metrics.raw_size}
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3e2f7]">
                Unique Corpus
              </div>
              <div className="mt-1 text-2xl font-black font-mono text-white">
                {metrics.total_deduplicated_size}
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3e2f7]">
                Train Split (80%)
              </div>
              <div className="mt-1 text-2xl font-black font-mono text-white">
                {metrics.train_size}
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3e2f7]">
                Test Split (20%)
              </div>
              <div className="mt-1 text-2xl font-black font-mono text-white">
                {metrics.test_size}
              </div>
            </div>
          </div>
        </article>

        {/* Per-Category Table / Cards */}
        <article className="rounded-[40px] bg-white p-8 border border-[#231212]/10 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-[#231212] tracking-tight">
              Performance By Category
            </h2>
            <p className="text-xs text-[#231212]/60 mt-1">
              Precision indicates correctness when predicted; Recall indicates detection rate of real
              tickets.
            </p>
          </div>

          <div className="space-y-3">
            {metrics.per_class_metrics.map((row) => (
              <div
                key={row.category}
                className="rounded-2xl bg-[#f4f4f4] p-4 border border-[#231212]/5 transition-all hover:border-[#231212]/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CategoryBadge category={row.category} size="md" />
                  <span className="text-xs font-mono font-bold text-[#231212]/60">
                    {row.support} test tickets
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#231212]/5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#231212]/50">
                      Precision
                    </div>
                    <div className="text-sm font-mono font-black text-[#231212] mt-0.5">
                      {(row.precision * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#231212]/50">
                      Recall
                    </div>
                    <div className="text-sm font-mono font-black text-[#231212] mt-0.5">
                      {(row.recall * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#231212]/50">
                      F1-Score
                    </div>
                    <div className="text-sm font-mono font-black text-[#231212] mt-0.5">
                      {row.f1_score.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Confusion Matrix Section */}
      <section className="rounded-[40px] bg-white p-8 border border-[#231212]/10 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-[#231212] tracking-tight">
            Confusion Matrix (Unseen Test Set)
          </h2>
          <p className="text-xs text-[#231212]/60 mt-1">
            Rows represent ground-truth labels; columns represent model predictions. The diagonal
            shows correct classifications.
          </p>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="min-w-[650px] w-full border-separate border-spacing-2 text-center text-xs">
            <thead>
              <tr>
                <th className="p-3 text-left font-bold text-[#231212]/60 uppercase text-[11px]">
                  Actual \ Predicted
                </th>
                {metrics.classes.map((name) => (
                  <th
                    key={name}
                    className="p-3 font-bold text-[#231212] uppercase text-[11px] tracking-wider"
                  >
                    {name.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.confusion_matrix.map((row, rowIndex) => (
                <tr key={metrics.classes[rowIndex]}>
                  <th className="p-3 text-left font-bold text-[#231212] uppercase text-[11px] tracking-wider">
                    {metrics.classes[rowIndex].replace('_', ' ')}
                  </th>
                  {row.map((count, colIndex) => {
                    const isDiagonal = rowIndex === colIndex;
                    return (
                      <td
                        key={colIndex}
                        className={`rounded-2xl p-4 font-mono font-black text-sm transition-all ${
                          isDiagonal
                            ? 'bg-[#e5edd8] text-[#231212] border border-[#cde0be]'
                            : count > 0
                            ? 'bg-[#fcedde] text-[#231212] border border-[#edd0be]'
                            : 'bg-[#f4f4f4] text-[#231212]/30'
                        }`}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
