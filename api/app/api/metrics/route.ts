import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, error, corsHeaders } from '@/lib/api-helpers';
import { deriveFeedStatus, STALE_THRESHOLD_DAYS } from '@/lib/feed-status';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(_req: NextRequest) {
  try {
    const hourAgo = new Date(Date.now() - 3_600_000);
    const dayAgo = new Date(Date.now() - 86_400_000);

    const [
      totalRequests,
      requestsLastHour,
      requestsLastDay,
      distinctClients,
      byStatus,
      byPath,
      byClient,
      byFeedRaw,
      feeds,
      itemTotals,
      authorCount,
    ] = await Promise.all([
      prisma.requestLog.count(),
      prisma.requestLog.count({ where: { createdAt: { gte: hourAgo } } }),
      prisma.requestLog.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.requestLog.findMany({ distinct: ['clientIp'], select: { clientIp: true } }),
      prisma.requestLog.groupBy({ by: ['statusCode'], _count: { _all: true } }),
      prisma.requestLog.groupBy({
        by: ['path'],
        _count: { _all: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),
      prisma.requestLog.groupBy({
        by: ['clientIp'],
        _count: { _all: true },
        where: { clientIp: { not: null } },
        orderBy: { _count: { clientIp: 'desc' } },
        take: 10,
      }),
      prisma.requestLog.groupBy({
        by: ['feedId'],
        _count: { _all: true },
        where: { feedId: { not: null } },
      }),
      prisma.feed.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { items: true } },
          items: {
            where: { isActive: true },
            orderBy: { publishedAt: 'desc' },
            take: 1,
            select: { publishedAt: true },
          },
        },
      }),
      prisma.feedItem.groupBy({ by: ['isActive'], _count: { _all: true } }),
      prisma.author.count(),
    ]);

    const requestsByFeed = new Map(byFeedRaw.map((r) => [r.feedId, r._count._all]));

    const feedSummaries = await Promise.all(
      feeds.map(async (f) => {
        const activeItems = await prisma.feedItem.count({
          where: { feedId: f.id, isActive: true },
        });
        const latest = f.items[0]?.publishedAt ?? null;
        return {
          id: f.id,
          title: f.title,
          slug: f.slug,
          totalItems: f._count.items,
          activeItems,
          latestPublishedAt: latest?.toISOString() ?? null,
          requests: requestsByFeed.get(f.id) ?? 0,
          status: deriveFeedStatus(activeItems, latest),
        };
      })
    );

    const activeItems = itemTotals.find((t) => t.isActive)?._count._all ?? 0;
    const inactiveItems = itemTotals.find((t) => !t.isActive)?._count._all ?? 0;
    const errorRequests = byStatus
      .filter((s) => (s.statusCode ?? 0) >= 400)
      .reduce((sum, s) => sum + s._count._all, 0);

    return json({
      requests: {
        total: totalRequests,
        lastHour: requestsLastHour,
        lastDay: requestsLastDay,
        errors: errorRequests,
        errorRate: totalRequests ? +(errorRequests / totalRequests * 100).toFixed(1) : 0,
        byStatus: byStatus.map((s) => ({ status: s.statusCode, count: s._count._all })),
        byPath: byPath.map((p) => ({ path: p.path, count: p._count._all })),
        byClient: byClient.map((c) => ({ clientIp: c.clientIp, count: c._count._all })),
      },
      clients: { unique: distinctClients.filter((c) => c.clientIp !== null).length },
      content: {
        feeds: feeds.length,
        activeItems,
        inactiveItems,
        totalItems: activeItems + inactiveItems,
        authors: authorCount,
      },
      feedSummaries,
      thresholds: { staleAfterDays: STALE_THRESHOLD_DAYS },
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('GET /api/metrics failed:', e);
    return error('Server error', 500);
  }
}