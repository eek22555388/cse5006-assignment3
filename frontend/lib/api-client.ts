import type { Author, Feed, FeedItem, NewAuthor, NewFeed, NewFeedItem } from './types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4080';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiError(0, 'Could not reach the RSS Server');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || `Server returned ${res.status}`);
  }

  return res.status === 204 ? (null as T) : (res.json() as Promise<T>);
}

const jsonPost = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  // Feeds
  getFeeds: () => request<Feed[]>('/api/feeds'),
  getFeed: (id: string) => request<Feed & { items: FeedItem[] }>(`/api/feeds?id=${id}`),
  createFeed: (data: NewFeed) => request<Feed>('/api/feeds', jsonPost(data)),
  deleteFeed: (id: string) => request<null>(`/api/feeds?id=${id}`, { method: 'DELETE' }),

  // Items
  getItems: (feedId?: string) =>
    request<FeedItem[]>(`/api/items${feedId ? `?feedId=${feedId}` : ''}`),
  getItem: (id: string) => request<FeedItem>(`/api/items?id=${id}`),
  createItem: (data: NewFeedItem) => request<FeedItem>('/api/items', jsonPost(data)),
  setItemActive: (id: string, isActive: boolean) =>
    request<FeedItem>(`/api/items?id=${id}`, {
      ...jsonPost({ isActive }),
      method: 'PATCH',
    }),
  deleteItem: (id: string) => request<null>(`/api/items?id=${id}`, { method: 'DELETE' }),

  // Authors
  getAuthors: () => request<Author[]>('/api/authors'),
  createAuthor: (data: NewAuthor) => request<Author>('/api/authors', jsonPost(data)),
  deleteAuthor: (id: string) => request<null>(`/api/authors?id=${id}`, { method: 'DELETE' }),
  setAuthorActive: (id: string, isActive: boolean) =>
    request<Author>(`/api/authors?id=${id}`, {
      ...jsonPost({ isActive }),
      method: 'PATCH',
    }),
};