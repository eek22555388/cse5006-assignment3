// Mirrors api/prisma/schema.prisma — single source of truth for the frontend.

export type Author = {
  id: string;
  name: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { items: number };
};

export type Feed = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  siteUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
};

export type FeedItem = {
  id: string;
  guid: string;
  feedId: string;
  authorId: string | null;
  title: string;
  summary: string | null;
  content: string | null;
  link: string | null;
  imageUrl: string | null;
  category: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  author: Author | null;
  feed?: Pick<Feed, 'id' | 'title' | 'slug'>;
};

// Payloads for creates — server generates id, guid, timestamps.
export type NewFeed = Pick<Feed, 'title'> &
  Partial<Pick<Feed, 'description' | 'siteUrl'>>;

export type NewAuthor = Pick<Author, 'name'> & Partial<Pick<Author, 'email'>>;

export type NewFeedItem = Pick<FeedItem, 'feedId' | 'title'> &
  Partial<Pick<FeedItem, 'summary' | 'content' | 'link' | 'imageUrl' | 'category' | 'authorId'>>;

export type FeedStatus = 'healthy' | 'stale' | 'empty';

export type FeedSummary = {
  id: string;
  title: string;
  slug: string;
  totalItems: number;
  activeItems: number;
  latestPublishedAt: string | null;
  requests: number;
  status: FeedStatus;
};

export type Metrics = {
  requests: {
    total: number;
    lastHour: number;
    lastDay: number;
    errors: number;
    errorRate: number;
    byStatus: { status: number | null; count: number }[];
    byPath: { path: string; count: number }[];
    byClient: { clientIp: string | null; count: number }[];
  };
  clients: { unique: number };
  content: {
    feeds: number;
    activeItems: number;
    inactiveItems: number;
    totalItems: number;
    authors: number;
  };
  feedSummaries: FeedSummary[];
  thresholds: { staleAfterDays: number };
  generatedAt: string;
};

export type Health = {
  status: 'ok' | 'degraded';
  database: 'connected' | 'unreachable';
  latencyMs?: number;
  uptimeSeconds?: number;
  timestamp: string;
};