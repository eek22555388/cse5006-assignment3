import { test, expect, request } from '@playwright/test';

const API = process.env.TEST_API ?? 'http://localhost:4080';

/**
 * Server use case: full CRUD lifecycle for an RSS feed, exercised directly
 * against the API rather than through the UI.
 */
test.describe('RSS Server — feed CRUD', () => {
  test('creates, reads, updates and deletes a feed', async () => {
    const api = await request.newContext();
    const title = `Playwright Test Feed ${Date.now()}`;

    // CREATE
    const created = await api.post(`${API}/api/feeds`, {
      data: { title, description: 'Created by an automated test' },
    });
    expect(created.status()).toBe(201);
    const feed = await created.json();
    expect(feed.title).toBe(title);
    expect(feed.slug).toBeTruthy();

    // READ — appears in the collection
    const list = await api.get(`${API}/api/feeds`);
    expect(list.ok()).toBeTruthy();
    const feeds = await list.json();
    expect(feeds.some((f: { id: string }) => f.id === feed.id)).toBeTruthy();

    // READ — retrievable by id
    const one = await api.get(`${API}/api/feeds?id=${feed.id}`);
    expect(one.ok()).toBeTruthy();
    expect((await one.json()).title).toBe(title);

    // CREATE an item inside it
    const item = await api.post(`${API}/api/items`, {
      data: { feedId: feed.id, title: 'Test item', summary: 'Published by test' },
    });
    expect(item.status()).toBe(201);
    const itemBody = await item.json();

    // UPDATE — withdraw the item (soft delete)
    const patched = await api.patch(`${API}/api/items?id=${itemBody.id}`, {
      data: { isActive: false },
    });
    expect(patched.ok()).toBeTruthy();
    expect((await patched.json()).isActive).toBe(false);

    // DELETE the feed
    const deleted = await api.delete(`${API}/api/feeds?id=${feed.id}`);
    expect(deleted.status()).toBe(204);

    // VERIFY it is gone
    const gone = await api.get(`${API}/api/feeds?id=${feed.id}`);
    expect(gone.status()).toBe(404);

    await api.dispose();
  });

  test('rejects a feed with no title', async () => {
    const api = await request.newContext();
    const res = await api.post(`${API}/api/feeds`, { data: { description: 'no title' } });
    expect(res.status()).toBe(400);
    await api.dispose();
  });

  test('health endpoint reports 200 and a database connection', async () => {
    const api = await request.newContext();
    const res = await api.get(`${API}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
    await api.dispose();
  });
});