export type FeedStatus = 'healthy' | 'stale' | 'empty';

const STALE_AFTER_DAYS = 30;

/**
 * Feed has no isActive column, so status is derived from its item history.
 * Keeping this in one function means the dashboard and any future alerting
 * agree on what "stale" means.
 */
export function deriveFeedStatus(activeItemCount: number, latestPublishedAt: Date | null): FeedStatus {
  if (activeItemCount === 0 || !latestPublishedAt) return 'empty';

  const ageDays = (Date.now() - latestPublishedAt.getTime()) / 86_400_000;
  return ageDays > STALE_AFTER_DAYS ? 'stale' : 'healthy';
}

export const STALE_THRESHOLD_DAYS = STALE_AFTER_DAYS;