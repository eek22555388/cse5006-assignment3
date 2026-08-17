import { prisma } from '../lib/prisma';

const AUTHORS = [
  { name: 'Dr Tony de Souza-Daw', email: 'tony@example.edu.au' },
  { name: 'CSE5006 Teaching Team', email: 'teaching@example.edu.au' },
  { name: 'Student Newsroom', email: 'news@example.edu.au' },
];

const FEEDS = [
  {
    title: 'CSE5006 Subject Announcements',
    description: 'Weekly updates, deadlines and workshop notes.',
    siteUrl: 'https://www.latrobe.edu.au/',
    itemCount: 12,
    category: 'Announcements',
  },
  {
    title: 'La Trobe Campus News',
    description: 'General university news and events.',
    siteUrl: 'https://www.latrobe.edu.au/news',
    itemCount: 8,
    category: 'Campus',
  },
  {
    title: 'Web Development Reading List',
    description: 'Curated articles on Next.js, React and web architecture.',
    itemCount: 10,
    category: 'Reading',
  },
  {
    // Deliberately stale: nothing published for months.
    title: 'Archived 2025 Notices',
    description: 'Retained for reference. No longer updated.',
    itemCount: 4,
    category: 'Archive',
    staleDays: 200,
  },
  {
    // Deliberately empty: exercises the "empty feed" alert.
    title: 'Placeholder Feed',
    description: 'Created but never populated.',
    itemCount: 0,
    category: 'Test',
  },
];

const TITLES = [
  'Workshop materials now available',
  'Assessment deadline reminder',
  'Guest lecture: observability in production systems',
  'Lab room change for this week',
  'Reading: understanding HTTP caching',
  'Docker troubleshooting drop-in session',
  'Results released for the mid-semester quiz',
  'Campus network maintenance window',
  'New tutorial recordings uploaded',
  'Student showcase submissions open',
  'Library extended hours during exams',
  'Accessibility guidelines for web projects',
];

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000);
}

async function main() {
  console.log('Seeding…');

  const authors = [];
  for (const a of AUTHORS) {
    authors.push(
      await prisma.author.upsert({
        where: { email: a.email },
        update: {},
        create: a,
      })
    );
  }
  console.log(`  ${authors.length} authors`);

  let itemsCreated = 0;

  for (const f of FEEDS) {
    const slug = f.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const feed = await prisma.feed.upsert({
      where: { slug },
      update: {},
      create: {
        title: f.title,
        slug,
        description: f.description,
        siteUrl: f.siteUrl ?? null,
      },
    });

    for (let i = 0; i < f.itemCount; i++) {
      const guid = `seed-${slug}-${i}`;
      const offset = (f.staleDays ?? 0) + i * 3;

      await prisma.feedItem.upsert({
        where: { guid },
        update: {},
        create: {
          guid,
          feedId: feed.id,
          authorId: authors[i % authors.length].id,
          title: `${TITLES[i % TITLES.length]}`,
          summary: `Summary for "${TITLES[i % TITLES.length]}" in ${f.title}.`,
          content:
            `This is seeded content generated for testing and demonstration.\n\n` +
            `It belongs to the "${f.title}" feed and exists so the dashboard, ` +
            `Playwright tests and load tests have realistic data to work against.`,
          link: f.siteUrl ?? null,
          imageUrl: `https://picsum.photos/seed/${guid}/600/400`,
          category: f.category,
          publishedAt: daysAgo(offset),
          // Withdraw roughly one item per feed to exercise soft-delete.
          isActive: !(i === 2 && f.itemCount > 5),
        },
      });
      itemsCreated++;
    }

    console.log(`  ${feed.title}: ${f.itemCount} items`);
  }

  console.log(`Done. ${itemsCreated} items across ${FEEDS.length} feeds.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })