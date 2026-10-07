import React from 'react';

const CATEGORY_STYLES = {
  billing_issue: {
    label: 'Billing Issue',
    dept: 'Billing Support',
    dot: 'bg-[#e59866]',
    surface: 'bg-[#fcedde] text-[#231212] border-[#edd0be]',
    accentBg: 'bg-[#fcedde]',
  },
  account_problem: {
    label: 'Account Access',
    dept: 'Account Ops',
    dot: 'bg-[#6ba4e8]',
    surface: 'bg-[#e2ebf4] text-[#231212] border-[#c8d9e8]',
    accentBg: 'bg-[#e2ebf4]',
  },
  bug: {
    label: 'Technical Bug',
    dept: 'Engineering Support',
    dot: 'bg-[#e06666]',
    surface: 'bg-[#fae5e5] text-[#231212] border-[#f2c6c6]',
    accentBg: 'bg-[#fae5e5]',
  },
  feature_request: {
    label: 'Feature Idea',
    dept: 'Product Team',
    dot: 'bg-[#988be0]',
    surface: 'bg-[#e3e2f7] text-[#231212] border-[#cfcde8]',
    accentBg: 'bg-[#e3e2f7]',
  },
  general_inquiry: {
    label: 'General Inquiry',
    dept: 'Customer Care',
    dot: 'bg-[#82b882]',
    surface: 'bg-[#e5edd8] text-[#231212] border-[#cde0be]',
    accentBg: 'bg-[#e5edd8]',
  },
};

export default function CategoryBadge({ category, size = 'md', invert = false, showDept = false }) {
  const item = CATEGORY_STYLES[category] || {
    label: category ? category.replace('_', ' ') : 'General',
    dept: 'General Support',
    dot: 'bg-[#231212]',
    surface: 'bg-[#f4f4f4] text-[#231212] border-[#e2e2e2]',
    accentBg: 'bg-[#f4f4f4]',
  };

  const sizing =
    size === 'lg'
      ? 'px-4 py-1.5 text-xs'
      : size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px]'
      : 'px-3 py-1 text-xs';

  if (invert) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 font-medium text-white backdrop-blur-xs ${sizing}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#e3e2f7]" />
        <span>{item.label}</span>
        {showDept && <span className="opacity-60">· {item.dept}</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-semibold transition-all ${item.surface} ${sizing}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      <span>{item.label}</span>
      {showDept && <span className="text-[#231212]/60 font-normal">→ {item.dept}</span>}
    </span>
  );
}

export { CATEGORY_STYLES };
