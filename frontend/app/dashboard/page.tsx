'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api-client';
import { useApi } from '../../lib/useApi';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import BarList from '../components/dashboard/BarList';

/** ::ffff:1.2.3.4 → 1.2.3.4 for display only. */
const tidyIp = (ip: string | null) =>
  ip ? ip.replace(/^::ffff:/, '').replace(/^::1$/, 'localhost') : 'unknown';

export default function DashboardPage() {
  const metricsState = useApi(() => api.getMetrics(), []);
  const healthState = useApi(() => api.getHealth(), []);

  const m = metricsState.data;
  const health = healthState.data;

  // Poll every 15s so the dashboard is live during the demo.
  useEffect(() => {
    const id = setInterval(() => {
      metricsState.refresh();
      healthState.refresh();
    }, 15_000);
    return () => clearInterval(id);
  }, [metricsState.refresh, healthState.refresh]);

  const emptyFeeds = m?.feedSummaries.filter((f) => f.status === 'empty') ?? [];
  const staleFeeds = m?.feedSummaries.filter((f) => f.status === 'stale') ?? [];
  const serverDown = healthState.status === 0 || health?.status === 'degraded';

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Operations dashboard</h2>
      <p className="mb-6 text-slate-600 dark:text-slate-300">
        Live metrics from the RSS Server, refreshed every 15 seconds.
        {m && (
          <span className="block text-sm text-slate-500 mt-1">
            Last updated {new Date(m.generatedAt).toLocaleTimeString()}
          </span>
        )}
      </p>

      {/* Alerts */}
      <div className="space-y-3 mb-8" aria-live="polite">
        {serverDown && (
          <div role="alert" className="rounded border border-red-400 bg-red-50 dark:bg-red-900/30 p-4 text-red-800 dark:text-red-200">
            <strong>Server unhealthy.</strong>{' '}
            {health?.database === 'unreachable'
              ? 'The API is running but cannot reach the database.'
              : 'The RSS Server is not responding.'}
          </div>
        )}
        {emptyFeeds.length > 0 && (
          <div role="alert" className="rounded border border-red-400 bg-red-50 dark:bg-red-900/30 p-4 text-red-800 dark:text-red-200">
            <strong>{emptyFeeds.length} empty feed{emptyFeeds.length > 1 ? 's' : ''}:</strong>{' '}
            {emptyFeeds.map((f) => f.title).join(', ')} — published but containing no active items.
          </div>
        )}
        {staleFeeds.length > 0 && (
          <div role="alert" className="rounded border border-amber-400 bg-amber-50 dark:bg-amber-900/30 p-4 text-amber-800 dark:text-amber-200">
            <strong>{staleFeeds.length} stale feed{staleFeeds.length > 1 ? 's' : ''}:</strong>{' '}
            nothing published in over {m?.thresholds.staleAfterDays} days.
          </div>
        )}
        {m && m.requests.errorRate > 5 && (
          <div role="alert" className="rounded border border-amber-400 bg-amber-50 dark:bg-amber-900/30 p-4 text-amber-800 dark:text-amber-200">
            <strong>Elevated error rate:</strong> {m.requests.errorRate}% of requests returned 4xx or 5xx.
          </div>
        )}
      </div>

      {metricsState.loading && !m && <p className="text-slate-500">Loading metrics…</p>}

      {metricsState.error && !m && (
        <div role="alert" className="rounded border border-red-400 bg-red-50 dark:bg-red-900/30 p-4 text-red-800 dark:text-red-200">
          Could not load metrics: {metricsState.error}
          <button onClick={() => metricsState.refresh()} className="ml-3 underline font-medium">
            Retry
          </button>
        </div>
      )}

      {m && (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              label="Server health"
              value={health?.status === 'ok' ? 'Healthy' : 'Degraded'}
              hint={health?.latencyMs != null ? `DB responded in ${health.latencyMs}ms` : undefined}
              tone={health?.status === 'ok' ? 'good' : 'bad'}
            />
            <StatCard label="Total requests" value={m.requests.total.toLocaleString()} hint={`${m.requests.lastHour} in the last hour`} />
            <StatCard label="Unique clients" value={m.clients.unique} hint="Distinct client IPs seen" />
            <StatCard
              label="Error rate"
              value={`${m.requests.errorRate}%`}
              hint={`${m.requests.errors} of ${m.requests.total} requests`}
              tone={m.requests.errorRate > 5 ? 'bad' : m.requests.errorRate > 1 ? 'warn' : 'good'}
            />
            <StatCard label="RSS feeds" value={m.content.feeds} hint={`${emptyFeeds.length} empty, ${staleFeeds.length} stale`} tone={emptyFeeds.length ? 'warn' : 'neutral'} />
            <StatCard label="Active items" value={m.content.activeItems} hint={`${m.content.inactiveItems} withdrawn`} />
            <StatCard label="Authors" value={m.content.authors} />
            <StatCard label="Requests (24h)" value={m.requests.lastDay.toLocaleString()} />
          </dl>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <BarList title="Requests per endpoint" rows={m.requests.byPath.map((p) => ({ label: p.path, count: p.count }))} />
            <BarList title="Requests per client" rows={m.requests.byClient.map((c) => ({ label: tidyIp(c.clientIp), count: c.count }))} />
          </div>

          <section className="rounded-lg border border-slate-200 dark:border-slate-600 p-5 mb-8">
            <h3 className="text-lg font-semibold mb-3">Feed status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">RSS feeds with item counts, request counts and health status</caption>
                <thead>
                  <tr className="text-left border-b dark:border-slate-600">
                    <th scope="col" className="py-2">Feed</th>
                    <th scope="col" className="py-2">Status</th>
                    <th scope="col" className="py-2 text-right">Active items</th>
                    <th scope="col" className="py-2 text-right">Requests</th>
                    <th scope="col" className="py-2">Last published</th>
                  </tr>
                </thead>
                <tbody>
                  {m.feedSummaries.map((f) => (
                    <tr key={f.id} className="border-b last:border-0 dark:border-slate-700">
                      <th scope="row" className="py-2 font-medium text-left">
                        <Link href={`/feeds`} className="hover:underline">{f.title}</Link>
                      </th>
                      <td className="py-2"><StatusBadge status={f.status} /></td>
                      <td className="py-2 text-right tabular-nums">{f.activeItems} / {f.totalItems}</td>
                      <td className="py-2 text-right tabular-nums">{f.requests}</td>
                      <td className="py-2 text-slate-500">
                        {f.latestPublishedAt ? new Date(f.latestPublishedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <BarList title="Responses by status code" rows={m.requests.byStatus.map((s) => ({ label: String(s.status ?? 'unknown'), count: s.count }))} />
        </>
      )}
    </div>
  );
}