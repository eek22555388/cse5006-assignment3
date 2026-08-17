import type { ReactNode } from 'react';

export default function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
}) {
  const tones = {
    neutral: 'border-slate-200 dark:border-slate-600',
    good: 'border-green-400 dark:border-green-500',
    warn: 'border-amber-400 dark:border-amber-500',
    bad: 'border-red-400 dark:border-red-500',
  };

  return (
    <div
      className={`rounded-lg border-l-4 border ${tones[tone]} p-4 bg-white dark:bg-slate-800`}
    >
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-2xl font-bold mt-1 ml-0">{value}</dd>
      {hint && <dd className="text-xs text-slate-500 mt-1 ml-0">{hint}</dd>}
    </div>
  );
}