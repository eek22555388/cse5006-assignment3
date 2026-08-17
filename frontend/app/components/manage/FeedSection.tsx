'use client';

import { useState } from 'react';
import { api } from '../../../lib/api-client';
import type { Feed } from '../../../lib/types';
import type { Mutate } from '../../../lib/useManageData';
import { box, btn, card, row, linkDanger } from '../../../lib/ui';

export default function FeedSection({ feeds, mutate }: { feeds: Feed[]; mutate: Mutate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const add = async () => {
    if (!title.trim()) return;
    const ok = await mutate(
      () => api.createFeed({ title, description: description || null }),
      `Feed "${title}" created`
    );
    if (ok) {
      setTitle('');
      setDescription('');
    }
  };

  return (
    <section className={card}>
      <h3 className="text-xl font-semibold mb-3">Feeds</h3>
      <input
        className={box}
        placeholder="Feed title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className={box}
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button className={btn} onClick={add}>
        Add feed
      </button>

      <ul className="mt-4 space-y-2">
        {feeds.map((f) => (
          <li key={f.id} className={row}>
            <span>
              {f.title} <span className="text-slate-500">({f._count?.items ?? 0} items)</span>
            </span>
            <button
              className={linkDanger}
              onClick={() => mutate(() => api.deleteFeed(f.id), `Feed "${f.title}" deleted`)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}