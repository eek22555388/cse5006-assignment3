import type { FeedStatus } from '../../../lib/types';

const styles: Record<FeedStatus, string> = {
  healthy: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  stale: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  empty: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

const labels: Record<FeedStatus, string> = {
  healthy: 'Healthy',
  stale: 'Stale',
  empty: 'Empty',
};

export default function StatusBadge({ status }: { status: FeedStatus }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}