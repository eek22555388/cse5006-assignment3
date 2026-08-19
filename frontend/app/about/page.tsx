export default function About() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">About This Project</h2>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Who made this</h3>
        <p className="text-slate-700 dark:text-slate-300">
          Created by Erdi Erden Kekec — Student Number 22555388, for CSE5006.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">What this is</h3>
        <p className="text-slate-700 dark:text-slate-300">
          Assessment 1 built the frontend. Assessment 2 added the backend — a
          PostgreSQL database, a REST API, an RSS 2.0 feed endpoint and Docker
          deployment. <strong>Assessment 3 makes it observable:</strong> an
          operations dashboard, database-backed metrics, alerting on unhealthy
          feeds, and automated end-to-end, load and accessibility testing.
        </p>
        <p className="text-slate-700 dark:text-slate-300">
          Assessment 1 built the frontend. <strong>Assessment 2 adds the backend:</strong>{' '}
          a PostgreSQL database, a REST API, an RSS 2.0 feed endpoint, and Docker
          deployment. The sample posts have been replaced by real records served
          from the database.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">How it works</h3>
        <p className="mb-3 text-slate-700 dark:text-slate-300">
          The system runs as three containers. The RSS Client is this interface.
          The RSS Server exposes the API and generates RSS XML. PostgreSQL stores
          feeds, items, authors and request metrics.
        </p>
        <p className="text-slate-700 dark:text-slate-300">
          Content is organised as feeds and items: a feed is a channel, and an
          item is a single post within it — the same structure an RSS document
          uses. Items can carry their content directly, or link out to an
          original source.
        </p>
      </section>

            <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Monitoring and testing</h3>
        <p className="mb-3 text-slate-700 dark:text-slate-300">
          Every API request is written to the database, so the dashboard reports
          real measured activity rather than in-memory counters that reset when a
          container restarts. Feed health is derived from item history at query
          time, which means it cannot drift out of step with the content.
        </p>
        <p className="text-slate-700 dark:text-slate-300">
          The project is covered by six Playwright end-to-end tests across the
          server and client use cases, JMeter load testing at five traffic levels,
          and Lighthouse accessibility audits scoring 100 on every main page.
        </p>
      </section>
      
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Walkthrough</h3>
         <p className="mb-4 text-slate-700 dark:text-slate-300">
          The Assessment 3 walkthrough covers the operations dashboard, the
          metrics and health endpoints, database seeding, the Playwright and
          JMeter test results, and the Lighthouse accessibility audits.
        </p>
        <video controls preload="metadata" className="w-full rounded-lg mb-6">
          <source src="/22555388_Assignment3_Recording.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

      </section>
    </div>
  );
}