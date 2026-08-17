'use client';

import { useState } from 'react';
import { api } from '../../../lib/api-client';
import type { Author, Feed, FeedItem } from '../../../lib/types';
import type { Mutate } from '../../../lib/useManageData';
import { box, btn, card, row, linkDanger } from '../../../lib/ui';

const EMPTY = {
  feedId: '',
  authorId: '',
  title: '',
  summary: '',
  content: '',
  link: '',
  imageUrl: '',
  category: '',
};

export default function ItemSection({
  feeds,
  authors,
  items,
  mutate,
}: {
  feeds: Feed[];
  authors: Author[];
  items: FeedItem[];
  mutate: Mutate;
}) {
  const [form, setForm] = useState(EMPTY);
  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const add = async () => {
    if (!form.feedId || !form.title.trim()) return;
    const ok = await mutate(
      () =>
        api.createItem({
          feedId: form.feedId,
          authorId: form.authorId || null,
          title: form.title,
          summary: form.summary || null,
          content: form.content || null,
          link: form.link || null,
          imageUrl: form.imageUrl || null,
          category: form.category || null,
        }),
      `Item "${form.title}" published`
    );
    if (ok) setForm((prev) => ({ ...EMPTY, feedId: prev.feedId, authorId: prev.authorId }));
  };

  return (
    <section className={card}>
      <h3 className="text-xl font-semibold mb-3">Items</h3>

      <label htmlFor="item-feed" className="block text-sm mb-1">Feed (required)</label>
      <select id="item-feed" className={box} value={form.feedId} onChange={set('feedId')}>
        <option value="">Select a feed…</option>
        {feeds.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
      </select>

      <label htmlFor="item-author" className="block text-sm mb-1">Author (optional)</label>
      <select id="item-author" className={box} value={form.authorId} onChange={set('authorId')}>
        <option value="">No author</option>
        {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      <input className={box} placeholder="Item title" value={form.title} onChange={set('title')} />
      <textarea className={box} placeholder="Summary" value={form.summary} onChange={set('summary')} />
      <textarea className={box} rows={6} placeholder="Full content (optional — shown on the item page)" value={form.content} onChange={set('content')} />
      <input className={box} placeholder="Link (optional)" value={form.link} onChange={set('link')} />
      <input className={box} placeholder="Image URL (optional)" value={form.imageUrl} onChange={set('imageUrl')} />
      <input className={box} placeholder="Category (optional)" value={form.category} onChange={set('category')} />
      <button className={btn} onClick={add}>Publish item</button>

      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li key={i.id} className={row}>
            <span>
              {i.title} <span className="text-slate-500">— {i.author?.name ?? 'no author'}</span>
            </span>
            <button
              className={linkDanger}
              onClick={() => mutate(() => api.deleteItem(i.id), `Item "${i.title}" withdrawn`)}
            >
              Withdraw
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}