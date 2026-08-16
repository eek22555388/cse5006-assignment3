'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from './api-client';

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
  refresh: () => Promise<void>;
};

/**
 * Wraps any api-client call with consistent loading, error and refresh state.
 * Usage: const { data, loading, error, refresh } = useApi(() => api.getFeeds(), []);
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): State<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await run());
      setError(null);
      setStatus(200);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setStatus(e instanceof ApiError ? e.status : null);
    } finally {
      setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, status };
}