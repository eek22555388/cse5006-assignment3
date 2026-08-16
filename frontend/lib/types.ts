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