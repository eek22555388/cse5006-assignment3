'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api-client';
import { useApi } from '../../../lib/useApi';

export default function ItemPage() {
  const params = useParams();
  const id = params?.id as string;

const { data: item, loading, error, status, refresh } = useApi(
    () => (id ? api.getItem(id) : Promise.resolve(null)),
    [id]
  );

  const errorMessage =
    status === 404
      ? 'That item could not be found. It may have been withdrawn.'
      : status === 0
      ? 'The RSS Server is unreachable.'
      : error;

  if (loading) return <p className="p-8 text-slate-500">Loading…</p>;

  if (errorMessage) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div
          role="alert"
          className="rounded border border-red-400 bg-red-50 dark:bg-red-900/30 p-4 text-red-800 dark:text-red-200"
        >
          {errorMessage}
          <button onClick={() => refresh()} className="ml-3 underline font-medium">
            Retry
          </button>
        </div>
        <Link href="/feeds" className="inline-block mt-4 text-blue-600 dark:text-blue-400 underline">
          Back to all items
        </Link>
      </div>
    );
  }

  if (!item) return null;

  return (
    <article className="p-8 max-w-3xl mx-auto">
      <nav className="text-sm mb-4 text-slate-500">
        <Link href="/feeds" className="hover:underline">Feeds</Link>
        {item.feed && <> / <span>{item.feed.title}</span></>}
      </nav>

      {item.imageUrl && (
        <img src={item.imageUrl} alt="" className="w-full max-h-80 object-cover rounded mb-6" />
      )}

      <h2 className="text-3xl font-bold mb-2">{item.title}</h2>

      <p className="text-sm text-slate-500 mb-6">
        {new Date(item.publishedAt).toLocaleDateString()}
        {item.author && <> · {item.author.name}</>}
        {item.category && <> · {item.category}</>}
      </p>

      {item.summary && (
        <p className="text-lg mb-6 text-slate-700 dark:text-slate-300">{item.summary}</p>
      )}

      {item.content ? (
        <div className="whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
          {item.content}
        </div>
      ) : (
        <p className="text-slate-500 italic">
          This item has no stored content. {item.link && 'Follow the source link below to read it.'}
        </p>
      )}

      {item.link && (
        <p className="mt-8">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline"
          >
            View original source ↗
          </a>
        </p>
      )}

      <p className="mt-8">
        <Link href="/feeds" className="text-blue-600 dark:text-blue-400 underline">
          ← Back to all items
        </Link>
      </p>
    </article>
  );
}