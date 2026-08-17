export default function BarList({
  title,
  rows,
  emptyText = 'No data yet.',
}: {
  title: string;
  rows: { label: string; count: number }[];
  emptyText?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <section className="rounded-lg border border-slate-200 dark:border-slate-600 p-5">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="truncate mr-3 font-mono">{r.label}</span>
                <span className="text-slate-500 tabular-nums">{r.count.toLocaleString()}</span>
              </div>
              <div
                className="h-2 rounded bg-slate-100 dark:bg-slate-700"
                role="meter"
                aria-valuenow={r.count}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={`${r.label}: ${r.count} requests`}
              >
                <div
                  className="h-2 rounded bg-blue-500 dark:bg-blue-400"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}