import React from 'react';
import CategoryBadge from './CategoryBadge';

const BAR_STYLES = {
  billing_issue: 'bg-[#e59866]',
  account_problem: 'bg-[#6ba4e8]',
  bug: 'bg-[#e06666]',
  feature_request: 'bg-[#988be0]',
  general_inquiry: 'bg-[#82b882]',
};

export default function ProbabilityBar({ probabilities, predictedCategory, compact = false }) {
  if (!probabilities?.length) return null;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {probabilities.map((item) => {
        const isTop = item.category === predictedCategory;
        return (
          <div
            key={item.category}
            className={`group rounded-2xl transition-all duration-300 ${
              isTop
                ? 'bg-[#e3e2f7]/50 p-3 sm:p-3.5 border border-[#e3e2f7]'
                : 'p-2 sm:px-3 hover:bg-[#f4f4f4]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CategoryBadge category={item.category} size={compact ? 'sm' : 'md'} />
                {isTop && (
                  <span className="rounded-full bg-[#231212] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Primary Route
                  </span>
                )}
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#231212]">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#231212]/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isTop ? 'bg-[#231212]' : BAR_STYLES[item.category] || 'bg-[#231212]/40'
                }`}
                style={{ width: `${Math.max(item.percentage, 1.5)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
