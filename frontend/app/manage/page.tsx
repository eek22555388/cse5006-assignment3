'use client';

import { useManageData } from '../../lib/useManageData';
import FeedSection from '../components/manage/FeedSection';
import AuthorSection from '../components/manage/AuthorSection';
import ItemSection from '../components/manage/ItemSection';

export default function ManagePage() {
  const { feeds, authors, items, message, loading, mutate } = useManageData();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Manage content</h2>
      <p className="mb-6 text-slate-600 dark:text-slate-300">
        Create and remove feeds, authors and items on the RSS Server.
      </p>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-6 rounded border p-3 ${
            message.ok
              ? 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading && <p className="text-slate-500 mb-4">Loading…</p>}

      <FeedSection feeds={feeds} mutate={mutate} />
      <AuthorSection authors={authors} mutate={mutate} />
      <ItemSection feeds={feeds} authors={authors} items={items} mutate={mutate} />
    </div>
  );
}
