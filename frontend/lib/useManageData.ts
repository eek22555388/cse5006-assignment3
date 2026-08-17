'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api-client';
import type { Author, Feed, FeedItem } from './types';

export type Message = { text: string; ok: boolean } | null;
export type Mutate = (action: () => Promise<unknown>, okText: string) => Promise<boolean>;

export function useManageData() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [message, setMessage] = useState<Message>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [f, a, i] = await Promise.all([api.getFeeds(), api.getAuthors(), api.getItems()]);
      setFeeds(f);
      setAuthors(a);
      setItems(i);
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : 'Could not reach the RSS Server',
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Runs a write, reports the outcome, and reloads on success. */
  const mutate: Mutate = useCallback(
    async (action, okText) => {
      try {
        await action();
        setMessage({ text: okText, ok: true });
        await refresh();
        return true;
      } catch (e) {
        setMessage({ text: e instanceof Error ? e.message : 'Request failed', ok: false });
        return false;
      }
    },
    [refresh]
  );

  return { feeds, authors, items, message, loading, refresh, mutate };
}