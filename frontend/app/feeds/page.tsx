'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import { api, API_BASE } from '../../lib/api-client';
import { useApi } from '../../lib/useApi';

export default function FeedsPage() {
  const [selectedFeed, setSelectedFeed] = useState<string>('');
  const { layout } = useTheme();

  const feedsState = useApi(() => api.getFeeds(), []);
  const itemsState = useApi(() => api.getItems(selectedFeed || undefined), [selectedFeed]);

  const feeds = feedsState.data ?? [];
  const items = itemsState.data ?? [];
  const { loading, error, status } = itemsState;

  const errorMessage =
    status === 0
      ? 'The RSS Server is unreachable. Check the API container is running.'
      : status === 404
      ? 'That feed no longer exists.'
      : error;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">RSS Client</h2>
      <p className="mb-6 text-slate-600 dark:text-slate-300">
        Live content fetched from the RSS Server at <code>{API_BASE}</code>.
      </p>

      <div className="mb-6">
        <label htmlFor="feed-select" className="block mb-2 font-medium">
          Filter by feed
        </label>
        <select
          id="feed-select"
          value={selectedFeed}
          onChange={(e) => setSelectedFeed(e.target.value)}
          className="border rounded px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600"
        >
          <option value="">All feeds</option>
          {feeds.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded border border-red-400 bg-red-50 dark:bg-red-900/30 p-4 text-red-800 dark:text-red-200"
        >
          <strong>Could not load feed:</strong> {errorMessage}
          <button
            onClick={() => itemsState.refresh()}
            className="ml-3 underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {loading && <p className="text-slate-500">Loading items…</p>}

      {!loading && !errorMessage && items.length === 0 && (
        <p role="status" className="text-slate-500">
          No items published yet.
        </p>
      )}

      <div className={layout === 'list' ? 'flex flex-col gap-4' : 'grid gap-4 md:grid-cols-2'}>
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border border-slate-200 dark:border-slate-600 p-4"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500 mb-2">
              {new Date(item.publishedAt).toLocaleDateString()}
              {item.author && <> · {item.author.name}</>}
              {item.category && <> · {item.category}</>}
            </p>
            {item.summary && (
              <p className="text-slate-700 dark:text-slate-300">{item.summary}</p>
            )}
            <Link
              href={`/feeds/${item.id}`}
              className="inline-block mt-3 text-blue-600 dark:text-blue-400 underline"
            >
              Read more
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}