'use client';

import { useState } from 'react';
import { api } from '../../../lib/api-client';
import type { Author } from '../../../lib/types';
import type { Mutate } from '../../../lib/useManageData';
import { box, btn, card, row, linkDanger, linkWarn } from '../../../lib/ui';

export default function AuthorSection({ authors, mutate }: { authors: Author[]; mutate: Mutate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const add = async () => {
    if (!name.trim()) return;
    const ok = await mutate(
      () => api.createAuthor({ name, email: email || null }),
      `Author "${name}" created`
    );
    if (ok) {
      setName('');
      setEmail('');
    }
  };

  return (
    <section className={card}>
      <h3 className="text-xl font-semibold mb-3">Authors</h3>
      <input className={box} placeholder="Author name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={box} type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className={btn} onClick={add}>Add author</button>

      <ul className="mt-4 space-y-2">
        {authors.map((a) => (
          <li key={a.id} className={row}>
            <span>
              {a.name} <span className="text-slate-500">({a._count?.items ?? 0} items)</span>
              {!a.isActive && (
                <span className="ml-2 text-amber-600 dark:text-amber-400">inactive</span>
              )}
            </span>
            <span className="space-x-3">
              <button
                className={linkWarn}
                onClick={() =>
                  mutate(
                    () => api.setAuthorActive(a.id, !a.isActive),
                    `${a.name} ${a.isActive ? 'deactivated' : 'reactivated'}`
                  )
                }
              >
                {a.isActive ? 'Deactivate' : 'Reactivate'}
              </button>
              <button
                className={linkDanger}
                onClick={() => mutate(() => api.deleteAuthor(a.id), `Author "${a.name}" deleted`)}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}